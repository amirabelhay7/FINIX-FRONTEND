import { Component } from '@angular/core';
import { AdminPenaltyRow } from '../../../../models';

/**
 * ViewModel: admin penalties list (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-penalties-list',
  standalone: false,
  templateUrl: './penalties-list.html',
  styleUrl: './penalties-list.css',
})
export class PenaltiesList {
  readonly pageTitle = 'Penalties';
  readonly pageSubtitle = 'Late fees and penalties (amount, status).';
  readonly backRoute = '/admin/repayments';

  readonly rows: AdminPenaltyRow[] = [
    { id: 1, amount: '25.00 TND', status: 'PENDING', statusClass: 'bg-amber-50 text-amber-700', viewRoute: '/admin/repayments/penalties/1' },
    { id: 2, amount: '50.00 TND', status: 'PAID', statusClass: 'bg-green-50 text-green-700', viewRoute: '/admin/repayments/penalties/2' },
  ];
}
