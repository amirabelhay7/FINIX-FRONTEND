import { Component } from '@angular/core';
import { TransactionDetailData } from '../../../models';

/**
 * ViewModel: transaction detail (MVVM).
 */
@Component({
  selector: 'app-transaction-detail',
  standalone: false,
  templateUrl: './transaction-detail.html',
  styleUrl: './transaction-detail.css',
})
export class TransactionDetail {
  readonly data: TransactionDetailData = {
    pageTitle: 'Transaction details',
    refLabel: 'Transaction #1',
    type: 'Deposit',
    amount: '500.00 TND',
    date: '2025-02-20 14:30',
    status: 'Completed',
    statusClass: 'bg-green-50 text-green-700',
    reference: 'TXN-20250220-001',
  };

  readonly backRoute = '/wallet/transactions';
  readonly backLabel = 'Back to transactions';
}
