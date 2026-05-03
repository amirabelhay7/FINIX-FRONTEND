import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import { VehicleService } from '../../../../services/vehicle/vehicle.service';
import { ReservationService } from '../../../../services/vehicle/reservation.service';
import { FinancingRequestService } from '../../../../services/vehicle/financing-request.service';
import { ClientFinancingDocumentService } from '../../../../services/vehicle/client-financing-document.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { Credit } from '../../../../services/credit/credit.service';
import {
  CreateRequestLoanPayload,
  FeedbackType,
  FeedbackVehicleDto,
  ClientDocumentType,
  ClientFinancingDocumentDto,
  FinancingRequestPayload,
  RequestLoanDto,
  VehicleCondition,
  VehicleDto,
  VehicleReservationDto,
  VehicleReservationPayload,
} from '../../../../models';

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
  selector: 'app-client-vehicle-detail',
  standalone: false,
  templateUrl: './client-vehicle-detail.html',
  styleUrl: './client-vehicle-detail.css',
})
export class ClientVehicleDetail implements OnInit {
  vehicle: VehicleDto | null = null;
  isLoading = true;
  loadError = '';

  myReservation: VehicleReservationDto | null = null;
  hasAnyActiveReservation = false;
  reservationPhone = '';
  reservationNotes = '';
  /** yyyy-MM-dd */
  reservationDesiredDate: string | null = null;
  showResModal = false;
  resSubmitting = false;
  resMessage = '';
  /** true = erreur API / validation (style rouge dans la modale). */
  resMessageError = false;
  useApportPersonnel = false;
  readonly minDureeMois = 12;
  readonly maxDureeMois = 60;
  readonly dureeOptions = [12, 24, 36, 48, 60];
  readonly maritalStatusOptions: MaritalStatus[] = ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve'];
  readonly employmentOptions: EmploymentType[] = ['Salarié', 'Indépendant', 'Sans emploi', 'Étudiant', 'Retraité'];
  readonly repaymentTypeOptions: RepaymentType[] = ['Mensualités fixes', 'Mensualités flexibles'];
  readonly guaranteeTypeOptions: Array<{ value: GuaranteeType; label: string }> = [
    { value: 'VEHICULE', label: 'Vehicle' },
    { value: 'IMMOBILIERE', label: 'Real estate' },
    { value: 'CAUTION', label: 'Joint surety' },
    { value: 'AUCUNE', label: 'No guarantee' },
  ];
  requestForm = {
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
    montantDemande: 0,
    apportPersonnel: 0,
    dureeMois: 48,
    tauxAnnuel: 8,
    mensualiteEstimee: 0,
    objectifCredit: 'Achat véhicule',
    repaymentType: 'Mensualités fixes' as RepaymentType,
    demandePeriodeGrace: false,
    garantieType: 'VEHICULE' as GuaranteeType,
    garantieValeurEstimee: 0,
    infoAccuracyConfirmed: false,
    documentsCheckAuthorized: false,
    termsAccepted: false,
    personalDataConsent: false,
  };
  uploadState: UploadFileState = this.createInitialUploadState();
  isSubmittingRequest = false;
  submitRequestError = '';
  submitRequestSuccess = '';
  pickedLat = 36.8065;
  pickedLng = 10.1815;
  showInlineMap = false;
  mapLat = 36.8065;
  mapLng = 10.1815;
  mapEmbedUrl!: SafeResourceUrl;

  financing: FinancingRequestPayload = {
    vehicleId: 0,
    requestedAmount: 0,
    downPayment: null,
    preferredDurationMonths: 48,
    preferredMonthlyPayment: null,
    financingType: 'CONVENTIONNEL',
    purpose: 'PERSONNEL',
    notes: '',
    preferredImf: '',
    urgency: 'NORMAL',
  };
  financingSubmitting = false;
  financingMessage = '';
  lastFinancingId: number | null = null;

  docs: ClientFinancingDocumentDto[] = [];
  vehicleFeedbacks: FeedbackVehicleDto[] = [];
  docUploading = false;
  docType: ClientDocumentType = 'CIN';
  docMessage = '';

