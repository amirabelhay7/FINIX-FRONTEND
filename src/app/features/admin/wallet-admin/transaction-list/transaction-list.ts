import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminTransactionLedgerRow, AdminFilterOption } from '../../../../models';
import { WalletService } from '../../../../core/wallet/wallet.service';

function txToRow(t: { id: number; referenceNumber?: string; transactionType: string; amount: number; status: string; transactionDate?: string }): AdminTransactionLedgerRow {
  const positive = ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP'].includes(t.transactionType);
  const amountStr = (positive ? '+' : '-') + Math.abs(t.amount).toFixed(2) + ' TND';
  const statusClass = t.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : t.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600';
  const dateStr = t.transactionDate ? new Date(t.transactionDate).toLocaleString() : '';
  return {
    id: t.id,
    ref: t.referenceNumber || '#' + t.id,
    type: t.transactionType.replace(/_/g, ' '),
    amount: amountStr,
    amountClass: positive ? 'text-green-600' : 'text-red-500',
    status: t.status === 'COMPLETED' ? 'Completed' : t.status,
    statusClass,
    date: dateStr,
    viewRoute: '/admin/wallet/transactions/' + t.id,
  };
}

@Component({
  selector: 'app-transaction-list',
  standalone: false,
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionList implements OnInit {
  readonly backRoute = '/admin/wallet';
  readonly pageTitle = 'Transaction Ledger';
  readonly searchPlaceholder = 'Search by ref, type...';
  readonly viewLabel = 'View';

  readonly typeOptions: AdminFilterOption[] = [
    { value: '', label: 'All types' },
    { value: 'DEPOSIT', label: 'DEPOSIT' },
    { value: 'WITHDRAWAL', label: 'WITHDRAWAL' },
    { value: 'TRANSFER', label: 'TRANSFER' },
  ];

  rows: AdminTransactionLedgerRow[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private walletService: WalletService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.walletService.getAllTransactionsAdmin().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (list) => {
        try {
          const arr = Array.isArray(list) ? list : [];
          this.rows = arr.map(txToRow);
        } catch (e) {
          this.error = (e instanceof Error ? e.message : 'Invalid response') as string;
        }
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load transactions';
      },
    });
  }
}
