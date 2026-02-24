import { Component } from '@angular/core';
import { TreasuryRow } from '../../../../models';

/**
 * ViewModel: treasury list (MVVM).
 */
@Component({
  selector: 'app-treasury-list',
  standalone: false,
  templateUrl: './treasury-list.html',
  styleUrl: './treasury-list.css',
})
export class TreasuryList {
  readonly pageTitle = 'Treasury';
  readonly pageSubtitle = 'Treasury accounts and cash movements.';

  readonly rows: TreasuryRow[] = [
    { id: 1, account: 'Main operations', balance: '125,000 TND' },
    { id: 2, account: 'Reserve fund', balance: '85,000 TND' },
    { id: 3, account: 'Agent settlements', balance: '42,500 TND' },
  ];

  onView(row: TreasuryRow): void {}
}
