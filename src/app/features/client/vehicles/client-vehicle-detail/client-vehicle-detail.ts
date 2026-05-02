import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { VehicleService } from '../../../../services/vehicle/vehicle.service';
import { ReservationService } from '../../../../services/vehicle/reservation.service';
import { FinancingRequestService } from '../../../../services/vehicle/financing-request.service';
import { ClientFinancingDocumentService } from '../../../../services/vehicle/client-financing-document.service';
import { AuthService } from '../../../../services/auth/auth.service';
import {
  FeedbackType,
  FeedbackVehicleDto,
  ClientDocumentType,
  ClientFinancingDocumentDto,
  FinancingRequestPayload,
  VehicleCondition,
  VehicleDto,
  VehicleReservationDto,
  VehicleReservationPayload,
} from '../../../../models';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private reservationService: ReservationService,
    private financingService: FinancingRequestService,
    private docService: ClientFinancingDocumentService,
    public auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
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
    this.reservationNotes = '';
    this.reservationPhone = '';
    this.reservationDesiredDate = null;
    this.resMessage = '';
    this.resMessageError = false;
    this.showResModal = true;
  }

  closeResModal(): void {
    if (this.resSubmitting) return;
    this.showResModal = false;
  }

  confirmReservation(): void {
    if (!this.vehicle) return;
    this.auth.syncRoleFromToken();
    if (!this.auth.hasValidToken()) {
      this.resMessage = 'Session expired or token missing. Please sign in again and retry.';
      this.resMessageError = true;
      return;
    }
    if (!this.auth.isClient()) {
      this.resMessage =
        'Your account is not a CLIENT account. Only clients can reserve (API /api/reservations).';
      this.resMessageError = true;
      return;
    }
    this.resSubmitting = true;
    this.resMessage = '';
    this.resMessageError = false;
    const normalizedPhone = this.normalizePhoneDigits(this.reservationPhone);
    if (!normalizedPhone || normalizedPhone.length < 8) {
      this.resMessage = 'Phone number is required (at least 8 digits).';
      this.resMessageError = true;
      this.resSubmitting = false;
      return;
    }

    const payload: VehicleReservationPayload = {
      vehicleId: this.vehicle.id,
      phoneNumber: Number(normalizedPhone),
      clientNotes: this.reservationNotes.trim() || null,
      desiredDate: this.reservationDesiredDate || null,
    };
    this.reservationService
      .create(payload)
      .pipe(
        finalize(() => {
          this.resSubmitting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.showResModal = false;
          this.resMessage =
            'Request submitted. It is pending administrator approval. The vehicle remains listed as available until approval.';
          this.resMessageError = false;
          this.load(this.vehicle!.id);
          this.refreshMyReservation();
          this.cdr.markForCheck();
        },
        error: (e) => {
          const normalizedMsg = this.errMsg(e);
          if (normalizedMsg.toLowerCase().includes('active vehicle reservation')) {
            this.resMessage = 'You already have an active vehicle reservation. Please wait for the admin decision.';
          } else {
            this.resMessage = normalizedMsg;
          }
          this.resMessageError = true;
          this.cdr.markForCheck();
        },
      });
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
}
