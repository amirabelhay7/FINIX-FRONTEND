import { Component } from '@angular/core';
import { AdminTransactionLedgerRow, AdminFilterOption } from '../../../../models';

/**
 * ViewModel: admin transaction ledger (MVVM).
 * All static data and filter options in VM; view only binds.
 */
@Component({
  selector: 'app-transaction-list',
  standalone: false,
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionList {
  readonly backRoute = '/admin/wallet';
  readonly pageTitle = 'Transaction Ledger';
  readonly searchPlaceholder = 'Search by ref, type...';

  readonly typeOptions: AdminFilterOption[] = [
    { value: '', label: 'All types' },
    { value: 'DEPOSIT', label: 'DEPOSIT' },
    { value: 'WITHDRAWAL', label: 'WITHDRAWAL' },
    { value: 'TRANSFER', label: 'TRANSFER' },
  ];

  readonly rows: AdminTransactionLedgerRow[] = [
    { id: 101, ref: 'TXN-992144', type: 'DEPOSIT', amount: '+1,450.00 DT', amountClass: 'text-green-600', status: 'Completed', statusClass: 'bg-green-50 text-green-700', date: '2025-02-24 10:32', viewRoute: '/admin/wallet/transactions/101' },
    { id: 102, ref: 'TXN-992145', type: 'TRANSFER', amount: '-200.00 DT', amountClass: 'text-red-500', status: 'Completed', statusClass: 'bg-green-50 text-green-700', date: '2025-02-24 10:18', viewRoute: '/admin/wallet/transactions/102' },
  ];
  readonly viewLabel = 'View';
}
