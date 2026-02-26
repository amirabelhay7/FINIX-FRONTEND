import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { VehicleAdminService } from '../../../core/services/vehicle-admin.service';
import { Vehicle } from '../../../core/models/vehicle.model';

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
    private vehicleAdminService: VehicleAdminService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.vehicleAdminService.getAll().subscribe((v: Vehicle[]) => this.vehicles.set(v));
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
  }

  deleteVehicle(id: string): void {
    this.vehicleAdminService.delete(id).subscribe((ok: boolean) => {
      if (ok) this.deleteConfirmId.set(null);
    });
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('fr-TN', { style: 'decimal' }).format(n) + ' TND';
  }

  formatDate(d: string): string {
    return d;
  }
}