  readonly docTypes: { v: ClientDocumentType; l: string }[] = [
    { v: 'CIN', l: 'ID card / Identity document' },
    { v: 'PAYSLIP', l: 'Payslip' },
    { v: 'BANK_STATEMENT', l: 'Bank statement' },
    { v: 'PROOF_OF_ADDRESS', l: 'Proof of address' },
    { v: 'OTHER', l: 'Other' },
  ];

  readonly statusLabels: Record<string, string> = {
    DISPONIBLE: 'Available',
    RESERVE: 'Reserved',
    VENDU: 'Sold',
    INACTIF: 'Inactive',
  };

  readonly conditionLabels: Record<VehicleCondition, string> = {
    NEUF: 'New',
    TRES_BON: 'Very good',
    BON: 'Good',
    MOYEN: 'Fair',
    MAUVAIS: 'Poor',
  };

  hasImageError = false;
  imageUrls: string[] = [];
  currentImageIndex = 0;

  private readonly terminalReservationStatuses = new Set<string>([
    'REJECTED',
    'CANCELLED_BY_CLIENT',
    'CANCELLED_BY_ADMIN',
    'EXPIRED',
  ]);

  get canShowReserveCta(): boolean {
    if (!this.vehicle || !this.isClient) return false;
    if (!this.vehicle.active || this.vehicle.status !== 'DISPONIBLE') return false;
    if (this.hasAnyActiveReservation) return false;
    return !this.myReservation;
  }

  get canCancelClientReservation(): boolean {
    if (!this.myReservation) return false;
    return ['PENDING_ADMIN_APPROVAL', 'WAITING_CUSTOMER_ACTION', 'UNDER_REVIEW'].includes(this.myReservation.status);
  }

  get canGiveServiceFeedback(): boolean {
    return !!this.myReservation;
  }

  get isReservationPhoneValid(): boolean {
    return this.normalizePhoneDigits(this.reservationPhone).length >= 8;
  }

  reservationStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING_ADMIN_APPROVAL: 'Pending admin approval',
      WAITING_CUSTOMER_ACTION: 'Additional info requested',
      UNDER_REVIEW: 'Under review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      CANCELLED_BY_CLIENT: 'Cancelled by you',
      CANCELLED_BY_ADMIN: 'Cancelled by platform',
      EXPIRED: 'Expired',
    };
    return labels[status] || status;
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private reservationService: ReservationService,
    private creditService: Credit,
    private financingService: FinancingRequestService,
    private docService: ClientFinancingDocumentService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {}
  
  ngOnInit(): void {
    this.mapEmbedUrl = this.buildMapEmbedUrl(this.mapLat, this.mapLng);
    this.auth.syncRoleFromToken();
    this.route.paramMap.subscribe((pm) => {
      const id = Number(pm.get('id'));
      if (!Number.isFinite(id)) {
        this.router.navigate(['/client/vehicles']);
        return;
      }
      this.load(id);
    });
    this.route.fragment.subscribe((f) => {
      if (f === 'reserver') {
        setTimeout(() => document.getElementById('reserver')?.scrollIntoView({ behavior: 'smooth' }), 200);
      }
    });
  }

  get isClient(): boolean {
    return this.auth.isClient();
  }

  get conditionLabel(): string {
    const c = this.vehicle?.etatVehicule;
    if (!c) return 'Not specified';
    return this.conditionLabels[c] ?? c;
  }

  load(vehicleId: number): void {
    this.isLoading = true;
    this.loadError = '';
    this.hasImageError = false;
    this.imageUrls = [];
    this.currentImageIndex = 0;
    this.vehicleService
      .getVehicleById(vehicleId)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (v) => {
          this.vehicle = v;
          this.imageUrls = this.parseImageUrls(v.imageUrl ?? null);
          this.currentImageIndex = 0;
          this.financing.vehicleId = v.id;
          this.financing.requestedAmount = Number(v.prixTnd) || 0;
          if (this.auth.hasValidToken() && this.isClient) {
            this.refreshMyReservation();
            this.loadDocs();
            this.loadMyFeedbacksForVehicle();
          }
          this.cdr.markForCheck();
        },
        error: (e) => {
          this.loadError = this.errMsg(e);
        },
      });
  }

  get hasMultipleImages(): boolean {
    return this.imageUrls.length > 1;
  }

  get activeImageUrl(): string | null {
    if (!this.imageUrls.length) return null;
    const idx = Math.min(Math.max(this.currentImageIndex, 0), this.imageUrls.length - 1);
    return this.imageUrls[idx];
  }

  prevImage(ev?: Event): void {
    ev?.preventDefault();
    ev?.stopPropagation();
    if (this.imageUrls.length <= 1) return;
    this.hasImageError = false;
    const total = this.imageUrls.length;
    this.currentImageIndex = (this.currentImageIndex - 1 + total) % total;
  }

  nextImage(ev?: Event): void {
    ev?.preventDefault();
    ev?.stopPropagation();
    if (this.imageUrls.length <= 1) return;
    this.hasImageError = false;
    const total = this.imageUrls.length;
    this.currentImageIndex = (this.currentImageIndex + 1) % total;
  }

  setImage(index: number, ev?: Event): void {
    ev?.preventDefault();
    ev?.stopPropagation();
    if (this.imageUrls.length <= 1) return;
    if (index < 0 || index >= this.imageUrls.length) return;
    this.hasImageError = false;
    this.currentImageIndex = index;
  }

  private parseImageUrls(raw: string | null): string[] {
    if (!raw) return [];
    return raw
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0);
  }

  refreshMyReservation(): void {
    if (!this.vehicle || !this.auth.hasValidToken() || !this.isClient) return;
    this.reservationService.myReservations().subscribe({
      next: (list) => {
        this.hasAnyActiveReservation = list.some((r) => !this.terminalReservationStatuses.has(r.status));
        this.myReservation =
          list.find(
            (r) => r.vehicleId === this.vehicle!.id && !this.terminalReservationStatuses.has(r.status),
          ) ?? null;
        if (this.myReservation) {
          this.financing.reservationId = this.myReservation.id;
        }
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  loadDocs(): void {
    if (!this.vehicle || !this.auth.hasValidToken() || !this.isClient) return;
    this.docService.byVehicle(this.vehicle.id).subscribe({
      next: (d) => {
        this.docs = d;
        this.cdr.markForCheck();
      },
      error: () => {},
    });
  }

  loadMyFeedbacksForVehicle(): void {
    if (!this.vehicle || !this.auth.hasValidToken() || !this.isClient) return;
    this.vehicleService.getMyFeedbacks().subscribe({
      next: (rows) => {
        this.vehicleFeedbacks = (rows ?? []).filter((f) => f.vehicleId === this.vehicle!.id);
        this.cdr.markForCheck();
      },
      error: () => {
        this.vehicleFeedbacks = [];
      },
    });
  }

  starsLabel(note: number): string {
    const safe = Math.max(0, Math.min(5, Math.round(Number(note) || 0)));
    return '★'.repeat(safe) + '☆'.repeat(5 - safe);
  }

  openReserve(): void {
    this.auth.syncRoleFromToken();
    if (!this.auth.hasValidToken()) {
      this.router.navigate(['/login-client']);
      return;
    }
    if (!this.isClient) {
      this.resMessage =
        'Reservation is limited to CLIENT accounts. Sign out and sign in via the client area (login-client).';
      this.resMessageError = true;
      return;
    }
    if (this.hasAnyActiveReservation) {
      const blockMsg = 'You already have an active vehicle reservation. Please wait for the admin decision.';
      this.resMessage = blockMsg;
      this.resMessageError = true;
      this.showResModal = false;
      return;
    }
    this.hydrateUserIdentity();
    this.useApportPersonnel = false;
    this.requestForm.montantDemande = Number(this.vehicle?.prixTnd) || 0;
    this.requestForm.garantieValeurEstimee = Number(this.vehicle?.prixTnd) || 0;
    this.requestForm.apportPersonnel = 0;
    this.requestForm.dureeMois = 48;
    this.requestForm.tauxAnnuel = 8;
    this.requestForm.objectifCredit = 'Achat véhicule';
    this.uploadState = this.createInitialUploadState();
    this.recalculateMensualite();
    this.submitRequestError = '';
    this.submitRequestSuccess = '';
    this.showResModal = true;
  }

  closeResModal(): void {
    if (this.resSubmitting) return;
    this.showResModal = false;
  }

  confirmReservation(): void {
    if (!this.vehicle || !this.auth.hasValidToken() || !this.auth.isClient()) return;
    if (!this.validateLoanForm()) return;
    const userId = this.getCurrentUserId();
    if (!userId) {
      this.submitRequestError = 'Unable to detect current user. Please reconnect and retry.';
      return;
    }

    this.isSubmittingRequest = true;
    this.submitRequestError = '';
    const payload: CreateRequestLoanPayload = {
      fullName: this.requestForm.fullName.trim(),
      dateOfBirth: this.requestForm.dateOfBirth ? new Date(this.requestForm.dateOfBirth).toISOString() : undefined,
      cinNumber: this.requestForm.cinNumber.trim(),
      address: this.requestForm.address.trim(),
      phone: this.requestForm.phone.trim(),
      email: this.requestForm.email.trim(),
      situationFamiliale: this.requestForm.maritalStatus,
      typeEmploi: this.requestForm.employmentType,
      revenuMensuelEstime: Number(this.requestForm.revenuMensuelNet) || 0,
      montantDemande: Number(this.requestForm.montantDemande) || 0,
      apportPersonnel: this.useApportPersonnel ? Number(this.requestForm.apportPersonnel) || 0 : 0,
      dureeMois: Number(this.requestForm.dureeMois) || 48,
      mensualiteEstimee: Number(this.requestForm.mensualiteEstimee) || 0,
      objectifCredit: this.requestForm.objectifCredit,
      typeRemboursementSouhaite: this.requestForm.repaymentType,
      demandePeriodeGrace: this.requestForm.demandePeriodeGrace,
      garantieType: this.requestForm.garantieType,
      garantieValeurEstimee: Number(this.requestForm.garantieValeurEstimee) || 0,
      confirmExactitudeInformations: this.requestForm.infoAccuracyConfirmed,
      autorisationVerificationDocuments: this.requestForm.documentsCheckAuthorized,
      acceptationConditionsGenerales: this.requestForm.termsAccepted,
      consentementTraitementDonnees: this.requestForm.personalDataConsent,
      docCinFourni: !!this.uploadState.cinDoc,
      docFichePaieFournie: !!this.uploadState.payslipDoc,
      docReleveBancaireFourni: this.uploadState.bankStatementDocs.length > 0,
      docAttestationTravailFournie: !!this.uploadState.workProofDoc,
      docJustificatifDomicileFourni: true,
      nombreDocumentsOptionnels: this.uploadState.optionalDocs.length,
      statutDemande: 'PENDING',
      userId,
      vehiculeId: this.vehicle.id,
    };

    this.creditService.createRequestLoan(payload).subscribe({
      next: (loan) => this.uploadRequestDocuments(loan),
      error: (e) => {
        this.isSubmittingRequest = false;
        this.submitRequestError = this.errMsg(e);
      },
    });
  }

  onUseApportPersonnelChange(checked: boolean): void {
    this.useApportPersonnel = checked;
    if (!checked) this.requestForm.apportPersonnel = 0;
    this.recalculateMensualite();
  }

  recalculateMensualite(): void {
    const total = Number(this.vehicle?.prixTnd) || Number(this.requestForm.montantDemande) || 0;
    const apport = this.useApportPersonnel ? Math.max(0, Number(this.requestForm.apportPersonnel) || 0) : 0;
    this.requestForm.apportPersonnel = Math.min(apport, total);
    this.requestForm.montantDemande = Math.max(0, total - this.requestForm.apportPersonnel);
    this.requestForm.garantieValeurEstimee = total;
    this.requestForm.revenuMensuelNet = Math.max(
      0,
      Number(this.requestForm.revenuMensuelBrut || 0) - Number(this.requestForm.chargesMensuelles || 0),
    );
    this.requestForm.estimatedMonthlyIncome = this.requestForm.revenuMensuelNet;
    const n = Math.max(this.minDureeMois, Math.min(this.maxDureeMois, Number(this.requestForm.dureeMois) || 48));
    this.requestForm.dureeMois = n;
    this.requestForm.mensualiteEstimee = n > 0 ? Number((this.requestForm.montantDemande / n).toFixed(2)) : 0;
  }

  onSingleFileSelected(field: 'cinDoc' | 'payslipDoc' | 'workProofDoc', event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadState[field] = input.files?.[0] ?? null;
  }

  onBankStatementFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadState.bankStatementDocs = Array.from(input.files ?? []).slice(0, 3);
  }

  onOptionalFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadState.optionalDocs = Array.from(input.files ?? []);
  }

  removeOptionalDoc(index: number): void {
    this.uploadState.optionalDocs = this.uploadState.optionalDocs.filter((_, i) => i !== index);
  }

  submitFinancing(): void {
    if (!this.vehicle || !this.isClient) return;
    this.financing.vehicleId = this.vehicle.id;
    this.financingSubmitting = true;
    this.financingMessage = '';
    this.financingService
      .create(this.financing)
      .pipe(
        finalize(() => {
          this.financingSubmitting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (fr) => {
          this.lastFinancingId = fr.id;
          this.financingMessage = 'Financing request submitted.';
          this.cdr.markForCheck();
        },
        error: (e) => {
          this.financingMessage = this.errMsg(e);
        },
      });
  }

  onDocFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.vehicle) return;
    this.docUploading = true;
    this.docMessage = '';
    this.docService
      .upload(this.vehicle.id, file, this.docType, this.lastFinancingId)
      .pipe(
        finalize(() => {
          this.docUploading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.loadDocs();
          input.value = '';
          this.docMessage = 'Document uploaded.';
          this.cdr.markForCheck();
        },
        error: (e) => {
          this.docMessage = this.errMsg(e);
          this.cdr.markForCheck();
        },
      });
  }

  deleteDoc(id: number): void {
    if (!confirm('Delete this document?')) return;
    this.docService.delete(id).subscribe({
      next: () => this.loadDocs(),
      error: () => {},
    });
  }

  cancelReservation(): void {
    if (!this.myReservation) return;
    if (!confirm('Cancel this reservation?')) return;
    this.reservationService.cancel(this.myReservation.id).subscribe({
      next: () => {
        this.resMessage = 'Reservation cancelled.';
        if (this.vehicle) this.load(this.vehicle.id);
        this.refreshMyReservation();
      },
      error: (e) => (this.resMessage = this.errMsg(e)),
    });
  }

  goToFeedback(feedbackType: FeedbackType): void {
    if (!this.vehicle) return;
    void this.router.navigate(['/client/vehicles/feedback'], {
      queryParams: {
        feedbackOpen: 1,
        feedbackType,
        reservationId: this.myReservation?.id || null,
        vehicleId: this.vehicle.id,
        returnTo: `/client/vehicles/${this.vehicle.id}`,
        returnLabel: 'Back to vehicle details',
      },
    });
  }

  onImageError(): void {
    this.hasImageError = true;
  }

  openLocationPicker(): void {
    this.showInlineMap = true;
    this.mapLat = this.pickedLat;
    this.mapLng = this.pickedLng;
    this.refreshInlineMap();
  }

  onMapCoordinatesChanged(): void {
    this.refreshInlineMap();
  }

  applyInlineMapLocation(): void {
    this.pickedLat = Number(this.mapLat) || this.pickedLat;
    this.pickedLng = Number(this.mapLng) || this.pickedLng;
    this.requestForm.address = `${this.pickedLat.toFixed(5)}, ${this.pickedLng.toFixed(5)}`;
    this.showInlineMap = false;
  }

  cancelInlineMap(): void {
    this.showInlineMap = false;
  }

  private refreshInlineMap(): void {
    this.mapEmbedUrl = this.buildMapEmbedUrl(this.mapLat, this.mapLng);
  }

  private buildMapEmbedUrl(lat: number, lng: number): SafeResourceUrl {
    const safeLat = Number.isFinite(Number(lat)) ? Number(lat) : 36.8065;
    const safeLng = Number.isFinite(Number(lng)) ? Number(lng) : 10.1815;
    const src = `https://maps.google.com/maps?q=${safeLat},${safeLng}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
  }

  private errMsg(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (typeof body === 'string' && body.trim().length) return body.trim();
      if (body && typeof body === 'object') {
        const o = body as Record<string, unknown>;
        if (typeof o['message'] === 'string') return o['message'] as string;
        if (typeof o['error'] === 'string') return o['error'] as string;
        if (typeof o['detail'] === 'string') return o['detail'] as string;
      }
      if (err.status === 401) {
        return 'Unrecognized session (401). Sign in again via login-client. If the issue persists, verify backend/JWT_SECRET consistency and a valid CLIENT account.';
      }
      if (err.status === 403)
        return 'Access denied: a CLIENT account is required to reserve. If you are seller/admin, use the correct area.';
      if (err.status === 409)
        return 'Conflict: action not possible (vehicle unavailable, already reserved, or a request is already in progress for your account).';
      if (err.status === 0) return 'Server unreachable.';
      return `Error ${err.status}`;
    }
    return 'Unexpected error.';
  }

  private normalizePhoneDigits(raw: string): string {
    return (raw || '').replace(/\D/g, '');
  }

  private getCurrentUserId(): number | null {
    const payload = this.auth.getPayload();
    if (payload?.userId) return payload.userId;
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      const user = JSON.parse(raw);
      return typeof user?.userId === 'number' ? user.userId : null;
    } catch {
      return null;
    }
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

  private hydrateUserIdentity(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return;
      const user = JSON.parse(raw);
      this.requestForm.fullName = user?.name ?? this.requestForm.fullName;
      this.requestForm.email = user?.email ?? this.requestForm.email;
      this.requestForm.phone = user?.phoneNumber ? `+216 ${user.phoneNumber}` : this.requestForm.phone;
    } catch {
      // no-op
    }
  }

  private validateLoanForm(): boolean {
    const required = [
      this.requestForm.fullName,
      this.requestForm.dateOfBirth,
      this.requestForm.cinNumber,
      this.requestForm.address,
      this.requestForm.phone,
      this.requestForm.email,
    ].every((v) => String(v || '').trim().length > 0);
    const hasDocs =
      !!this.uploadState.cinDoc &&
      !!this.uploadState.payslipDoc &&
      !!this.uploadState.workProofDoc &&
      this.uploadState.bankStatementDocs.length === 3;
    const hasConsents =
      this.requestForm.infoAccuracyConfirmed &&
      this.requestForm.documentsCheckAuthorized &&
      this.requestForm.termsAccepted &&
      this.requestForm.personalDataConsent;
    if (!required || !hasDocs || !hasConsents) {
      this.submitRequestError =
        'Please complete all required fields, upload CIN/payslip/work proof + 3 bank statements, and accept all consents.';
      return false;
    }
    return true;
  }

  private uploadRequestDocuments(loan: RequestLoanDto): void {
    const reqId = Number(loan.idDemande);
    const uploads: Array<{ type: string; file: File }> = [];
    if (this.uploadState.cinDoc) uploads.push({ type: 'CIN', file: this.uploadState.cinDoc });
    if (this.uploadState.payslipDoc) uploads.push({ type: 'FICHE_PAIE', file: this.uploadState.payslipDoc });
    if (this.uploadState.workProofDoc) uploads.push({ type: 'ATTESTATION_TRAVAIL', file: this.uploadState.workProofDoc });
    this.uploadState.bankStatementDocs.forEach((f, i) => uploads.push({ type: `RELEVE_BANCAIRE_${i + 1}`, file: f }));
    this.uploadState.optionalDocs.forEach((f, i) => uploads.push({ type: `OPTIONAL_${i + 1}`, file: f }));

    if (uploads.length === 0) {
      this.finishRequestSubmit();
      return;
    }
    const next = (idx: number) => {
      if (idx >= uploads.length) {
        this.finishRequestSubmit();
        return;
      }
      const u = uploads[idx];
      this.creditService.uploadLoanDocument(reqId, u.type, u.file).subscribe({
        next: () => next(idx + 1),
        error: () => next(idx + 1),
      });
    };
    next(0);
  }

  private finishRequestSubmit(): void {
    this.isSubmittingRequest = false;
    this.showResModal = false;
    this.submitRequestSuccess = 'Credit request submitted successfully.';
    this.resMessage = this.submitRequestSuccess;
    this.resMessageError = false;
    this.cdr.markForCheck();
  }
}
