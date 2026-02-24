import { Component } from '@angular/core';
import { AdminInsuranceProductRow } from '../../../../models';

/**
 * ViewModel: admin insurance products list (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-products-list',
  standalone: false,
  templateUrl: './products-list.html',
  styleUrl: './products-list.css',
})
export class ProductsList {
  readonly pageTitle = 'Insurance products';
  readonly pageSubtitle = 'Create and manage insurance products.';
  readonly backRoute = '/admin/insurance';
  readonly addProductLabel = 'Add product';
  readonly addProductRoute = '/admin/insurance/products/new';
  readonly editLabel = 'Edit';
  readonly deleteLabel = 'Delete';

  readonly rows: AdminInsuranceProductRow[] = [
    { id: 1, name: 'Micro-health basic', type: 'HEALTH', premium: '50 TND/mo', editRoute: '/admin/insurance/products/1' },
  ];
}
