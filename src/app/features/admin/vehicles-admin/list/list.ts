import { Component } from '@angular/core';
import { AdminHubCard } from '../../../../models';

/**
 * ViewModel: vehicles admin hub (MVVM).
 */
@Component({
  selector: 'app-admin-vehicles-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  readonly pageTitle = 'Vehicles admin';
  readonly pageSubtitle = 'Vehicle credit: vehicles, deliveries, documents.';

  readonly cards: AdminHubCard[] = [
    { title: 'Vehicles', subtitle: 'Financed vehicles', route: '/admin/vehicles/vehicles', icon: 'directions_car', iconColorClass: 'text-[#135bec]' },
    { title: 'Deliveries', subtitle: 'Delivery tracking', route: '/admin/vehicles/deliveries', icon: 'local_shipping', iconColorClass: 'text-green-600' },
  ];
}
