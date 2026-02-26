import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Vehicle } from '../../../core/models/vehicle.models';
import { VehicleAdminApiService } from '../../../core/services/vehicle-admin-api.service';
import { VehicleSearchParams } from '../../../core/models/vehicle.models';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-vehicles-list',
  standalone: false,
  templateUrl: './vehicles-list.html',
  styleUrl: './vehicles-list.scss',
})
export class VehiclesList implements OnInit {
  protected readonly vehicles = signal<Vehicle[]>([]);
  protected readonly search = signal('');
  protected readonly filterStatus = signal<string>('');
  protected readonly filterBrand = signal('');
  protected readonly deleteConfirmId = signal<string | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly deletingId = signal<string | null>(null);

  protected readonly filteredVehicles = computed(() => {
    let list = [...this.vehicles()];
    const s = this.search().toLowerCase().trim();
    if (s) list = list.filter((v) => `${v.brand} ${v.model}`.toLowerCase().includes(s));
    const status = this.filterStatus();
    if (status) list = list.filter((v) => v.status === status);
    const brand = this.filterBrand();
    if (brand) list = list.filter((v) => v.brand === brand);
    return list;
  });

  protected readonly brands = computed(() => {
    const set = new Set(this.vehicles().map((v) => v.brand));
    return Array.from(set).sort();
  });

  constructor(
    private vehicleAdminApi: VehicleAdminApiService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  private buildSearchParams(): VehicleSearchParams {
    return {
      q: this.search() || null,
      // Potential future extension: map other filters to backend query params
    };
  }

  private loadVehicles(): void {
    this.isLoading.set(true);
    const params = this.buildSearchParams();
    this.vehicleAdminApi.getAll(params).subscribe({
      next: (page) => {
        this.vehicles.set(page.content);
      },
      error: () => {
        this.vehicles.set([]);
        this.toastService.showError('Impossible de charger les véhicules.');
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  onSearchInput(value: string): void {
    this.search.set(value);
    this.loadVehicles();
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  deleteVehicle(id: string): void {
    this.deletingId.set(id);
    this.vehicleAdminApi.delete(id).subscribe({
      next: () => {
        this.vehicles.update((list) => list.filter((v) => v.id !== id));
        this.toastService.showSuccess('Véhicule supprimé.');
        this.deleteConfirmId.set(null);
        this.deletingId.set(null);
      },
      error: () => {
        this.toastService.showError('Échec de la suppression du véhicule.');
        this.deletingId.set(null);
      },
    });
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('fr-TN', { style: 'decimal' }).format(n) + ' TND';
  }

  formatDate(d: string): string {
    return d;
  }
}
