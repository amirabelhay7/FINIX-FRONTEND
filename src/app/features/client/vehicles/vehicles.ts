import { Component, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CreateRequestLoanPayload } from '../../../models/credit.model';
import { AuthService } from '../../../services/auth/auth.service';
import { Credit } from '../../../services/credit/credit.service';

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

interface UploadFileState {
  cinDoc: File | null;
  payslipDoc: File | null;
  bankStatementDoc: File | null;
  workProofDoc: File | null;
  addressProofDoc: File | null;
  optionalDocs: File[];
}

@Component({
  selector: 'app-client-vehicles',
  standalone: false,
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css',
})
export class ClientVehicles implements OnDestroy {
  readonly minDureeMois = 12;
  readonly maxDureeMois = 60;
  readonly dureeOptions = [12, 24, 36, 48, 60];
  readonly maritalStatusOptions: MaritalStatus[] = ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve'];
  readonly employmentOptions: EmploymentType[] = ['Salarié', 'Indépendant', 'Sans emploi', 'Étudiant', 'Retraité'];
  readonly repaymentTypeOptions: RepaymentType[] = ['Mensualités fixes', 'Mensualités flexibles'];
  readonly annualInterestRate = 0.08;

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

    // 2) Informations du crédit
    montantDemande: 0,
    apportPersonnel: 0,
    dureeMois: this.minDureeMois,
    mensualiteEstimee: 0,
    objectifCredit: 'Achat véhicule',
    repaymentType: 'Mensualités fixes' as RepaymentType,
    demandePeriodeGrace: false,

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

  catalogVehicles: VehicleCatalogItem[] = [
    {
      id: 101,
      marque: 'TOYOTA',
      modele: 'Yaris Cross',
      prixTnd: 52900,
      subtitle: 'SUV · Hybride · 2024',
      emoji: '🚗',
      annee: 2024,
      vendeur: 'AutoMall Tunis',
      etat: 'Neuf',
      reference: 'VEH-TYT-YRX-2024-101',
    },
    {
      id: 102,
      marque: 'KIA',
      modele: 'Sportage',
      prixTnd: 68500,
      subtitle: 'SUV · Diesel · 2024',
      emoji: '🚙',
      annee: 2024,
      vendeur: 'Kia Motors Ariana',
      etat: 'Neuf',
      reference: 'VEH-KIA-SPT-2024-102',
    },
    {
      id: 103,
      marque: 'VOLKSWAGEN',
      modele: 'Golf',
      prixTnd: 58000,
      subtitle: 'Berline · Essence · 2023',
      emoji: '🏎️',
      annee: 2023,
      vendeur: 'VW Approved Sousse',
      etat: 'Très bon état',
      reference: 'VEH-VWG-GLF-2023-103',
    },
  ];

  constructor(
    private creditService: Credit,
    private authService: AuthService,
  ) {}

  ngOnDestroy(): void {
    this.clearToastTimer();
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

    // Mensualite estimée avec un taux annuel de référence.
    const monthlyRate = this.annualInterestRate / 12;
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
    this.showTopToast('Brouillon enregistré localement.');
  }

