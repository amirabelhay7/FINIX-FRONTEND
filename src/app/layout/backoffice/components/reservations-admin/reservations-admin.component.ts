import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { finalize, switchMap } from 'rxjs/operators';
import { catchError, of } from 'rxjs';
import { VehicleReservationDto } from '../../../../models';
import { ReservationService } from '../../../../services/vehicle/reservation.service';

@Component({
  selector: 'app-reservations-admin',
  standalone: false,
  templateUrl: './reservations-admin.component.html',
  styleUrl: './reservations-admin.component.css',
})
export class ReservationsAdminComponent implements OnInit {
  @Output() backToVehicles = new EventEmitter<void>();
  pendingReservations: VehicleReservationDto[] = [];
  loading = false;
  actionLoading = false;
  error = '';

  selectedForReject: VehicleReservationDto | null = null;
  rejectReason = '';

  /** Opened from notification when reservation is no longer in the pending list. */
  focusedReservation: VehicleReservationDto | null = null;

  constructor(
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const rawFocus = sessionStorage.getItem('finix_focus_reservation_id');
    sessionStorage.removeItem('finix_focus_reservation_id');
    const focusId = rawFocus ? Number(rawFocus) : NaN;

    this.loadPendingReservations();

    if (Number.isFinite(focusId) && focusId > 0) {
      this.reservationService
        .getById(focusId)
        .pipe(catchError(() => of(null)))
        .subscribe((row) => {
          if (row) {
            this.focusedReservation = row;
            this.cdr.detectChanges();
          }
        });
    }
  }

  dismissFocusedReservation(): void {
    this.focusedReservation = null;
  }

  loadPendingReservations(): void {
    this.loading = true;
    this.error = '';
    this.reservationService
      .getPendingReservations()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (rows) => {
          this.pendingReservations = rows;
        },
        error: (err) => {
          this.pendingReservations = [];
          this.error = err?.error?.message || 'Error while loading reservations.';
        },
      });
  }

  approveReservation(id: number): void {
    this.actionLoading = true;
    this.reservationService
      .approveReservation(id)
      .pipe(
        // Reload list after server commit: competing requests move to REJECTED
        // and should no longer appear here (avoids race conditions).
        switchMap(() => this.reservationService.getPendingReservations()),
        finalize(() => {
          this.actionLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (rows) => {
          this.pendingReservations = rows;
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || 'Unable to approve reservation.';
        },
      });
  }

  openRejectModal(reservation: VehicleReservationDto): void {
    this.selectedForReject = reservation;
    this.rejectReason = '';
  }

  closeRejectModal(): void {
    this.selectedForReject = null;
    this.rejectReason = '';
  }

  rejectReservation(): void {
    if (!this.selectedForReject) return;
    const reason = this.rejectReason.trim();
    if (!reason) return;

    this.actionLoading = true;
    this.reservationService
      .rejectReservation(this.selectedForReject.id, { reason })
      .pipe(
        switchMap(() => this.reservationService.getPendingReservations()),
        finalize(() => {
          this.actionLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (rows) => {
          this.pendingReservations = rows;
          this.closeRejectModal();
          this.error = '';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.error = err?.error?.message || 'Unable to reject reservation.';
        },
      });
  }

  statusLabel(status: string): string {
    if (status === 'PENDING_ADMIN_APPROVAL') return 'Pending admin approval';
    if (status === 'WAITING_CUSTOMER_ACTION') return 'Client action required';
    if (status === 'UNDER_REVIEW') return 'Under review';
    if (status === 'APPROVED') return 'Approved';
    if (status === 'REJECTED') return 'Rejected';
    if (status === 'CANCELLED_BY_CLIENT') return 'Cancelled (client)';
    if (status === 'CANCELLED_BY_ADMIN') return 'Cancelled (admin)';
    if (status === 'EXPIRED') return 'Expired';
    return status;
  }

  goToVehiclesPage(): void {
    this.backToVehicles.emit();
  }
}


