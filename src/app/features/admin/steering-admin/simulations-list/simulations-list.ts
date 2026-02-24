import { Component } from '@angular/core';
import { SimulationRow } from '../../../../models';

/**
 * ViewModel: simulations list (MVVM).
 */
@Component({
  selector: 'app-simulations-list',
  standalone: false,
  templateUrl: './simulations-list.html',
  styleUrl: './simulations-list.css',
})
export class SimulationsList {
  readonly pageTitle = 'Simulations';
  readonly pageSubtitle = 'Scenario simulations.';
  readonly backRoute = '/admin/steering';

  readonly rows: SimulationRow[] = [
    { id: 1, name: 'Q2 rate increase', created: '2025-02-01' },
    { id: 2, name: 'Default rate stress', created: '2025-01-15' },
  ];
}
