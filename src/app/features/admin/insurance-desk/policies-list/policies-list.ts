import { Component } from '@angular/core';
import { AdminPolicyRow } from '../../../../models';

/**
 * ViewModel: admin insurance policies list (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-policies-list',
  standalone: false,
  templateUrl: './policies-list.html',
  styleUrl: './policies-list.css',
})
export class PoliciesList {
  readonly pageTitle = 'Policies';
  readonly pageSubtitle = 'All insurance policies.';
  readonly backRoute = '/admin/insurance';

  readonly rows: AdminPolicyRow[] = [
    { id: 1, client: 'Amadou Kone', product: 'Micro-health basic', status: 'ACTIVE', statusClass: 'bg-green-50 text-green-700', viewRoute: '/admin/insurance/policies/1' },
  ];
}
