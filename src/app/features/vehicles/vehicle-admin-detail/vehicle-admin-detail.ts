import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Vehicle } from '../../../core/models/vehicle.models';
import { VehicleAdminApiService } from '../../../core/services/vehicle-admin-api.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-vehicle-admin-detail',
  standalone: false,
  templateUrl: './vehicle-admin-detail.html',
  styleUrl: './vehicle-admin-detail.scss',
})
export class VehicleAdminDetail implements OnInit {
  protected readonly vehicle = signal<Vehicle | null>(null);
  protected readonly currentImageIndex = signal(0);
  protected readonly isLoading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private vehicleAdminApi: VehicleAdminApiService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.isLoading.set(true);
    this.vehicleAdminApi.getById(id).subscribe({
      next: (v: Vehicle) => {
        this.vehicle.set(v ?? null);
        if (!v) {
          this.toastService.showError('Véhicule introuvable.');
          this.router.navigate(['/admin/vehicles']);
        }
      },
      error: () => {
        this.toastService.showError('Impossible de charger le véhicule.');
        this.router.navigate(['/admin/vehicles']);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  setImageIndex(i: number): void {
    this.currentImageIndex.set(i);
  }

  edit(): void {
    const v = this.vehicle();
    if (v) this.router.navigate(['/admin/vehicles', v.id, 'edit']);
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('fr-TN', { style: 'decimal' }).format(n) + ' TND';
  }
}
