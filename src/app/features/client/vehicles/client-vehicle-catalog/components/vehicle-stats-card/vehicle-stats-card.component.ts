import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-vehicle-stats-card',
  standalone: false,
  templateUrl: './vehicle-stats-card.component.html',
  styleUrl: './vehicle-stats-card.component.css',
})
export class VehicleStatsCardComponent {
  @Input() total = 0;
  @Input() loading = false;
}
