import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { concatMap, finalize, from, Observable, of, timeout, toArray } from 'rxjs';
import { CreateRequestLoanPayload, RequestLoanDto } from '../../../models/credit.model';
import { AuthService } from '../../../services/auth/auth.service';
import { Credit } from '../../../services/credit/credit.service';
import { Vehicle, VehicleApiDto } from '../../../services/vehicle/vehicle.service';

interface VehicleCatalogItem {
  id: number;
  marque: string;
  modele: string;
  prixTnd: number;
  subtitle: string;
  emoji: string;
  annee: number;
  vendeur: string;
  etat: string;
  reference: string;
}

type MaritalStatus = 'Célibataire' | 'Marié(e)' | 'Divorcé(e)' | 'Veuf/Veuve';
type EmploymentType = 'Salarié' | 'Indépendant' | 'Sans emploi' | 'Étudiant' | 'Retraité';
type RepaymentType = 'Mensualités fixes' | 'Mensualités flexibles';
type GuaranteeType = 'VEHICULE' | 'IMMOBILIERE' | 'CAUTION' | 'AUCUNE';

interface UploadFileState {
  cinDoc: File | null;
  payslipDoc: File | null;
  bankStatementDocs: File[];
  workProofDoc: File | null;
  optionalDocs: File[];
}

