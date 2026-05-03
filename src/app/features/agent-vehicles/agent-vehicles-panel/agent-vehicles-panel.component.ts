import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { VehicleStatus } from '../../../models/vehicle.model';

@Component({
  selector: 'app-agent-vehicles-panel',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './agent-vehicles-panel.component.html',
  styleUrl: './agent-vehicles-panel.component.css',
})
export class AgentVehiclesPanelComponent {
  private readonly fb = inject(FormBuilder);

  readonly statusOptions: VehicleStatus[] = ['DISPONIBLE', 'RESERVE', 'VENDU', 'INACTIF'];
  readonly fuelOptions = ['ESSENCE', 'DIESEL', 'HYBRIDE', 'ELECTRIQUE'];
  readonly transmissionOptions = ['MANUELLE', 'AUTOMATIQUE'];

  readonly form: FormGroup = this.fb.group({
    id: [null as number | null],
    sellerId: [null as number | null, [Validators.required]],
    marque: ['', [Validators.required, Validators.maxLength(120)]],
    modele: ['', [Validators.required, Validators.maxLength(120)]],
    title: ['', [Validators.required, Validators.maxLength(120)]],
    reference: ['', [Validators.required, Validators.maxLength(80)]],
    registrationNumber: ['', [Validators.maxLength(80)]],
    color: ['', [Validators.maxLength(40)]],
    mileage: [0, [Validators.required, Validators.min(0)]],
  });
}
