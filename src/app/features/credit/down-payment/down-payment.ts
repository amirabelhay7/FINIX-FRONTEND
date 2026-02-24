import { Component } from '@angular/core';

/**
 * ViewModel: down payment (MVVM).
 */
@Component({
  selector: 'app-down-payment',
  standalone: false,
  templateUrl: './down-payment.html',
  styleUrl: './down-payment.css',
})
export class DownPayment {
  readonly pageTitle = 'Down Payment';
  readonly pageSubtitle = 'Pay from your wallet to continue.';
  readonly backRoute = '/credit/application/1';
  readonly dueLabel = 'Due';
  readonly dueAmount = '500 TND';
  readonly dueMeta = 'Request #REQ-2025-008 · Vehicle credit';
  readonly walletNote = 'Your wallet balance: 2,840.50 TND. You can use savings from your Savings Challenge as part of the down payment.';
  readonly amountLabel = 'Amount to pay now (TND)';
  readonly submitLabel = 'Pay from wallet';
}
