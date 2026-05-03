import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { VehicleService } from '../../../../services/vehicle/vehicle.service';
import { ReservationService } from '../../../../services/vehicle/reservation.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { RecommendedVehicleDto, VehicleDto, VehicleSearchQuery, VehicleStatus } from '../../../../models';
import { VEHICLE_STATUS_LABELS_EN } from '../../../../shared/constants/vehicle-labels';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-client-vehicle-catalog',
  standalone: false,
  templateUrl: './client-vehicle-catalog.html',
  styleUrl: './client-vehicle-catalog.css',
})
export class ClientVehicleCatalog implements OnInit, OnDestroy {
  vehicles: VehicleDto[] = [];
  isLoading = false;
  loadError = '';

  recommendations: RecommendedVehicleDto[] = [];
  recLoading = false;
  recError = '';

  filterQ = '';
  filterStatus: VehicleStatus | '' = 'DISPONIBLE';
  sortKey = 'price_asc';
  onlyWithImage = false;

  page = 1;
  readonly pageSize = 9;

  readonly statuses: VehicleStatus[] = ['DISPONIBLE', 'RESERVE', 'VENDU', 'INACTIF'];
  readonly statusLabels: Record<VehicleStatus, string> = VEHICLE_STATUS_LABELS_EN;
  hasActiveReservation = false;

  private qSub = new Subject<string>();
  private qSubscription?: Subscription;

  constructor(
    private vehicleService: VehicleService,
    private reservationService: ReservationService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.qSubscription = this.qSub
      .pipe(debounceTime(320), distinctUntilChanged())
      .subscribe(() => {
        this.page = 1;
        this.load();
      });
    this.load();
    this.refreshActiveReservationFlag();
    if (this.auth.isClient()) {
      this.loadRecommendations();
    }
  }

  ngOnDestroy(): void {
    this.qSubscription?.unsubscribe();
  }

  onQInput(v: string): void {
    this.filterQ = v;
    this.qSub.next(v);
  }

  onStatusChange(status: VehicleStatus | ''): void {
    this.filterStatus = status;
  }

  onSortChange(sort: string): void {
    this.sortKey = sort;
  }

  onOnlyWithImageChange(value: boolean): void {
    this.onlyWithImage = value;
  }

  applyFilters(): void {
    this.page = 1;
    this.load();
  }

  resetFilters(): void {
    this.filterQ = '';
    this.filterStatus = 'DISPONIBLE';
    this.sortKey = 'price_asc';
    this.onlyWithImage = false;
    this.page = 1;
    this.load();
  }

  setPage(p: number): void {
    this.page = p;
  }

  trackByVehicleId(_: number, vehicle: VehicleDto): number {
    return vehicle.id;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.vehicles.length / this.pageSize));
  }

  get pagedVehicles(): VehicleDto[] {
    const start = (this.page - 1) * this.pageSize;
    return this.vehicles.slice(start, start + this.pageSize);
  }

  load(): void {
    this.isLoading = true;
    this.loadError = '';
    const q: VehicleSearchQuery = {
      q: this.filterQ.trim() || undefined,
      sort: this.sortKey,
    };
    if (this.filterStatus) q.status = this.filterStatus;
    if (this.onlyWithImage) q.hasImage = true;

    this.vehicleService
      .searchVehicles(q)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (rows) => {
          this.vehicles = rows;
          if (this.page > this.totalPages) this.page = this.totalPages;
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.loadError = this.errMsg(err);
        },
      });
  }

  loadRecommendations(): void {
    this.recLoading = true;
    this.recError = '';
    this.vehicleService.getRecommendations().pipe(finalize(() => {
      this.recLoading = false;
      this.cdr.markForCheck();
    })).subscribe({
      next: (rows) => { this.recommendations = rows; },
      error: (err) => { this.recError = this.errMsg(err); },
    });
  }

  private refreshActiveReservationFlag(): void {
    if (!this.auth.hasValidToken() || !this.auth.isClient()) {
      this.hasActiveReservation = false;
      return;
    }
    this.reservationService.myHasActiveReservation().subscribe({
      next: (hasActive) => {
        this.hasActiveReservation = hasActive;
        this.cdr.markForCheck();
      },
      error: () => {
        this.hasActiveReservation = false;
      },
    });
  }

  private errMsg(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return 'Server unreachable.';
      return typeof err.error === 'string' ? err.error : `Error ${err.status}`;
    }
    return 'Unexpected error.';
  }
}