  onSingleFileSelected(
    field: Exclude<keyof UploadFileState, 'optionalDocs'>,
    event: Event,
  ): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.uploadState[field] = file;
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
      this.submitError = 'Utilisateur connecté introuvable. Veuillez vous reconnecter.';
      return;
    }

    const vehiculeId = this.findVehicleId(this.selectedVehicle.marque, this.selectedVehicle.modele, this.selectedVehicle.prixTnd);
    if (!vehiculeId) {
      this.submitError = 'Véhicule introuvable pour cette sélection.';
      return;
    }

    this.recalculateMensualite();
    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = '';

    const payload: CreateRequestLoanPayload = {
      montantDemande: Number(this.requestForm.montantDemande),
      apportPersonnel: Number(this.requestForm.apportPersonnel),
      dureeMois: Number(this.requestForm.dureeMois),
      mensualiteEstimee: Number(this.requestForm.mensualiteEstimee),
      objectifCredit: this.requestForm.objectifCredit || 'Achat véhicule',
      fullName: this.requestForm.fullName,
      dateOfBirth: this.requestForm.dateOfBirth ? new Date(this.requestForm.dateOfBirth).toISOString() : undefined,
      cinNumber: this.requestForm.cinNumber,
      address: this.requestForm.address,
      phone: this.requestForm.phone,
      email: this.requestForm.email,
      situationFamiliale: this.requestForm.maritalStatus,
      typeEmploi: this.requestForm.employmentType,
      revenuMensuelEstime: Number(this.requestForm.estimatedMonthlyIncome) || 0,
      typeRemboursementSouhaite: this.requestForm.repaymentType,
      demandePeriodeGrace: this.requestForm.demandePeriodeGrace,
      confirmExactitudeInformations: this.requestForm.infoAccuracyConfirmed,
      autorisationVerificationDocuments: this.requestForm.documentsCheckAuthorized,
      acceptationConditionsGenerales: this.requestForm.termsAccepted,
      consentementTraitementDonnees: this.requestForm.personalDataConsent,
      docCinFourni: !!this.uploadState.cinDoc,
      docFichePaieFournie: !!this.uploadState.payslipDoc,
      docReleveBancaireFourni: !!this.uploadState.bankStatementDoc,
      docAttestationTravailFournie: !!this.uploadState.workProofDoc,
      docJustificatifDomicileFourni: !!this.uploadState.addressProofDoc,
      nombreDocumentsOptionnels: this.uploadState.optionalDocs.length,
      statutDemande: 'PENDING',
      userId,
      vehiculeId,
      dateCreation: new Date().toISOString(),
    };

    this.creditService.createRequestLoan(payload).subscribe({
      next: () => {
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
        this.showTopToast('La demande de crédit a été envoyée avec succès.');
      },
      error: (error: unknown) => {
        this.isSubmitting = false;
        this.submitError = this.extractBackendErrorMessage(error, 'Echec de l envoi de la demande.');
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

  private findVehicleId(marque: string, modele: string, prixTnd: number): number | null {
    const match = this.catalogVehicles.find(
      (item) =>
        item.marque.toLowerCase() === marque.toLowerCase() &&
        item.modele.toLowerCase() === modele.toLowerCase() &&
        item.prixTnd === prixTnd,
    );

    return match ? match.id : null;
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
      montantDemande: amount,
      apportPersonnel: 0,
      dureeMois: this.minDureeMois,
      mensualiteEstimee: 0,
      objectifCredit: 'Achat véhicule',
      repaymentType: 'Mensualités fixes' as RepaymentType,
      demandePeriodeGrace: false,
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
        objectifCredit: 'Achat véhicule',
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
    bankStatementDocName: string | null;
    workProofDocName: string | null;
    addressProofDocName: string | null;
    optionalDocNames: string[];
  } {
    return {
      cinDocName: this.uploadState.cinDoc?.name ?? null,
      payslipDocName: this.uploadState.payslipDoc?.name ?? null,
      bankStatementDocName: this.uploadState.bankStatementDoc?.name ?? null,
      workProofDocName: this.uploadState.workProofDoc?.name ?? null,
      addressProofDocName: this.uploadState.addressProofDoc?.name ?? null,
      optionalDocNames: this.uploadState.optionalDocs.map((f) => f.name),
    };
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

  private validateAdvancedForm(setError: boolean): boolean {
    const requiredTextValues = [
      this.requestForm.fullName,
      this.requestForm.dateOfBirth,
      this.requestForm.cinNumber,
      this.requestForm.address,
      this.requestForm.phone,
      this.requestForm.email,
    ];
    const hasRequiredText = requiredTextValues.every((value) => String(value || '').trim().length > 0);
    const hasIncome = Number(this.requestForm.estimatedMonthlyIncome) > 0;
    const hasAmount = Number(this.requestForm.montantDemande) > 0;
    const hasDocs =
      !!this.uploadState.cinDoc &&
      !!this.uploadState.payslipDoc &&
      !!this.uploadState.bankStatementDoc &&
      !!this.uploadState.workProofDoc &&
      !!this.uploadState.addressProofDoc;
    const hasConsent =
      this.requestForm.infoAccuracyConfirmed &&
      this.requestForm.documentsCheckAuthorized &&
      this.requestForm.termsAccepted &&
      this.requestForm.personalDataConsent;
    const isValid = hasRequiredText && hasIncome && hasAmount && hasDocs && hasConsent;
    if (!isValid && setError) {
      this.submitError =
        'Veuillez compléter les champs requis, téléverser les documents obligatoires et cocher tous les consentements.';
    }
    return isValid;
  }
}
