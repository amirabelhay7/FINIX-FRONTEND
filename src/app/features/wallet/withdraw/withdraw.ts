import { Component } from '@angular/core';
import { WalletFormOption } from '../../../models';

/**
 * ViewModel: withdraw (MVVM).
 */
@Component({
  selector: 'app-withdraw',
  standalone: false,
  templateUrl: './withdraw.html',
  styleUrl: './withdraw.css',
})
export class Withdraw {
  readonly pageTitle = 'Withdraw';
  readonly pageSubtitle = 'Cash out to your bank or collect at an agent.';
  readonly balanceLabel = 'Available balance';
  readonly balanceAmount = '2,840.50 DT';
  readonly amountLabel = 'Amount (DT)';
  readonly methodLabel = 'Withdrawal method';
  readonly submitLabel = 'Request withdrawal';

  readonly withdrawalMethods: WalletFormOption[] = [
    { value: 'bank', label: 'Bank account' },
    { value: 'agent', label: 'Collect at agent' },
  ];
}
