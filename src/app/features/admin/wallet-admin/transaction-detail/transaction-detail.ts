import { Component } from '@angular/core';
import { AdminTransactionDetailData } from '../../../../models';

/**
 * ViewModel: admin transaction detail (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-transaction-detail',
  standalone: false,
  templateUrl: './transaction-detail.html',
  styleUrl: './transaction-detail.css',
})
export class TransactionDetail {
  readonly vm: AdminTransactionDetailData = {
    backRoute: '/admin/wallet/transactions',
    pageTitle: 'Transaction TXN-992144',
    pageSubtitle: 'Deposit · Completed',
    fields: [
      { label: 'ID', value: '101', valueClass: 'font-mono' },
      { label: 'Reference', value: 'TXN-992144', valueClass: 'font-mono' },
      { label: 'Type', value: 'DEPOSIT' },
      { label: 'Amount', value: '+1,450.00 DT', valueClass: 'text-green-600' },
      { label: 'Status', value: 'Completed', valueClass: 'px-2 py-0.5 rounded text-xs bg-green-50 text-green-700', isBadge: true },
      { label: 'Date', value: '2025-02-24 10:32:15' },
      { label: 'Description', value: 'Wallet top-up via agent' },
    ],
  };
}
