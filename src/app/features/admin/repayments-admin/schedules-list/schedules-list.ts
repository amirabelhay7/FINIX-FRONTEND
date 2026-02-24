import { Component } from '@angular/core';
import { AdminScheduleRow } from '../../../../models';

/**
 * ViewModel: admin repayment schedules list (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-schedules-list',
  standalone: false,
  templateUrl: './schedules-list.html',
  styleUrl: './schedules-list.css',
})
export class SchedulesList {
  readonly pageTitle = 'Repayment schedules';
  readonly pageSubtitle = 'Schedules linked to loan contracts (total amount, status).';
  readonly backRoute = '/admin/repayments';

  readonly rows: AdminScheduleRow[] = [
    { id: 1, totalAmount: '5,000.00 TND', status: 'ACTIVE', statusClass: 'bg-green-50 text-green-700', created: '2025-01-15', viewRoute: '/admin/repayments/schedules/1' },
    { id: 2, totalAmount: '3,200.00 TND', status: 'OVERDUE', statusClass: 'bg-amber-50 text-amber-700', created: '2025-02-01', viewRoute: '/admin/repayments/schedules/2' },
  ];
}
