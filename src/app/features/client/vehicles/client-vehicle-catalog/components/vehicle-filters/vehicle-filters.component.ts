import { Component, EventEmitter, Input, Output } from '@angular/core';
import { VehicleStatus } from '../../../../../../models';

@Component({
  selector: 'app-vehicle-filters',
  standalone: false,
  templateUrl: './vehicle-filters.component.html',
  styleUrl: './vehicle-filters.component.css',
})
export class VehicleFiltersComponent {
  @Input() filterQ = '';
  @Input() filterStatus: VehicleStatus | '' = '';
  @Input() sortKey = 'price_asc';
  @Input() onlyWithImage = false;
  @Input() statuses: VehicleStatus[] = [];
  @Input() statusLabels: Record<VehicleStatus, string> = {
    DISPONIBLE: 'Available',
    RESERVE: 'Reserved',
    VENDU: 'Sold',
    INACTIF: 'Inactive',
  };
  @Input() loading = false;

  @Output() qInput = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<VehicleStatus | ''>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() withImageChange = new EventEmitter<boolean>();
  @Output() apply = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
}
