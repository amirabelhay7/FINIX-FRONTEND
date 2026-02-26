import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VehiclePublicService } from '../../../core/services/vehicle-public.service';
import { Vehicle } from '../../../core/models/vehicle.model';

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

  constructor(
    private route: ActivatedRoute,
    private vehicleService: VehiclePublicService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.vehicleService.getById(id).subscribe((v) => {
      this.vehicle.set(v ?? null);
      if (v) {
        this.vehicleService.getSimilar(v.id, 4).subscribe((s) => this.similarVehicles.set(s));
      }
    });
  }

  setImageIndex(i: number): void {
    this.currentImageIndex.set(i);
  }

  formatPrice(n: number): string {
    return new Intl.NumberFormat('fr-TN', { style: 'decimal' }).format(n) + ' TND';
  }
}
