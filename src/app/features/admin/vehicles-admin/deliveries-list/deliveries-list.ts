import { Component } from '@angular/core';
import { AdminDeliveryRow } from '../../../../models';

/**
 * ViewModel: admin deliveries list (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-deliveries-list',
  standalone: false,
  templateUrl: './deliveries-list.html',
  styleUrl: './deliveries-list.css',
})
export class DeliveriesList {
  readonly pageTitle = 'Deliveries';
  readonly pageSubtitle = 'Vehicle delivery tracking.';
  readonly backRoute = '/admin/vehicles';

  readonly rows: AdminDeliveryRow[] = [
    { id: 1, vehicle: 'Peugeot 208', seller: 'Auto Sfax', status: 'IN_TRANSIT', statusClass: 'bg-amber-50 text-amber-700', viewRoute: '/admin/vehicles/deliveries/1' },
  ];
}
