import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UserService } from '../../../../../../services/user/user.service';
import { VehiclePreferencesPayload } from '../../../../../../models';

@Component({
  selector: 'app-vehicle-preferences-form',
  standalone: false,
  templateUrl: './vehicle-preferences-form.component.html',
  styleUrl: './vehicle-preferences-form.component.css',
})
export class VehiclePreferencesFormComponent implements OnChanges {
  @Input() initialBudget: number | null = null;
  @Input() initialVehicleType = '';
  @Input() initialBrands = '';
  @Input() initialCity = '';
  @Input() initialUsage = '';

  @Output() saved = new EventEmitter<void>();

  budgetMax: number | null = null;
  preferredVehicleType = '';
  preferredBrands = '';
  city = '';
  vehicleUsage = '';

  saving = false;
  saveError = '';
  saveSuccess = false;

  collapsed = true;

  readonly vehicleTypes = ['Sedan', 'SUV', 'Berline', 'Break', 'Cabriolet', 'Pickup', 'Monospace', 'Citadine', 'Autre'];
  readonly usageOptions = ['City driving', 'Highway', 'Family', 'Business', 'Off-road', 'Mixed'];

  constructor(private userService: UserService) {}

  ngOnChanges(_: SimpleChanges): void {
    this.budgetMax = this.initialBudget;
    this.preferredVehicleType = this.initialVehicleType ?? '';
    this.preferredBrands = this.initialBrands ?? '';
    this.city = this.initialCity ?? '';
    this.vehicleUsage = this.initialUsage ?? '';
  }

  toggle(): void {
    this.collapsed = !this.collapsed;
  }

  save(): void {
    this.saving = true;
    this.saveError = '';
    this.saveSuccess = false;

    const payload: VehiclePreferencesPayload = {
      budgetMax: this.budgetMax,
      preferredVehicleType: this.preferredVehicleType || null,
      preferredBrands: this.preferredBrands || null,
      city: this.city || null,
      vehicleUsage: this.vehicleUsage || null,
    };

    this.userService.updateVehiclePreferences(payload).subscribe({
      next: () => {
        this.saving = false;
        this.saveSuccess = true;
        this.saved.emit();
        setTimeout(() => (this.saveSuccess = false), 3000);
      },
      error: () => {
        this.saving = false;
        this.saveError = 'Failed to save preferences. Please try again.';
      },
    });
  }
}
