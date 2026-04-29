import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, finalize, of, Subject, takeUntil, timeout } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { Credit } from '../../../services/credit/credit.service';
import { ClientCreditsSearchService } from '../../../services/client-credits-search.service';
import { LoanDocumentDto, RequestLoanDto } from '../../../models/credit.model';

type MaritalStatus = 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf/Veuve';
type EmploymentType = 'Salarié' | 'Indépendant' | 'Sans emploi' | 'Étudiant' | 'Retraité';
type RepaymentType = 'Mensualités fixes' | 'Mensualités flexibles';

interface UploadFileState {
  cinDoc: File | null;
  payslipDoc: File | null;
  bankStatementDoc: File | null;
  workProofDoc: File | null;
  addressProofDoc: File | null;
  optionalDocs: File[];
}

interface LocalCreditDraftSummary {
  vehicleId: number;
  fullName: string;
  amount: number;
  duration: number;
  savedAt: string;
  docsCount: number;
}

@Component({
  selector: 'app-client-credits',
  standalone: false,
  templateUrl: './credits.html',
  styleUrl: './credits.css',
})
export class ClientCredits implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly draftStorageKey = 'finix_credit_car_loan_draft';
  private readonly draftStorageCollectionKey = 'finix_credit_car_loan_drafts';
  allLoans: RequestLoanDto[] = [];
  myLoans: RequestLoanDto[] = [];
  currentPage = 1;
  pageSize = 8;
  readonly pageSizeOptions = [5, 8, 10, 20];
  drafts: LocalCreditDraftSummary[] = [];
  showDrafts = false;

  loading = false;
  error = '';

  selectedLoan: RequestLoanDto | null = null;
  showEditModal = false;
  submitting = false;
  submitError = '';
  submitSuccess = '';

  /** Snapshot: montant demandé (net) + apport = total à financer (fixe à l’ouverture du modal). */
  montantTotalCredit = 0;
  readonly minDureeMois = 12;
  readonly maxDureeMois = 60;
  readonly dureeOptions = [12, 24, 36, 48, 60];
  readonly maritalStatusOptions: MaritalStatus[] = ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve'];
  readonly employmentOptions: EmploymentType[] = ['Salarié', 'Indépendant', 'Sans emploi', 'Étudiant', 'Retraité'];
  readonly repaymentTypeOptions: RepaymentType[] = ['Mensualités fixes', 'Mensualités flexibles'];
  editUploadState: UploadFileState = this.createInitialUploadState();
  isSavingDraft = false;
  loadingExistingDocuments = false;
  existingLoanDocuments: LoanDocumentDto[] = [];

  editForm = {
    fullName: '',
    dateOfBirth: '',
    cinNumber: '',
    address: '',
    phone: '',
    email: '',
    maritalStatus: 'Célibataire' as MaritalStatus,
    employmentType: 'Salarié' as EmploymentType,
    estimatedMonthlyIncome: 0,
    dureeMois: 12,
    mensualiteEstimee: 0,
    apportPersonnel: 0,
    objectifCredit: 'Achat véhicule',
    repaymentType: 'Mensualités fixes' as RepaymentType,
    demandePeriodeGrace: false,
    infoAccuracyConfirmed: false,
    documentsCheckAuthorized: false,
    termsAccepted: false,
    personalDataConsent: false,
  };

  constructor(
    private creditService: Credit,
    private authService: AuthService,
    private clientCreditsSearch: ClientCreditsSearchService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.clientCreditsSearch.searchChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyStatusFilter();
    });
    this.loadMyRequestLoans();
    this.loadDrafts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Message sous la liste vide (aucune donnée API vs filtre sans résultat). */
  get emptyCreditsMessage(): string {
    if (this.loading || this.error) {
      return '';
    }
    if (this.allLoans.length === 0) {
      return 'No credits...';
    }
    if (this.myLoans.length === 0) {
      const q = this.clientCreditsSearch.getSearchQuery().trim().toUpperCase();
      if (q && !['PENDING', 'APPROVED', 'REJECTED'].includes(q)) {
        return 'Saisissez PENDING, APPROVED ou REJECTED.';
      }
      return 'Aucune demande pour ce statut.';
    }
    return '';
  }

  /**
   * Recherche vide → uniquement PENDING (comportement par défaut).
   * Sinon filtre exact (insensible à la casse) sur PENDING | APPROVED | REJECTED.
   */
  private applyStatusFilter(): void {
    // Si aucune donnée → rien à afficher
    if (!this.allLoans.length) {
      this.myLoans = [];
      return;
    }

    // Récupérer la valeur de recherche
    const q = this.clientCreditsSearch.getSearchQuery().trim().toUpperCase();

    // Cas 1 : aucune recherche → afficher TOUS les crédits
    if (!q) {
      this.myLoans = this.allLoans;
      this.currentPage = 1;
      return;
    }

    // Cas 2 : filtre valide → filtrer selon statut
    if (q === 'PENDING' || q === 'APPROVED' || q === 'REJECTED') {
      this.myLoans = this.allLoans.filter((l) => l.statutDemande === q);
      this.currentPage = 1;
      return;
    }

    // Cas 3 : input invalide → aucun résultat
    this.myLoans = [];
    this.currentPage = 1;
  }

  loadMyRequestLoans(): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.loading = false;
      this.allLoans = [];
      this.myLoans = [];
      this.error = 'Utilisateur connecte introuvable (userId manquant).';
      return;
    }

    this.loading = true;
    this.error = '';
    this.allLoans = [];
    this.myLoans = [];
    this.currentPage = 1;

    this.creditService
      .getRequestLoansByUserId(userId, 0, 2000)
      .pipe(
        timeout(15000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        catchError(() => {
          this.error = 'Impossible de charger vos demandes (timeout ou serveur indisponible).';
          return of({ content: [] as RequestLoanDto[] });
        }),
      )
      .subscribe({
        next: (response: any) => {
          const list = Array.isArray((response as any)?.content)
            ? (response as any).content
            : [response as RequestLoanDto];
          this.allLoans = list;
          try {
            this.applyStatusFilter();
          } catch {
            this.myLoans = this.allLoans;
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Impossible de charger vos demandes.';
          this.cdr.detectChanges();
        },
      });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.myLoans.length / this.pageSize));
  }

  get paginatedLoans(): RequestLoanDto[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.myLoans.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPage = Math.min(this.totalPages, Math.max(1, page));
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  onPageSizeChange(value: number): void {
    this.pageSize = Number(value) || 8;
    this.currentPage = 1;
  }

  deletePendingFromList(loan: RequestLoanDto, event: Event): void {
    event.stopPropagation();
    if (loan.statutDemande !== 'PENDING') {
      return;
    }
    this.creditService.deleteRequestLoan(loan.idDemande).subscribe({
      next: () => this.loadMyRequestLoans(),
      error: () => {
        this.error = "Echec de la suppression de la demande.";
      },
    });
  }

  getRowClass(status: RequestLoanDto['statutDemande'] | string | undefined): string {
    switch ((status || '').toUpperCase()) {
      case 'REJECTED':
        return 'status-row-rejected';
      case 'APPROVED':
        return 'status-row-approved';
      case 'PENDING':
        return 'status-row-pending';
      default:
        return 'status-row-default';
    }
  }

  getBadgeClass(status: RequestLoanDto['statutDemande'] | string | undefined): string {
    switch ((status || '').toUpperCase()) {
      case 'REJECTED':
        return 'status-badge badge-rejected';
      case 'APPROVED':
        return 'status-badge badge-approved';
      case 'PENDING':
        return 'status-badge badge-pending';
      default:
        return 'status-badge badge-default';
    }
  }

  toggleDraftsPanel(): void {
    this.showDrafts = !this.showDrafts;
    if (this.showDrafts) {
      this.loadDrafts();
    }
  }

  loadDrafts(): void {
    const normalized: LocalCreditDraftSummary[] = [];
    try {
      const rawCollection = localStorage.getItem(this.draftStorageCollectionKey);
      if (rawCollection) {
        const parsed = JSON.parse(rawCollection) as Record<string, any>;
        Object.values(parsed ?? {}).forEach((d) => {
          const draft = this.normalizeDraft(d);
          if (draft) normalized.push(draft);
        });
      }
    } catch {
      // no-op
    }

    if (normalized.length === 0) {
      try {
        const rawLegacy = localStorage.getItem(this.draftStorageKey);
        if (rawLegacy) {
          const draft = this.normalizeDraft(JSON.parse(rawLegacy));
          if (draft) normalized.push(draft);
        }
      } catch {
        // no-op
      }
    }

    this.drafts = normalized.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  }

  removeDraft(vehicleId: number): void {
    try {
      const rawCollection = localStorage.getItem(this.draftStorageCollectionKey);
      if (rawCollection) {
        const parsed = JSON.parse(rawCollection) as Record<string, unknown>;
        delete parsed[String(vehicleId)];
        localStorage.setItem(this.draftStorageCollectionKey, JSON.stringify(parsed));
      }
      const rawLegacy = localStorage.getItem(this.draftStorageKey);
      if (rawLegacy) {
        const legacy = JSON.parse(rawLegacy) as { vehicleId?: number };
        if (legacy?.vehicleId === vehicleId) {
          localStorage.removeItem(this.draftStorageKey);
        }
      }
      this.loadDrafts();
    } catch {
      // no-op
    }
  }

  private normalizeDraft(raw: any): LocalCreditDraftSummary | null {
    if (!raw || typeof raw !== 'object' || typeof raw.vehicleId !== 'number') {
      return null;
    }
    const requestForm = (raw.requestForm ?? {}) as {
      fullName?: string;
      montantDemande?: number;
      dureeMois?: number;
    };
    const uploadState = raw.uploadState as { optionalDocNames?: unknown[] } | undefined;
    const docsCount = [
      uploadState?.optionalDocNames?.length ?? 0,
      raw?.uploadState?.cinDocName ? 1 : 0,
      raw?.uploadState?.payslipDocName ? 1 : 0,
      raw?.uploadState?.bankStatementDocName ? 1 : 0,
      raw?.uploadState?.workProofDocName ? 1 : 0,
      raw?.uploadState?.addressProofDocName ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    return {
      vehicleId: raw.vehicleId,
      fullName: requestForm.fullName || '-',
      amount: Number(requestForm.montantDemande) || 0,
      duration: Number(requestForm.dureeMois) || 0,
      savedAt: typeof raw.savedAt === 'string' ? raw.savedAt : new Date().toISOString(),
      docsCount,
    };
  }

  openEditModal(loan: RequestLoanDto): void {
    if (loan.statutDemande !== 'PENDING') {
      return;
    }

    this.selectedLoan = loan;
    const net = Number(loan.montantDemande) || 0;
    const ap = Math.max(0, Number(loan.apportPersonnel) || 0);
    this.montantTotalCredit = net + ap;
    this.editForm.apportPersonnel = Math.min(ap, this.montantTotalCredit);
    this.editForm.dureeMois = Math.max(12, Math.min(60, Number(loan.dureeMois) || 12));
    this.editForm.fullName = loan.fullName ?? '';
    this.editForm.dateOfBirth = loan.dateOfBirth ? new Date(loan.dateOfBirth).toISOString().slice(0, 10) : '';
    this.editForm.cinNumber = loan.cinNumber ?? '';
    this.editForm.address = loan.address ?? '';
    this.editForm.phone = loan.phone ?? '';
    this.editForm.email = loan.email ?? '';
    this.editForm.maritalStatus = (loan.situationFamiliale as MaritalStatus) ?? 'Célibataire';
    this.editForm.employmentType = (loan.typeEmploi as EmploymentType) ?? 'Salarié';
    this.editForm.estimatedMonthlyIncome = Number(loan.revenuMensuelEstime) || 0;
    this.editForm.objectifCredit = loan.objectifCredit || 'Achat véhicule';
    this.editForm.repaymentType = (loan.typeRemboursementSouhaite as RepaymentType) ?? 'Mensualités fixes';
    this.editForm.demandePeriodeGrace = !!loan.demandePeriodeGrace;
    this.editForm.infoAccuracyConfirmed = !!loan.confirmExactitudeInformations;
    this.editForm.documentsCheckAuthorized = !!loan.autorisationVerificationDocuments;
    this.editForm.termsAccepted = !!loan.acceptationConditionsGenerales;
    this.editForm.personalDataConsent = !!loan.consentementTraitementDonnees;
    this.editUploadState = this.createUploadStateFromLoan(loan);
    this.recalculateMensualite();
    this.submitError = '';
    this.submitSuccess = '';
    this.loadEditDraftIfAny(loan.idDemande);
    this.loadExistingDocuments(loan.idDemande);
    this.showEditModal = true;
  }

  /** Montant demandé (TND) affiché = part financée après déduction de l’apport. */
  get montantDemandeNet(): number {
    const cap = this.montantTotalCredit;
    const ap = Math.max(0, Math.min(cap, Number(this.editForm.apportPersonnel) || 0));
    return Math.max(0, cap - ap);
  }

  onApportPersonnelChange(): void {
    const cap = this.montantTotalCredit;
    let v = Number(this.editForm.apportPersonnel);
    if (Number.isNaN(v)) {
      v = 0;
    }
    this.editForm.apportPersonnel = Math.max(0, Math.min(cap, v));
    this.recalculateMensualite();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedLoan = null;
    this.montantTotalCredit = 0;
    this.editUploadState = this.createInitialUploadState();
    this.existingLoanDocuments = [];
    this.submitError = '';
    this.submitSuccess = '';
  }

  recalculateMensualite(): void {
    if (!this.selectedLoan) {
      return;
    }

    const duree = Math.max(12, Math.min(60, Number(this.editForm.dureeMois) || 12));
    this.editForm.dureeMois = duree;

    const principal = this.montantDemandeNet;
    this.editForm.mensualiteEstimee = duree > 0 ? Number((principal / duree).toFixed(2)) : 0;
  }

  saveEditDraft(): void {
    if (!this.selectedLoan) {
      return;
    }
    this.isSavingDraft = true;
    this.recalculateMensualite();
    const key = `finix_credit_edit_modal_draft_${this.selectedLoan.idDemande}`;
    const draft = {
      requestId: this.selectedLoan.idDemande,
      editForm: this.editForm,
      uploadState: this.serializeUploadStateForDraft(this.editUploadState),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(draft));
    this.isSavingDraft = false;
    this.submitError = '';
    this.submitSuccess = 'Brouillon de modification enregistré localement.';
  }

  validateModification(): void {
    if (!this.selectedLoan) {
      return;
    }
    if (!this.validateAdvancedEditForm(true)) {
      return;
    }

    this.submitting = true;
    this.submitError = '';
    this.submitSuccess = '';

    this.creditService
      .updateRequestLoan(this.selectedLoan.idDemande, {
        fullName: this.editForm.fullName,
        dateOfBirth: this.editForm.dateOfBirth ? new Date(this.editForm.dateOfBirth).toISOString() : undefined,
        cinNumber: this.editForm.cinNumber,
        address: this.editForm.address,
        phone: this.editForm.phone,
        email: this.editForm.email,
        situationFamiliale: this.editForm.maritalStatus,
        typeEmploi: this.editForm.employmentType,
        revenuMensuelEstime: Number(this.editForm.estimatedMonthlyIncome) || 0,
        dureeMois: this.editForm.dureeMois,
        montantDemande: this.montantDemandeNet,
        apportPersonnel: Number(this.editForm.apportPersonnel) || 0,
        mensualiteEstimee: this.editForm.mensualiteEstimee,
        objectifCredit: this.editForm.objectifCredit || 'Achat véhicule',
        typeRemboursementSouhaite: this.editForm.repaymentType,
        demandePeriodeGrace: this.editForm.demandePeriodeGrace,
        confirmExactitudeInformations: this.editForm.infoAccuracyConfirmed,
        autorisationVerificationDocuments: this.editForm.documentsCheckAuthorized,
        acceptationConditionsGenerales: this.editForm.termsAccepted,
        consentementTraitementDonnees: this.editForm.personalDataConsent,
        docCinFourni: !!this.editUploadState.cinDoc,
        docFichePaieFournie: !!this.editUploadState.payslipDoc,
        docReleveBancaireFourni: !!this.editUploadState.bankStatementDoc,
        docAttestationTravailFournie: !!this.editUploadState.workProofDoc,
        docJustificatifDomicileFourni: !!this.editUploadState.addressProofDoc,
        nombreDocumentsOptionnels: this.editUploadState.optionalDocs.length,
        statutDemande: 'PENDING',
      })
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.closeEditModal();
          this.loadMyRequestLoans();
        },
        error: () => {
          this.submitError = 'Echec de la modification de la demande.';
        },
      });
  }

  onSingleFileSelected(
    field: Exclude<keyof UploadFileState, 'optionalDocs'>,
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement;
    this.editUploadState[field] = input.files?.[0] ?? null;
  }

  onOptionalFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.editUploadState.optionalDocs = Array.from(input.files ?? []);
  }

  removeOptionalDoc(index: number): void {
    this.editUploadState.optionalDocs = this.editUploadState.optionalDocs.filter((_, i) => i !== index);
  }

  cancelRequestLoan(): void {
    if (!this.selectedLoan) {
      return;
    }

    this.submitting = true;
    this.submitError = '';
    this.submitSuccess = '';

    this.creditService
      .deleteRequestLoan(this.selectedLoan.idDemande)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.closeEditModal();
          this.loadMyRequestLoans();
        },
        error: () => {
          this.submitError = "Echec de l'annulation de la demande.";
        },
      });
  }

  private getCurrentUserId(): number | null {
    const payload = this.authService.getPayload();
    if (payload?.userId) {
      return payload.userId;
    }

    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      const user = JSON.parse(raw);
      return typeof user.userId === 'number' ? user.userId : null;
    } catch {
      return null;
    }
  }

  formatDate(value: unknown): string {
    if (!value) return '-';
    const d = new Date(value as string);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString();
  }

  get selectedVehicleInfo(): { marque: string; modele: string; prixTnd: number; reference: string } {
    if (!this.selectedLoan) {
      return { marque: '-', modele: '-', prixTnd: 0, reference: '-' };
    }
    const marque = this.selectedLoan.vehicle?.marque ?? this.selectedLoan.vehiculeMarque ?? this.selectedLoan.marque ?? '-';
    const modele = this.selectedLoan.vehicle?.modele ?? this.selectedLoan.vehiculeModele ?? this.selectedLoan.modele ?? '-';
    const prix = this.selectedLoan.vehicle?.prixTnd
      ?? this.selectedLoan.vehiculePrixTnd
      ?? this.selectedLoan.prixTnd
      ?? this.selectedLoan.prix_tnd
      ?? 0;
    return {
      marque,
      modele,
      prixTnd: Number(prix) || 0,
      reference: `REQ-${this.selectedLoan.idDemande}`,
    };
  }

  private validateAdvancedEditForm(setError: boolean): boolean {
    const requiredText = [
      this.editForm.fullName,
      this.editForm.dateOfBirth,
      this.editForm.cinNumber,
      this.editForm.address,
      this.editForm.phone,
      this.editForm.email,
    ].every((v) => String(v || '').trim().length > 0);

    const hasIncome = Number(this.editForm.estimatedMonthlyIncome) > 0;
    const hasDocs = !!this.editUploadState.cinDoc
      && !!this.editUploadState.payslipDoc
      && !!this.editUploadState.bankStatementDoc
      && !!this.editUploadState.workProofDoc;
    const hasConsents = this.editForm.infoAccuracyConfirmed
      && this.editForm.documentsCheckAuthorized
      && this.editForm.termsAccepted
      && this.editForm.personalDataConsent;

    const valid = requiredText && hasIncome && hasDocs && hasConsents;
    if (!valid && setError) {
      this.submitError = 'Veuillez compléter toutes les informations, documents et consentements.';
    }
    return valid;
  }

  private createInitialUploadState(): UploadFileState {
    return {
      cinDoc: null,
      payslipDoc: null,
      bankStatementDoc: null,
      workProofDoc: null,
      addressProofDoc: null,
      optionalDocs: [],
    };
  }

  private createUploadStateFromLoan(loan: RequestLoanDto): UploadFileState {
    const makePlaceholder = (present?: boolean, label = 'document.pdf'): File | null =>
      present ? new File([''], label, { type: 'application/octet-stream' }) : null;
    const optionalCount = Math.max(0, Number(loan.nombreDocumentsOptionnels) || 0);
    return {
      cinDoc: makePlaceholder(loan.docCinFourni, 'cin.pdf'),
      payslipDoc: makePlaceholder(loan.docFichePaieFournie, 'fiche-paie.pdf'),
      bankStatementDoc: makePlaceholder(loan.docReleveBancaireFourni, 'releve-bancaire.pdf'),
      workProofDoc: makePlaceholder(loan.docAttestationTravailFournie, 'attestation-travail.pdf'),
      addressProofDoc: makePlaceholder(loan.docJustificatifDomicileFourni, 'justificatif-domicile.pdf'),
      optionalDocs: Array.from({ length: optionalCount }, (_, idx) =>
        new File([''], `document-optionnel-${idx + 1}.pdf`, { type: 'application/octet-stream' })),
    };
  }

  private serializeUploadStateForDraft(uploadState: UploadFileState): {
    cinDocName: string | null;
    payslipDocName: string | null;
    bankStatementDocName: string | null;
    workProofDocName: string | null;
    addressProofDocName: string | null;
    optionalDocNames: string[];
  } {
    return {
      cinDocName: uploadState.cinDoc?.name ?? null,
      payslipDocName: uploadState.payslipDoc?.name ?? null,
      bankStatementDocName: uploadState.bankStatementDoc?.name ?? null,
      workProofDocName: uploadState.workProofDoc?.name ?? null,
      addressProofDocName: uploadState.addressProofDoc?.name ?? null,
      optionalDocNames: uploadState.optionalDocs.map((f) => f.name),
    };
  }

  private loadEditDraftIfAny(requestId: number): void {
    try {
      const raw = localStorage.getItem(`finix_credit_edit_modal_draft_${requestId}`);
      if (!raw) {
        return;
      }
      const draft = JSON.parse(raw) as { editForm?: any; uploadState?: any };
      if (draft?.editForm) {
        this.editForm = {
          ...this.editForm,
          ...draft.editForm,
        };
      }
      if (draft?.uploadState) {
        this.editUploadState = this.restoreUploadStateFromDraft(draft.uploadState);
      }
    } catch {
      // no-op
    }
  }

  private restoreUploadStateFromDraft(raw: unknown): UploadFileState {
    const draft = raw as
      | {
          cinDocName?: string | null;
          payslipDocName?: string | null;
          bankStatementDocName?: string | null;
          workProofDocName?: string | null;
          addressProofDocName?: string | null;
          optionalDocNames?: string[];
        }
      | null
      | undefined;

    const makePlaceholderFile = (name?: string | null): File | null =>
      typeof name === 'string' && name.trim().length > 0
        ? new File([''], name, { type: 'application/octet-stream' })
        : null;

    return {
      cinDoc: makePlaceholderFile(draft?.cinDocName),
      payslipDoc: makePlaceholderFile(draft?.payslipDocName),
      bankStatementDoc: makePlaceholderFile(draft?.bankStatementDocName),
      workProofDoc: makePlaceholderFile(draft?.workProofDocName),
      addressProofDoc: makePlaceholderFile(draft?.addressProofDocName),
      optionalDocs: Array.isArray(draft?.optionalDocNames)
        ? draft!.optionalDocNames
            .filter((name) => typeof name === 'string' && name.trim().length > 0)
            .map((name) => new File([''], name, { type: 'application/octet-stream' }))
        : [],
    };
  }

  private loadExistingDocuments(requestLoanId: number): void {
    this.loadingExistingDocuments = true;
    this.existingLoanDocuments = [];
    this.creditService.getLoanDocuments(0, 500).subscribe({
      next: (response) => {
        const docs = Array.isArray(response?.content)
          ? response.content.filter((d) => Number(d.requestLoanId) === Number(requestLoanId))
          : [];
        this.existingLoanDocuments = docs;
        if (docs.length > 0) {
          this.applyExistingDocumentsToEditState(docs);
        }
        this.loadingExistingDocuments = false;
      },
      error: () => {
        this.loadingExistingDocuments = false;
      },
    });
  }

  getExistingDocumentByType(type: string): LoanDocumentDto | undefined {
    return this.existingLoanDocuments.find((d) => (d.typeDocument || '').trim().toUpperCase() === type);
  }

  openExistingDocument(doc: LoanDocumentDto | undefined): void {
    if (!doc?.idDocument) {
      return;
    }
    this.creditService.downloadLoanDocument(doc.idDocument).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: () => {
        this.submitError = 'Impossible de consulter ce document pour le moment.';
      },
    });
  }

  private applyExistingDocumentsToEditState(docs: LoanDocumentDto[]): void {
    const byType = (type: string): LoanDocumentDto | undefined =>
      docs.find((d) => (d.typeDocument || '').trim().toUpperCase() === type);
    const makePlaceholder = (doc?: LoanDocumentDto): File | null =>
      doc?.nomFichier ? new File([''], doc.nomFichier, { type: 'application/octet-stream' }) : null;

    this.editUploadState.cinDoc = makePlaceholder(byType('CIN')) ?? this.editUploadState.cinDoc;
    this.editUploadState.payslipDoc = makePlaceholder(byType('FICHE_PAIE')) ?? this.editUploadState.payslipDoc;
    this.editUploadState.bankStatementDoc =
      makePlaceholder(byType('RELEVE_BANCAIRE')) ?? this.editUploadState.bankStatementDoc;
    this.editUploadState.workProofDoc =
      makePlaceholder(byType('ATTESTATION_TRAVAIL')) ?? this.editUploadState.workProofDoc;
    const optionalDocs = docs
      .filter((d) => (d.typeDocument || '').toUpperCase().startsWith('OPTIONAL_') && d.nomFichier)
      .map((d) => new File([''], d.nomFichier, { type: 'application/octet-stream' }));
    if (optionalDocs.length > 0) {
      this.editUploadState.optionalDocs = optionalDocs;
    }
  }

}
