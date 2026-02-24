import { Component } from '@angular/core';
import { AdminClaimRow } from '../../../../models';

/**
 * ViewModel: admin insurance claims list (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-claims-list',
  standalone: false,
  templateUrl: './claims-list.html',
  styleUrl: './claims-list.css',
})
export class ClaimsList {
  readonly pageTitle = 'Claims';
  readonly pageSubtitle = 'Review and process insurance claims.';
  readonly backRoute = '/admin/insurance';

  readonly rows: AdminClaimRow[] = [
    { id: 1, policy: '#1 – Amadou Kone', amount: '500 TND', status: 'PENDING', statusClass: 'bg-amber-50 text-amber-700', actionLabel: 'Review', viewRoute: '/admin/insurance/claims/1' },
  ];
}
