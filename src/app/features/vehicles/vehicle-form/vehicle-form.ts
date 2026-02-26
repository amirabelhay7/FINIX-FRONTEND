import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleAdminService } from '../../../core/services/vehicle-admin.service';
import {
  VehicleCreateUpdateDto,
  Vehicle,
  FuelType,
  Gearbox,
  VehicleStatus,
} from '../../../core/models/vehicle.model';

const FUEL_OPTIONS: FuelType[] = ['Diesel', 'Essence', 'Hybrid', 'Electric'];
const GEARBOX_OPTIONS: Gearbox[] = ['Manuelle', 'Automatique'];
const STATUS_OPTIONS: VehicleStatus[] = ['DRAFT', 'PUBLISHED'];
const LOCATIONS = ['Tunis', 'Sousse', 'Sfax', 'Monastir', 'Nabeul', 'Bizerte'];

@Component({
  selector: 'app-vehicle-form',
  standalone: false,
  templateUrl: './vehicle-form.html',
  styleUrl: './vehicle-form.scss',
})
export class VehicleForm implements OnInit {
  protected readonly form: FormGroup;
  protected readonly isEdit = signal(false);
  protected readonly vehicleId = signal<string | null>(null);

  protected readonly fuelOptions = FUEL_OPTIONS;
  protected readonly gearboxOptions = GEARBOX_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly locationOptions = LOCATIONS;

  constructor(
    private fb: FormBuilder,
    private vehicleAdminService: VehicleAdminService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.form = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: [
        new Date().getFullYear(),
        [Validators.required, Validators.min(1990), Validators.max(new Date().getFullYear() + 1)],
      ],
      mileageKm: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      fuelType: ['Essence' as FuelType, Validators.required],
      gearbox: ['Manuelle' as Gearbox, Validators.required],
      location: ['Tunis', Validators.required],
      status: ['DRAFT' as VehicleStatus, Validators.required],
      description: [''],
      imageUrlInput: ['https://picsum.photos/seed/placeholder/400/300'],
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.vehicleId.set(id);
      this.vehicleAdminService.getById(id).subscribe((v: Vehicle | undefined) => {
        if (v) {
          this.form.patchValue({
            brand: v.brand,
            model: v.model,
            year: v.year,
            mileageKm: v.mileageKm,
            price: v.price,
            fuelType: v.fuelType,
            gearbox: v.gearbox,
            location: v.location,
            status: v.status,
            description: v.description,
            imageUrlInput: v.imageUrls?.length ? v.imageUrls.join(', ') : 'https://picsum.photos/seed/placeholder/400/300',
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.value;
    const imageUrls = (raw.imageUrlInput || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (!imageUrls.length) imageUrls.push('https://picsum.photos/seed/placeholder/400/300');
    const { imageUrlInput, ...rest } = raw;
    const dto: VehicleCreateUpdateDto = {
      ...rest,
      imageUrls,
    };
    const id = this.vehicleId();
    if (id) {
      this.vehicleAdminService.update(id, dto).subscribe((v: Vehicle | null) => {
        if (v) this.router.navigate(['/admin/vehicles']);
      });
    } else {
      this.vehicleAdminService.create(dto).subscribe(() => {
        this.router.navigate(['/admin/vehicles']);
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/vehicles']);
  }
}
