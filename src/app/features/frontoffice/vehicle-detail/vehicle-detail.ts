import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Vehicle } from '../../../core/models/vehicle.models';
import { VehiclePublicApiService } from '../../../core/services/vehicle-public-api.service';
import { VehicleSearchParams } from '../../../core/models/vehicle.models';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-vehicle-detail',
  standalone: false,
  templateUrl: './vehicle-detail.html',
  styleUrl: './vehicle-detail.scss',
})
export class VehicleDetail implements OnInit {
  protected readonly vehicle = signal<Vehicle | null>(null);
  protected readonly similarVehicles = signal<Vehicle[]>([]);
  protected readonly currentImageIndex = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly isSimilarLoading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private vehicleApi: VehiclePublicApiService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.isLoading.set(true);
    this.vehicleApi.getById(id).subscribe({
      next: (v) => {
        this.vehicle.set(v ?? null);
        if (v) {
          this.loadSimilar(v);
        }
      },
      error: () => {
        this.vehicle.set(null);
        this.toastService.showError('Impossible de charger le véhicule.');
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  setImageIndex(i: number): void {
    this.currentImageIndex.set(i);
  }

  private loadSimilar(v: Vehicle): void {
    const params: VehicleSearchParams = {
      q: v.brand,
      fuelType: v.fuelType,
      page: 0,
      size: 4,
    };
    this.isSimilarLoading.set(true);
    this.vehicleApi.search(params).subscribe({
      next: (page) => {
        const similar = page.content.filter((x) => x.id !== v.id);
        this.similarVehicles.set(similar);
      },
      error: () => {
        this.similarVehicles.set([]);
      },
      complete: () => {
        this.isSimilarLoading.set(false);
      },
    });
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('fr-TN', { style: 'decimal' }).format(n) + ' TND';
  }
}
