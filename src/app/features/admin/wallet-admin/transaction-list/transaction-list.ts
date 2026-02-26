import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs';
import { AdminTransactionLedgerRow, AdminFilterOption } from '../../../../models';
import { WalletService } from '../../../../core/wallet/wallet.service';

/** Row with sort keys and optional description for search */
export interface TransactionRowWithSort extends AdminTransactionLedgerRow {
  dateMs: number;
  amountNum: number;
  transactionTypeRaw: string;
  description: string;
}

function txToRow(t: { id: number; referenceNumber?: string; transactionType: string; amount: number; status: string; transactionDate?: string; description?: string }): TransactionRowWithSort {
  const positive = ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP'].includes(t.transactionType);
  const amountStr = (positive ? '+' : '-') + Math.abs(t.amount).toFixed(2) + ' TND';
  const statusClass = t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' : t.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600';
  const dateStr = t.transactionDate ? new Date(t.transactionDate).toLocaleString() : '';
  const dateMs = t.transactionDate ? new Date(t.transactionDate).getTime() : 0;
  return {
    id: t.id,
    ref: t.referenceNumber || '#' + t.id,
    type: t.transactionType.replace(/_/g, ' '),
    amount: amountStr,
    amountClass: positive ? 'text-emerald-600' : 'text-rose-600',
    status: t.status === 'COMPLETED' ? 'Completed' : t.status,
    statusClass,
    date: dateStr,
    viewRoute: '/admin/wallet/transactions/' + t.id,
    dateMs,
    amountNum: t.amount,
    transactionTypeRaw: t.transactionType,
    description: t.description || '',
  };
}

export type SortKey = 'date' | 'amount' | 'type' | 'status' | 'id' | 'ref';
export type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-transaction-list',
  standalone: false,
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionList implements OnInit {
  readonly backRoute = '/admin/wallet';
  readonly pageTitle = 'Transaction Ledger';
  readonly searchPlaceholder = 'Search by ref, type, ID, description…';
  readonly viewLabel = 'View';
  readonly emptyMessage = 'No transactions match your filters.';

  readonly typeOptions: AdminFilterOption[] = [
    { value: '', label: 'All types' },
    { value: 'DEPOSIT', label: 'Deposit' },
    { value: 'WITHDRAWAL', label: 'Withdrawal' },
    { value: 'TRANSFER_IN', label: 'Transfer in' },
    { value: 'TRANSFER_OUT', label: 'Transfer out' },
    { value: 'AGENT_TOP_UP', label: 'Agent top-up' },
  ];

  readonly statusOptions: AdminFilterOption[] = [
    { value: '', label: 'All statuses' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'FAILED', label: 'Failed' },
  ];

  readonly sortOptions: { key: SortKey; label: string }[] = [
    { key: 'date', label: 'Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'id', label: 'ID' },
    { key: 'ref', label: 'Reference' },
  ];

  rows: TransactionRowWithSort[] = [];
  searchQuery = '';
  typeFilter = '';
  statusFilter = '';
  sortKey: SortKey = 'date';
  sortDir: SortDir = 'desc';

  loading = true;
  error: string | null = null;

  constructor(
    private walletService: WalletService,
    private cdr: ChangeDetectorRef,
  ) {}

  get filteredRows(): TransactionRowWithSort[] {
    let list = this.rows;
    const q = (this.searchQuery || '').trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.ref.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          String(r.id).includes(q) ||
          r.status.toLowerCase().includes(q) ||
          (r.description && r.description.toLowerCase().includes(q))
      );
    }
    if (this.typeFilter) {
      list = list.filter((r) => r.transactionTypeRaw === this.typeFilter);
    }
    if (this.statusFilter) {
      list = list.filter((r) => r.status.toLowerCase() === this.statusFilter.toLowerCase() || (this.statusFilter === 'COMPLETED' && r.status === 'Completed'));
    }
    const key = this.sortKey;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (key) {
        case 'date':
          cmp = a.dateMs - b.dateMs;
          break;
        case 'amount':
          cmp = a.amountNum - b.amountNum;
          break;
        case 'type':
          cmp = (a.type || '').localeCompare(b.type || '');
          break;
        case 'status':
          cmp = (a.status || '').localeCompare(b.status || '');
          break;
        case 'id':
          cmp = a.id - b.id;
          break;
        case 'ref':
          cmp = (a.ref || '').localeCompare(b.ref || '');
          break;
        default:
          cmp = a.dateMs - b.dateMs;
      }
      return cmp * dir;
    });
  }

  setSort(key: SortKey): void {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = key === 'date' || key === 'amount' ? 'desc' : 'asc';
    }
    this.cdr.detectChanges();
  }

  sortIcon(key: SortKey): string {
    if (this.sortKey !== key) return 'unfold_more';
    return this.sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  onSortKeyChange(key: SortKey): void {
    this.sortKey = key;
    this.sortDir = key === 'date' || key === 'amount' ? 'desc' : 'asc';
    this.cdr.detectChanges();
  }

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
