import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleAdminService } from '../../../core/services/vehicle-admin.service';
import { Vehicle } from '../../../core/models/vehicle.model';

@Component({
  selector: 'app-vehicle-admin-detail',
  standalone: false,
  templateUrl: './vehicle-admin-detail.html',
  styleUrl: './vehicle-admin-detail.scss',
})
export class VehicleAdminDetail implements OnInit {
  protected readonly vehicle = signal<Vehicle | null>(null);
  protected readonly currentImageIndex = signal(0);

  constructor(
    private route: ActivatedRoute,
    private vehicleAdminService: VehicleAdminService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.vehicleAdminService.getById(id).subscribe((v: Vehicle | undefined) => {
      this.vehicle.set(v ?? null);
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
