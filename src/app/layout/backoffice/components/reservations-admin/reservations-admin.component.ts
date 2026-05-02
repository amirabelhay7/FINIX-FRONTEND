import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { finalize, switchMap } from 'rxjs/operators';
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

  constructor(
    private reservationService: ReservationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadPendingReservations();
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
          this.error = err?.error?.message || 'Erreur lors du chargement des réservations.';
        },
      });
  }

  approveReservation(id: number): void {
    this.actionLoading = true;
    this.reservationService
      .approveReservation(id)
      .pipe(
        // Recharger la liste apres commit serveur : les autres demandes sur le meme vehicule passent en REJECTED
        // et ne doivent plus apparaitre ici (evite la course avec setTimeout + filtre sur une seule ligne).
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
          this.error = err?.error?.message || 'Impossible de valider la réservation.';
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
          this.error = err?.error?.message || 'Impossible de refuser la réservation.';
        },
      });
  }

  statusLabel(status: string): string {
    if (status === 'PENDING_ADMIN_APPROVAL') return 'En attente validation admin';
    if (status === 'APPROVED') return 'Approuvée';
    if (status === 'REJECTED') return 'Refusée';
    return status;
  }

  goToVehiclesPage(): void {
    this.backToVehicles.emit();
  }
}
