import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ReservationService } from '../../../../services/vehicle/reservation.service';
import { FinancingRequestService } from '../../../../services/vehicle/financing-request.service';
import { VehicleService } from '../../../../services/vehicle/vehicle.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { VehicleReservationDto, FinancingRequestDto, FeedbackType, FeedbackVehicleDto } from '../../../../models';
import { of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-client-my-reservations',
  standalone: false,
  templateUrl: './client-my-reservations.html',
  styleUrl: './client-my-reservations.css',
})
export class ClientMyReservations implements OnInit {
  reservations: VehicleReservationDto[] = [];
  financing: FinancingRequestDto[] = [];
  feedbacks: FeedbackVehicleDto[] = [];
  loading = true;
  error = '';
  private loadingGuard: ReturnType<typeof setTimeout> | null = null;
  private readonly reservationsCacheKey = 'finix-client-my-reservations';

  constructor(
    private reservationService: ReservationService,
    private financingService: FinancingRequestService,
    private vehicleService: VehicleService,
    private auth: AuthService,
    private router: Router,
  ) {}

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING_ADMIN_APPROVAL: 'Pending admin approval',
      WAITING_CUSTOMER_ACTION: 'Additional info requested',
      UNDER_REVIEW: 'Under review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      CANCELLED_BY_CLIENT: 'Cancelled by you',
      CANCELLED_BY_ADMIN: 'Cancelled (platform)',
      EXPIRED: 'Expired',
    };
    return labels[status] || status;
  }

  financingStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      DRAFT: 'Draft',
      SUBMITTED: 'Submitted',
      UNDER_REVIEW: 'Under review',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
    };
    return labels[status] || status;
  }

  trackByReservationId(_: number, item: VehicleReservationDto): number {
    return item.id;
  }

  trackByFinancingId(_: number, item: FinancingRequestDto): number {
    return item.id;
  }

  get pendingAdminCount(): number {
    return this.reservations.filter((r) => r.status === 'PENDING_ADMIN_APPROVAL').length;
  }

  get hasPendingAdminReservations(): boolean {
    return this.pendingAdminCount > 0;
  }

  isPendingAdmin(status: string): boolean {
    return status === 'PENDING_ADMIN_APPROVAL';
  }

  reservationFeedback(reservation: VehicleReservationDto): FeedbackVehicleDto | null {
    const vehicleId = reservation.vehicleId;
    if (!vehicleId) return null;
    const match = this.feedbacks.find((f) => f.vehicleId === vehicleId);
    return match ?? null;
  }

  feedbackStars(note: number): string {
    const safe = Math.max(0, Math.min(5, Math.round(Number(note) || 0)));
    return '★'.repeat(safe) + '☆'.repeat(5 - safe);
  }

  ngOnInit(): void {
    this.auth.syncRoleFromToken();
    if (!this.auth.hasValidToken() || !this.auth.isClient()) {
      this.loading = false;
      this.error = 'Sign in with a client account to access your reservations.';
      void this.router.navigate(['/login-client']);
      return;
    }
    this.hydrateReservationsFromCache();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = '';
    if (this.loadingGuard) {
      clearTimeout(this.loadingGuard);
    }
    this.loadingGuard = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        if (!this.error) {
          this.error = 'Loading is taking too long. Partial data is displayed.';
        }
      }
    }, 12000);
    // Do not block the whole page on financing endpoint.
    this.reservationService.myReservations()
      .pipe(
        timeout(20000),
        catchError((e) => {
          console.error('[my-reservations] reservations load failed', e);
          this.error = this.msg(e);
          // Keep current list on transient network/backend issues.
          return of(this.reservations);
        }),
        finalize(() => (this.loading = false)),
      )
      .subscribe((reservations) => {
        this.reservations = this.normalizeReservationsResponse(reservations);
        this.persistReservationsCache(this.reservations);
        if (this.loadingGuard) {
          clearTimeout(this.loadingGuard);
          this.loadingGuard = null;
        }
      });

    // Background load: never blocks reservation display.
    this.financingService.myRequests()
      .pipe(
        timeout(12000),
        catchError((e) => {
          console.error('[my-reservations] financing load failed', e);
          return of([] as FinancingRequestDto[]);
        }),
      )
      .subscribe((financing) => {
        this.financing = financing ?? [];
      });

    // Load current user's feedbacks to display per reserved vehicle.
    this.vehicleService.getMyFeedbacks()
      .pipe(
        timeout(12000),
        catchError((e) => {
          console.error('[my-reservations] feedbacks load failed', e);
          return of([] as FeedbackVehicleDto[]);
        }),
      )
      .subscribe((rows) => {
        this.feedbacks = rows ?? [];
      });
  }

  canGiveServiceFeedback(reservation: VehicleReservationDto): boolean {
    return reservation.id > 0;
  }

  openFeedbackEntry(reservation: VehicleReservationDto, feedbackType: FeedbackType): void {
    void this.router.navigate(['/client/vehicles/feedback'], {
      queryParams: {
        feedbackOpen: 1,
        feedbackType,
        reservationId: reservation.id,
        vehicleId: reservation.vehicleId,
        returnTo: '/client/vehicles/suivi',
        returnLabel: 'Back to tracking',
      },
    });
  }

  private msg(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 401 || err.status === 403) {
        return 'Invalid session or access denied. Sign in again as a client.';
      }
      return `Error ${err.status}`;
    }
    return 'Error';
  }

  private normalizeReservationsResponse(payload: unknown): VehicleReservationDto[] {
    if (Array.isArray(payload)) {
      return payload as VehicleReservationDto[];
    }

    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const wrapped = payload as Record<string, unknown>;
    const candidates = [wrapped['content'], wrapped['data'], wrapped['items'], wrapped['reservations']];
    const firstArray = candidates.find((v) => Array.isArray(v));
    return Array.isArray(firstArray) ? (firstArray as VehicleReservationDto[]) : [];
  }

  private hydrateReservationsFromCache(): void {
    try {
      const raw = localStorage.getItem(this.reservationsCacheKey);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        this.reservations = parsed as VehicleReservationDto[];
      }
    } catch {
      // Ignore corrupted cache and continue with API data.
    }
  }

  private persistReservationsCache(rows: VehicleReservationDto[]): void {
    try {
      localStorage.setItem(this.reservationsCacheKey, JSON.stringify(rows ?? []));
    } catch {
      // Ignore storage failures (private mode/quota).
    }
  }
}
