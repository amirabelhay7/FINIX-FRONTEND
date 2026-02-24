import { Component } from '@angular/core';
import { AdminGraceRow } from '../../../../models';

/**
 * ViewModel: admin grace periods list (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-grace-list',
  standalone: false,
  templateUrl: './grace-list.html',
  styleUrl: './grace-list.css',
})
export class GraceList {
  readonly pageTitle = 'Grace periods';
  readonly pageSubtitle = 'Grace days, start/end date, type, reason, status.';
  readonly backRoute = '/admin/repayments';

  readonly rows: AdminGraceRow[] = [
    { id: 1, graceDays: 7, startEnd: '2025-02-15 – 2025-02-22', type: 'EXTENSION', status: 'ACTIVE', statusClass: 'bg-green-50 text-green-700', viewRoute: '/admin/repayments/grace/1' },
  ];
}
