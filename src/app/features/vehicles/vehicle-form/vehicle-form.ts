import { Component, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  VehicleCreateUpdateDto,
  Vehicle,
  FuelType,
  Gearbox,
  VehicleStatus,
} from '../../../core/models/vehicle.models';
import { VehicleAdminApiService } from '../../../core/services/vehicle-admin-api.service';
import { ToastService } from '../../../core/services/toast.service';

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
  protected readonly isLoading = signal(false);
  protected readonly isSubmitting = signal(false);

  protected readonly fuelOptions = FUEL_OPTIONS;
  protected readonly gearboxOptions = GEARBOX_OPTIONS;
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly locationOptions = LOCATIONS;

  constructor(
    private fb: FormBuilder,
    private vehicleAdminApi: VehicleAdminApiService,
    private toastService: ToastService,
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
      imageUrls: this.fb.array([this.fb.control('https://picsum.photos/seed/placeholder/400/300', Validators.required)]),
    });
  }

  get imageUrlsArray(): FormArray {
    return this.form.get('imageUrls') as FormArray;
  }

  addImageUrl(): void {
    this.imageUrlsArray.push(
      this.fb.control('https://picsum.photos/seed/placeholder/400/300', Validators.required),
    );
  }

  removeImageUrl(index: number): void {
    if (this.imageUrlsArray.length <= 1) return;
    this.imageUrlsArray.removeAt(index);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEdit.set(true);
      this.vehicleId.set(id);
      this.isLoading.set(true);
      this.vehicleAdminApi.getById(id).subscribe({
        next: (v: Vehicle) => {
          if (v) {
            const urls = v.imageUrls?.length
              ? v.imageUrls
              : ['https://picsum.photos/seed/placeholder/400/300'];
            const fa = this.imageUrlsArray;
            fa.clear();
            for (const url of urls) {
              fa.push(this.fb.control(url, Validators.required));
            }
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
            });
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
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.value as any;
    const imageUrls = (this.imageUrlsArray.controls || [])
      .map((c) => (c.value || '').toString().trim())
      .filter(Boolean);
    if (!imageUrls.length) imageUrls.push('https://picsum.photos/seed/placeholder/400/300');
    const { imageUrls: _ignored, ...rest } = raw;
    const dto: VehicleCreateUpdateDto = {
      ...rest,
      imageUrls,
    };
    const id = this.vehicleId();
    this.isSubmitting.set(true);
    if (id) {
      this.vehicleAdminApi.update(id, dto).subscribe({
        next: () => {
          this.toastService.showSuccess('Véhicule mis à jour.');
          this.router.navigate(['/admin/vehicles']);
        },
        error: () => {
          this.toastService.showError(
            'La mise à jour a échoué. Merci de vérifier les informations saisies.',
          );
          this.isSubmitting.set(false);
        },
      });
    } else {
      this.vehicleAdminApi.create(dto).subscribe({
        next: () => {
          this.toastService.showSuccess('Véhicule créé.');
          this.router.navigate(['/admin/vehicles']);
        },
        error: () => {
          this.toastService.showError(
            'La création a échoué. Merci de vérifier les informations saisies.',
          );
          this.isSubmitting.set(false);
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/vehicles']);
  }
}
