import { Component } from '@angular/core';
import { AdminRecoveryRow } from '../../../../models';

/**
 * ViewModel: admin recovery actions list (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-recovery-list',
  standalone: false,
  templateUrl: './recovery-list.html',
  styleUrl: './recovery-list.css',
})
export class RecoveryList {
  readonly pageTitle = 'Recovery actions';
  readonly pageSubtitle = 'Collection actions (type, result, description, date).';
  readonly backRoute = '/admin/repayments';

  readonly rows: AdminRecoveryRow[] = [
    { id: 1, actionType: 'REMINDER_CALL', result: 'SUCCESS', resultClass: 'bg-green-50 text-green-700', description: 'Client promised payment by Friday', date: '2025-02-20 09:00', viewRoute: '/admin/repayments/recovery/1' },
  ];
}
