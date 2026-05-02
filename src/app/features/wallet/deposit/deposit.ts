import { Component } from '@angular/core';
import { WalletFormOption } from '../../../models';

/**
 * ViewModel: deposit (MVVM).
 */
@Component({
  selector: 'app-deposit',
  standalone: false,
  templateUrl: './deposit.html',
  styleUrl: './deposit.css',
})
export class Deposit {
  readonly pageTitle = 'Deposit (Online)';
  readonly pageSubtitle = 'Add funds by card or bank transfer.';
  readonly amountLabel = 'Amount (DT)';
  readonly methodLabel = 'Payment method';
  readonly continueLabel = 'Continue to payment';
  readonly infoText = 'Unbanked? Top up in cash at an agent near you — no card needed.';
  readonly findAgentLabel = 'Find agent →';
  readonly findAgentRoute = '/wallet/agent-top-up';

  readonly paymentMethods: WalletFormOption[] = [
    { value: 'card', label: 'Card' },
    { value: 'bank', label: 'Bank transfer' },
  ];
}