@Component({
  selector: 'app-client-vehicles',
  standalone: false,
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class ClientVehicles implements OnInit, OnDestroy {
  readonly minDureeMois = 12;
  readonly maxDureeMois = 60;
  readonly dureeOptions = [12, 24, 36, 48, 60];
  readonly maritalStatusOptions: MaritalStatus[] = ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve'];
  readonly employmentOptions: EmploymentType[] = ['Salarié', 'Indépendant', 'Sans emploi', 'Étudiant', 'Retraité'];
  readonly repaymentTypeOptions: RepaymentType[] = ['Mensualités fixes', 'Mensualités flexibles'];
  readonly defaultAnnualInterestRate = 0.08;
  readonly guaranteeTypeOptions: Array<{ value: GuaranteeType; label: string }> = [
    { value: 'VEHICULE', label: 'Vehicle' },
    { value: 'IMMOBILIERE', label: 'Real estate' },
    { value: 'CAUTION', label: 'Joint surety' },
    { value: 'AUCUNE', label: 'No guarantee' },
  ];

  showRequestLoanModal = false;
  selectedVehicle: VehicleCatalogItem | null = null;

  useApportPersonnel = false;

  requestForm = {
    // 1) Informations personnelles
    fullName: '',
    dateOfBirth: '',
    cinNumber: '',
    address: '',
    phone: '',
    email: '',
    maritalStatus: 'Célibataire' as MaritalStatus,
    employmentType: 'Salarié' as EmploymentType,
    estimatedMonthlyIncome: 0,
    revenuMensuelBrut: 0,
    chargesMensuelles: 0,
    revenuMensuelNet: 0,

    // 2) Informations du crédit
    montantDemande: 0,
    apportPersonnel: 0,
    dureeMois: this.minDureeMois,
    tauxAnnuel: this.defaultAnnualInterestRate * 100,
    mensualiteEstimee: 0,
    objectifCredit: 'Vehicle purchase',
    repaymentType: 'Mensualités fixes' as RepaymentType,
    demandePeriodeGrace: false,
    garantieType: 'VEHICULE' as GuaranteeType,
    garantieValeurEstimee: 0,

    // 5) Consentements
    infoAccuracyConfirmed: false,
    documentsCheckAuthorized: false,
    termsAccepted: false,
    personalDataConsent: false,
  };
  uploadState: UploadFileState = this.createInitialUploadState();

  isSubmitting = false;
  isSavingDraft = false;
  submitError = '';
  submitSuccess = '';

  /** Bannière en haut de la page (auto-masquée après 5 s). */
  toastMessage = '';
  private toastClearHandle: ReturnType<typeof setTimeout> | null = null;
  private readonly draftStorageKey = 'finix_credit_car_loan_draft';
  private readonly draftStorageCollectionKey = 'finix_credit_car_loan_drafts';

  catalogVehicles: VehicleCatalogItem[] = [];
  isLoadingCatalog = false;
  catalogLoadError = '';

  constructor(
    private creditService: Credit,
    private authService: AuthService,
    private vehicleService: Vehicle,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.loadCatalogVehicles();
  }

  ngOnDestroy(): void {
    this.clearToastTimer();
  }

  private loadCatalogVehicles(): void {
    this.setCatalogLoading(true);
    this.catalogLoadError = '';
    this.vehicleService
      .getVehicles()
      .pipe(
        timeout(15000),
        finalize(() => this.setCatalogLoading(false)),
      )
      .subscribe({
        next: (vehicles: unknown) => {
          const rows = this.extractVehicleRows(vehicles);
          this.catalogVehicles = rows.map((v, index) => this.mapVehicleFromApi(v, index));
        },
        error: () => {
          this.catalogVehicles = [];
          this.catalogLoadError = 'Unable to load catalog right now.';
          this.setCatalogLoading(false);
        },
      });
  }

  private setCatalogLoading(value: boolean): void {
    this.ngZone.run(() => {
      this.isLoadingCatalog = value;
      this.cdr.markForCheck();
    });
  }

  getMaritalStatusLabel(value: MaritalStatus): string {
    switch (value) {
      case 'Célibataire':
        return 'Single';
      case 'Marié(e)':
        return 'Married';
      case 'Divorcé(e)':
        return 'Divorced';
      case 'Veuf/Veuve':
        return 'Widowed';
      default:
        return value;
    }
  }

  getEmploymentTypeLabel(value: EmploymentType): string {
    switch (value) {
      case 'Salarié':
        return 'Employee';
      case 'Indépendant':
        return 'Self-employed';
      case 'Sans emploi':
        return 'Unemployed';
      case 'Étudiant':
        return 'Student';
      case 'Retraité':
        return 'Retired';
      default:
        return value;
    }
  }

  getRepaymentTypeLabel(value: RepaymentType): string {
    switch (value) {
      case 'Mensualités fixes':
        return 'Fixed installments';
      case 'Mensualités flexibles':
        return 'Flexible installments';
      default:
        return value;
    }
  }

  private extractVehicleRows(response: unknown): VehicleApiDto[] {
    if (Array.isArray(response)) {
      return response.filter((row) => !!row) as VehicleApiDto[];
    }

    const anyResponse = response as any;
    if (Array.isArray(anyResponse?.content)) {
      return anyResponse.content.filter((row: unknown) => !!row) as VehicleApiDto[];
    }

    if (Array.isArray(anyResponse?.data)) {
      return anyResponse.data.filter((row: unknown) => !!row) as VehicleApiDto[];
    }

    return [];
  }

  private mapVehicleFromApi(vehicle: VehicleApiDto, index: number): VehicleCatalogItem {
    const fallbackId = Number(vehicle?.id) || index + 1;
    return {
      id: fallbackId,
      marque: (vehicle?.marque || 'Vehicle').toUpperCase(),
      modele: vehicle?.modele || `Reference ${fallbackId}`,
      prixTnd: Number(vehicle?.prixTnd) || 0,
      subtitle: 'Catalogue FINIX',
      emoji: '🚗',
      annee: new Date().getFullYear(),
      vendeur: 'FINIX partner',
      etat: vehicle?.active === false ? 'Unavailable' : 'Available',
      reference: `VEH-${fallbackId}`,
    };
  }

  private clearToastTimer(): void {
    if (this.toastClearHandle !== null) {
      clearTimeout(this.toastClearHandle);
      this.toastClearHandle = null;
    }
  }

  private showTopToast(message: string, durationMs = 5000): void {
    this.clearToastTimer();
    this.toastMessage = message;
    this.toastClearHandle = setTimeout(() => {
      this.toastMessage = '';
      this.toastClearHandle = null;
    }, durationMs);
  }

  openRequestLoanModal(vehicle: VehicleCatalogItem): void {
    this.selectedVehicle = vehicle;
    this.useApportPersonnel = false;
    this.requestForm = this.createDefaultRequestForm(vehicle);
    this.uploadState = this.createInitialUploadState();
    this.hydrateUserIdentity();
    this.loadDraftIfAny(vehicle);
    this.recalculateMensualite();
    this.submitError = '';
    this.submitSuccess = '';
    this.showRequestLoanModal = true;
  }

  closeRequestLoanModal(): void {
    this.showRequestLoanModal = false;
  }

  /** Réinitialise l’état du formulaire après envoi réussi (rafraîchit l’UI comme un nouveau chargement). */
  private resetRequestLoanFormAfterSubmit(): void {
    this.selectedVehicle = null;
    this.useApportPersonnel = false;
    this.requestForm = this.createDefaultRequestForm();
    this.uploadState = this.createInitialUploadState();
  }

  onUseApportPersonnelChange(checked: boolean): void {
    this.useApportPersonnel = checked;
    if (!checked) {
      this.requestForm.apportPersonnel = 0;
    }
    this.recalculateMensualite();
  }

  recalculateMensualite(): void {
    const duree = Math.min(this.maxDureeMois, Math.max(this.minDureeMois, Number(this.requestForm.dureeMois) || this.minDureeMois));
    this.requestForm.dureeMois = duree;

    const totalPrix =
      (this.selectedVehicle?.prixTnd ?? Number(this.requestForm.montantDemande)) || 0;
    const rawApport = this.useApportPersonnel ? Math.max(0, Number(this.requestForm.apportPersonnel) || 0) : 0;
    // Apport cannot exceed the vehicle total price.
    const apport = Math.min(rawApport, totalPrix);
    this.requestForm.apportPersonnel = apport;

    // Montant demande reacts with apport: montantDemande = prixVehicule - apport
    const montantDemande = Math.max(0, totalPrix - apport);
    this.requestForm.montantDemande = montantDemande;
    this.requestForm.garantieValeurEstimee = totalPrix;
    this.requestForm.revenuMensuelNet = Math.max(
      0,
      Number(this.requestForm.revenuMensuelBrut || this.requestForm.estimatedMonthlyIncome) - Number(this.requestForm.chargesMensuelles || 0),
    );
    this.requestForm.estimatedMonthlyIncome = this.requestForm.revenuMensuelNet;

    // Mensualite estimée avec taux annuel fourni dans le formulaire.
    const annualRateInput = Math.max(0, Number(this.requestForm.tauxAnnuel) || this.defaultAnnualInterestRate * 100);
    this.requestForm.tauxAnnuel = annualRateInput;
    const monthlyRate = (annualRateInput / 100) / 12;
    if (monthlyRate === 0) {
      this.requestForm.mensualiteEstimee = Number((montantDemande / duree).toFixed(2));
      return;
    }
    const factor = Math.pow(1 + monthlyRate, duree);
    const payment = montantDemande * monthlyRate * factor / (factor - 1);
    this.requestForm.mensualiteEstimee = Number(payment.toFixed(2));
  }

  get canSubmit(): boolean {
    return this.validateAdvancedForm(false);
  }

  saveDraft(): void {
    if (!this.selectedVehicle) return;

    this.isSavingDraft = true;
    this.submitError = '';
    this.submitSuccess = '';

    this.recalculateMensualite();
    const draft = {
      vehicleId: this.selectedVehicle.id,
      useApportPersonnel: this.useApportPersonnel,
      requestForm: this.requestForm,
      uploadState: this.serializeUploadStateForDraft(),
      savedAt: new Date().toISOString(),
    };
    const drafts = this.getAllLocalDrafts();
    drafts[this.selectedVehicle.id] = draft;
    localStorage.setItem(this.draftStorageCollectionKey, JSON.stringify(drafts));
    // Backward compatibility for old flow reading a single key.
    localStorage.setItem(this.draftStorageKey, JSON.stringify(draft));
    this.isSavingDraft = false;
    this.showTopToast('Draft saved locally.');
  }

  onSingleFileSelected(
    field: Exclude<keyof UploadFileState, 'optionalDocs' | 'bankStatementDocs'>,
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.uploadState[field] = file;
  }

  onBankStatementFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).slice(0, 3);
    this.uploadState.bankStatementDocs = files;
  }

  onOptionalFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.uploadState.optionalDocs = files;
  }

  removeOptionalDoc(index: number): void {
    this.uploadState.optionalDocs = this.uploadState.optionalDocs.filter((_, i) => i !== index);
  }

  submitRequestLoan(): void {
    if (!this.selectedVehicle) {
      return;
    }
    if (!this.validateAdvancedForm(true)) {
      return;
    }

    const userId = this.getConnectedUserId();
    if (!userId) {
      this.submitError = 'Signed-in user not found. Please sign in again.';
      return;
    }

    this.recalculateMensualite();
    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = '';
    const payloadWithVehicle = this.buildCreateRequestLoanPayload(userId, true);
    this.creditService.createRequestLoan(payloadWithVehicle).pipe(timeout(15000)).subscribe({
      next: (createdLoan: RequestLoanDto) => {
        const requestLoanId = Number(createdLoan?.idDemande);
        if (!requestLoanId) {
          this.isSubmitting = false;
          this.submitError = 'Request created, but request ID not found to link documents.';
          return;
        }
        this.uploadLoanDocuments(requestLoanId).subscribe({
          next: () => this.handleSubmitSuccess(createdLoan),
          error: (uploadError: unknown) => {
            this.isSubmitting = false;
            this.submitError = this.extractBackendErrorMessage(
              uploadError,
              'Request created, but document upload failed.',
            );
          },
        });
      },
      error: (error: unknown) => {
        const msg = this.extractBackendErrorMessage(error, 'Failed to submit request.');
        const vehicleNotFound = msg.toLowerCase().includes('véhicule introuvable')
          || msg.toLowerCase().includes('vehicule introuvable');

        // Fallback for environments where frontend catalog IDs do not match DB vehicle IDs.
        if (vehicleNotFound) {
          const payloadWithoutVehicle = this.buildCreateRequestLoanPayload(userId, false);
          this.creditService.createRequestLoan(payloadWithoutVehicle).pipe(timeout(15000)).subscribe({
            next: (createdLoan: RequestLoanDto) => {
              const requestLoanId = Number(createdLoan?.idDemande);
              if (!requestLoanId) {
                this.isSubmitting = false;
                this.submitError = 'Request created, but request ID not found to link documents.';
                return;
              }
              this.uploadLoanDocuments(requestLoanId).subscribe({
                next: () => {
                  this.handleSubmitSuccess(createdLoan);
                  this.showTopToast('Request submitted (without backend vehicle link).');
                },
                error: (uploadError: unknown) => {
                  this.isSubmitting = false;
                  this.submitError = this.extractBackendErrorMessage(
                    uploadError,
                    'Request created, but document upload failed.',
                  );
                },
              });
            },
            error: (retryError: unknown) => {
              this.isSubmitting = false;
              this.submitError = this.extractBackendErrorMessage(retryError, 'Failed to submit request.');
            },
          });
          return;
        }

        this.isSubmitting = false;
        this.submitError = msg;
      },
    });
  }

  private extractBackendErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }
    const backendError = error.error as
      | { message?: string; error?: string; details?: string }
      | string
      | null
      | undefined;
    if (typeof backendError === 'string' && backendError.trim().length > 0) {
      return backendError;
    }
    if (backendError && typeof backendError === 'object') {
      if (typeof backendError.message === 'string' && backendError.message.trim().length > 0) {
        return backendError.message;
      }
      if (typeof backendError.details === 'string' && backendError.details.trim().length > 0) {
        return backendError.details;
      }
      if (typeof backendError.error === 'string' && backendError.error.trim().length > 0) {
        return backendError.error;
      }
    }
    return fallback;
  }

  private getConnectedUserId(): number | null {
    const payload = this.authService.getPayload();
    if (payload?.userId) {
      return payload.userId;
    }

    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) {
        return null;
      }

      const user = JSON.parse(raw);
      return typeof user.userId === 'number' ? user.userId : null;
    } catch {
      return null;
    }
  }

  private buildCreateRequestLoanPayload(userId: number, includeVehicleId: boolean): CreateRequestLoanPayload {
    return {
      montantDemande: Number(this.requestForm.montantDemande),
      apportPersonnel: Number(this.requestForm.apportPersonnel),
      dureeMois: Number(this.requestForm.dureeMois),
      mensualiteEstimee: Number(this.requestForm.mensualiteEstimee),
      objectifCredit: 'Achat véhicule',
      fullName: this.requestForm.fullName,
      dateOfBirth: this.requestForm.dateOfBirth ? new Date(this.requestForm.dateOfBirth).toISOString() : undefined,
      cinNumber: this.requestForm.cinNumber,
      address: this.requestForm.address,
      phone: this.requestForm.phone,
      email: this.requestForm.email,
      situationFamiliale: this.requestForm.maritalStatus,
      typeEmploi: this.requestForm.employmentType,
      revenuMensuelEstime: Number(this.requestForm.estimatedMonthlyIncome) || 0,
      tauxAnnuel: Number(this.requestForm.tauxAnnuel) || 0,
      revenuMensuelBrut: Number(this.requestForm.revenuMensuelBrut) || 0,
      revenuMensuelNet: Number(this.requestForm.revenuMensuelNet) || 0,
      chargesMensuelles: Number(this.requestForm.chargesMensuelles) || 0,
      garantieType: this.requestForm.garantieType,
      garantieValeurEstimee: Number(this.requestForm.garantieValeurEstimee) || 0,
      typeRemboursementSouhaite: this.requestForm.repaymentType,
      demandePeriodeGrace: this.requestForm.demandePeriodeGrace,
      confirmExactitudeInformations: this.requestForm.infoAccuracyConfirmed,
      autorisationVerificationDocuments: this.requestForm.documentsCheckAuthorized,
      acceptationConditionsGenerales: this.requestForm.termsAccepted,
      consentementTraitementDonnees: this.requestForm.personalDataConsent,
      docCinFourni: !!this.uploadState.cinDoc,
      docFichePaieFournie: !!this.uploadState.payslipDoc,
      docReleveBancaireFourni: this.uploadState.bankStatementDocs.length > 0,
      docAttestationTravailFournie: !!this.uploadState.workProofDoc,
      // Backward compatibility: some backend instances still enforce this flag.
      // We keep domicile upload removed in UI, but send true to avoid false negatives.
      docJustificatifDomicileFourni: true,
      nombreDocumentsOptionnels: this.uploadState.optionalDocs.length,
      statutDemande: 'PENDING',
      userId,
      vehiculeId: includeVehicleId ? this.selectedVehicle?.id : undefined,
      dateCreation: new Date().toISOString(),
    };
  }

  private handleSubmitSuccess(createdLoan?: RequestLoanDto): void {
    const submittedVehicleId = this.selectedVehicle?.id;
    this.isSubmitting = false;
    this.submitError = '';
    this.submitSuccess = '';
    this.closeRequestLoanModal();
    this.resetRequestLoanFormAfterSubmit();
    if (submittedVehicleId != null) {
      const drafts = this.getAllLocalDrafts();
      delete drafts[submittedVehicleId];
      localStorage.setItem(this.draftStorageCollectionKey, JSON.stringify(drafts));
    }
    localStorage.removeItem(this.draftStorageKey);
    const autoRejected = createdLoan?.statutDemande === 'REJECTED' || createdLoan?.riskDecision === 'REFUSE_AUTO';
    if (autoRejected) {
      this.showTopToast('Request automatically rejected based on risk score.');
      return;
    }
    this.showTopToast('Credit request submitted successfully and sent for review.');
  }

  private uploadLoanDocuments(requestLoanId: number): Observable<unknown> {
    const uploads: Observable<unknown>[] = [];
    const requiredDocuments: Array<{ type: string; file: File | null }> = [
      { type: 'CIN', file: this.uploadState.cinDoc },
      { type: 'FICHE_PAIE', file: this.uploadState.payslipDoc },
      { type: 'ATTESTATION_TRAVAIL', file: this.uploadState.workProofDoc },
    ];
    requiredDocuments.forEach((doc) => {
      if (doc.file) {
        uploads.push(this.creditService.uploadLoanDocument(requestLoanId, doc.type, doc.file).pipe(timeout(15000)));
      }
    });
    this.uploadState.bankStatementDocs.forEach((file, index) => {
      uploads.push(this.creditService.uploadLoanDocument(requestLoanId, `RELEVE_BANCAIRE_${index + 1}`, file).pipe(timeout(15000)));
    });
    this.uploadState.optionalDocs.forEach((file, index) => {
      uploads.push(this.creditService.uploadLoanDocument(requestLoanId, `OPTIONAL_${index + 1}`, file).pipe(timeout(15000)));
    });
    if (uploads.length === 0) {
      return of([]);
    }
    // Upload one by one to avoid concurrent updates on same request_loan row.
    return from(uploads).pipe(
      concatMap((upload$) => upload$),
      toArray(),
      timeout(30000),
    );
  }

  private createInitialUploadState(): UploadFileState {
    return {
      cinDoc: null,
      payslipDoc: null,
      bankStatementDocs: [],
      workProofDoc: null,
      optionalDocs: [],
    };
  }

  private createDefaultRequestForm(vehicle?: VehicleCatalogItem) {
    const amount = vehicle?.prixTnd ?? 0;
    return {
      fullName: '',
      dateOfBirth: '',
      cinNumber: '',
      address: '',
      phone: '',
      email: '',
      maritalStatus: 'Célibataire' as MaritalStatus,
      employmentType: 'Salarié' as EmploymentType,
      estimatedMonthlyIncome: 0,
      revenuMensuelBrut: 0,
      chargesMensuelles: 0,
      revenuMensuelNet: 0,
      montantDemande: amount,
      apportPersonnel: 0,
      dureeMois: this.minDureeMois,
      tauxAnnuel: this.defaultAnnualInterestRate * 100,
      mensualiteEstimee: 0,
      objectifCredit: 'Vehicle purchase',
      repaymentType: 'Mensualités fixes' as RepaymentType,
      demandePeriodeGrace: false,
      garantieType: 'VEHICULE' as GuaranteeType,
      garantieValeurEstimee: amount,
      infoAccuracyConfirmed: false,
      documentsCheckAuthorized: false,
      termsAccepted: false,
      personalDataConsent: false,
    };
  }

  private hydrateUserIdentity(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return;
      const user = JSON.parse(raw);
      this.requestForm.fullName = user?.name ?? this.requestForm.fullName;
      this.requestForm.email = user?.email ?? this.requestForm.email;
    } catch {
      // no-op
    }
  }

  private loadDraftIfAny(vehicle: VehicleCatalogItem): void {
    try {
      const allDrafts = this.getAllLocalDrafts();
      const draft = allDrafts[vehicle.id] ?? this.getLegacyDraft();
      if (!draft || draft?.vehicleId !== vehicle.id) return;
      this.useApportPersonnel = !!draft.useApportPersonnel;
      this.requestForm = {
        ...this.requestForm,
        ...(draft.requestForm ?? {}),
        objectifCredit: 'Vehicle purchase',
      };
      this.uploadState = this.restoreUploadStateFromDraft(draft.uploadState);
    } catch {
      // no-op
    }
  }

  private getAllLocalDrafts(): Record<number, unknown> {
    try {
      const raw = localStorage.getItem(this.draftStorageCollectionKey);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? (parsed as Record<number, unknown>) : {};
    } catch {
      return {};
    }
  }

  private getLegacyDraft(): any | null {
    try {
      const raw = localStorage.getItem(this.draftStorageKey);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private serializeUploadStateForDraft(): {
    cinDocName: string | null;
    payslipDocName: string | null;
    bankStatementDocNames: string[];
    workProofDocName: string | null;
    optionalDocNames: string[];
  } {
    return {
      cinDocName: this.uploadState.cinDoc?.name ?? null,
      payslipDocName: this.uploadState.payslipDoc?.name ?? null,
      bankStatementDocNames: this.uploadState.bankStatementDocs.map((f) => f.name),
      workProofDocName: this.uploadState.workProofDoc?.name ?? null,
      optionalDocNames: this.uploadState.optionalDocs.map((f) => f.name),
    };
  }

  private restoreUploadStateFromDraft(raw: unknown): UploadFileState {
    const draft = raw as
      | {
          cinDocName?: string | null;
          payslipDocName?: string | null;
          bankStatementDocName?: string | null;
          bankStatementDocNames?: string[];
          workProofDocName?: string | null;
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
      bankStatementDocs: Array.isArray(draft?.bankStatementDocNames)
        ? draft!.bankStatementDocNames
            .filter((name) => typeof name === 'string' && name.trim().length > 0)
            .slice(0, 3)
            .map((name) => new File([''], name, { type: 'application/octet-stream' }))
        : (makePlaceholderFile(draft?.bankStatementDocName) ? [makePlaceholderFile(draft?.bankStatementDocName)!] : []),
      workProofDoc: makePlaceholderFile(draft?.workProofDocName),
      optionalDocs: Array.isArray(draft?.optionalDocNames)
        ? draft!.optionalDocNames
            .filter((name) => typeof name === 'string' && name.trim().length > 0)
            .map((name) => new File([''], name, { type: 'application/octet-stream' }))
        : [],
    };
  }

  private validateAdvancedForm(setError: boolean): boolean {
    const issues = this.getValidationIssues();
    const isValid = issues.length === 0;
    if (!isValid && setError) {
      this.submitError = `Please fix before submitting: ${issues.join(' | ')}`;
    }
    return isValid;
  }

  private getValidationIssues(): string[] {
    const issues: string[] = [];

    const requiredTextValues = [
      ['Full name', this.requestForm.fullName],
      ['Date of birth', this.requestForm.dateOfBirth],
      ['CIN number', this.requestForm.cinNumber],
      ['Address', this.requestForm.address],
      ['Phone', this.requestForm.phone],
      ['Email', this.requestForm.email],
    ] as const;

    requiredTextValues.forEach(([label, value]) => {
      if (String(value || '').trim().length === 0) {
        issues.push(`${label} is missing`);
      }
    });

    if (Number(this.requestForm.estimatedMonthlyIncome) <= 0) {
      issues.push('Invalid monthly income');
    }
    if (Number(this.requestForm.tauxAnnuel) < 0) {
      issues.push('Invalid annual rate');
    }
    if (Number(this.requestForm.revenuMensuelBrut) <= 0) {
      issues.push('Invalid gross monthly income');
    }
    if (Number(this.requestForm.chargesMensuelles) < 0) {
      issues.push('Invalid monthly expenses');
    }
    if (Number(this.requestForm.garantieValeurEstimee) < 0) {
      issues.push('Invalid guarantee value');
    }

    if (Number(this.requestForm.montantDemande) <= 0) {
      issues.push('Invalid requested amount');
    }

    if (!this.uploadState.cinDoc) issues.push('CIN not uploaded');
    if (!this.uploadState.payslipDoc) issues.push('Payslip not uploaded');
    if (this.uploadState.bankStatementDocs.length !== 3) issues.push('Please upload exactly 3 bank statements');
    if (!this.uploadState.workProofDoc) issues.push('Employment certificate not uploaded');
    if (!this.requestForm.infoAccuracyConfirmed) issues.push('Accuracy confirmation not checked');
    if (!this.requestForm.documentsCheckAuthorized) issues.push('Document verification authorization not checked');
    if (!this.requestForm.termsAccepted) issues.push('General terms not accepted');
    if (!this.requestForm.personalDataConsent) issues.push('Personal data consent not checked');

    return issues;
  }
}
