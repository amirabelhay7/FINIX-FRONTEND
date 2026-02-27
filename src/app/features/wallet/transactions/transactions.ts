import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { TransactionsPageKpis, TransactionRow, TransactionApi } from '../../../models';
import { WalletService } from '../../../core/wallet/wallet.service';

function typeClass(type: string): string {
  const m: Record<string, string> = {
    DEPOSIT: 'bg-green-50 text-green-700 border-green-100',
    WITHDRAWAL: 'bg-red-50 text-red-700 border-red-100',
    TRANSFER_OUT: 'bg-purple-50 text-purple-700 border-purple-100',
    TRANSFER_IN: 'bg-purple-50 text-purple-700 border-purple-100',
    AGENT_TOP_UP: 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return m[type] ?? 'bg-gray-50 text-gray-700 border-gray-100';
}

function statusClass(status: string): { dot: string; text: string } {
  const u = (status || '').toUpperCase();
  if (u === 'COMPLETED' || u === 'SUCCESS') return { dot: 'bg-green-500', text: 'text-green-600' };
  if (u === 'PENDING') return { dot: 'bg-yellow-400', text: 'text-yellow-600' };
  if (u === 'FAILED' || u === 'CANCELLED') return { dot: 'bg-red-500', text: 'text-red-600' };
  return { dot: 'bg-gray-400', text: 'text-gray-600' };
}

function txApiToRow(t: TransactionApi): TransactionRow {
  const type = t?.transactionType ?? '';
  const positive = ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP'].includes(type);
  const amount = Number(t?.amount) ?? 0;
  const amountStr = (positive ? '+' : '-') + Math.abs(amount).toFixed(2) + ' TND';
  const sc = statusClass(t?.status ?? '');
  const rawDate = t?.transactionDate ? new Date(t.transactionDate as string | number) : null;
  const dateStr = rawDate ? rawDate.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  return {
    id: t?.id,
    ref: '#' + (t?.referenceNumber || String(t?.id ?? '')),
    type: type.replace(/_/g, ' '),
    typeClass: typeClass(type),
    description: t?.description ?? '',
    amount: amountStr,
    amountPositive: positive,
    status: (t?.status === 'COMPLETED' ? 'Success' : t?.status) ?? '',
    statusDotClass: sc.dot,
    statusTextClass: sc.text,
    date: dateStr,
    dateMs: rawDate ? rawDate.getTime() : undefined,
  };
}

@Component({
  selector: 'app-transactions',
  standalone: false,
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  readonly pageTitle = 'Transaction History';
  readonly pageSubtitle = 'Your complete immutable financial ledger.';

  kpis: TransactionsPageKpis = {
    totalIn: '+0 TND',
    totalOut: '-0 TND',
    net: '+0 TND',
    count: '0',
    countLabel: '',
  };
  transactions: TransactionRow[] = [];
  loading = true;
  error: string | null = null;
  paginationLabel = '';

  /** Filter state */
  filterSearch = '';
  filterType = '';
  filterDateRange = 'all';
  filterStatus = '';

  /** Pagination: client-side over filtered list */
  currentPage = 1;
  pageSize = 10;
  readonly pageSizeOptions = [10, 25, 50, 100];

  constructor(
    private walletService: WalletService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.walletService.getMyTransactions().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (list) => {
        const items = Array.isArray(list) ? list : [];
        this.transactions = items.map((t) => txApiToRow(t as TransactionApi));
        let inSum = 0, outSum = 0;
        items.forEach((t: TransactionApi) => {
          const amt = Number(t.amount) ?? 0;
          if (['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP'].includes(t.transactionType || '')) inSum += amt;
          else outSum += amt;
        });
        this.kpis = {
          totalIn: '+' + inSum.toFixed(2) + ' TND',
          totalOut: '-' + outSum.toFixed(2) + ' TND',
          net: (inSum - outSum >= 0 ? '+' : '') + (inSum - outSum).toFixed(2) + ' TND',
          count: String(items.length),
          countLabel: '',
        };
        this.paginationLabel = items.length === 0 ? 'No transactions' : `Showing ${items.length} transaction(s)`;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load transactions';
        this.cdr.detectChanges();
      },
    });
  }

  /** Returns transactions filtered by search, type, date range, and status. */
  getFilteredTransactions(): TransactionRow[] {
    let list = this.transactions;
    const q = this.filterSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (tx) =>
          tx.ref.toLowerCase().includes(q) ||
          tx.description.toLowerCase().includes(q) ||
          tx.type.toLowerCase().includes(q)
      );
    }
    if (this.filterType) {
      if (this.filterType === 'TRANSFER') {
        list = list.filter((tx) => tx.type.toUpperCase().includes('TRANSFER'));
      } else {
        list = list.filter((tx) => tx.type.toUpperCase().replace(/\s/g, '_') === this.filterType);
      }
    }
    if (this.filterDateRange && this.filterDateRange !== 'all') {
      const days = parseInt(this.filterDateRange, 10);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      list = list.filter((tx) => (tx.dateMs ?? 0) >= cutoff);
    }
    if (this.filterStatus) {
      const want = this.filterStatus.toUpperCase();
      list = list.filter(
        (tx) =>
          tx.status.toUpperCase() === want ||
          (want === 'SUCCESS' && tx.status === 'Success')
      );
    }
    return list;
  }

  /** Total number of filtered transactions. */
  get filteredTotal(): number {
    return this.getFilteredTransactions().length;
  }

  /** Total number of pages for current pageSize. */
  get totalPages(): number {
    const n = this.filteredTotal;
    return n === 0 ? 1 : Math.ceil(n / this.pageSize);
  }

  /** Slice of filtered transactions for the current page. */
  getPaginatedTransactions(): TransactionRow[] {
    const list = this.getFilteredTransactions();
    const start = (this.currentPage - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  }

  /** Human-readable range for footer (e.g. "1–10 of 45"). */
  get paginationRange(): string {
    const total = this.filteredTotal;
    if (total === 0) return '0 of 0';
    const start = (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, total);
    return `${start}–${end} of ${total}`;
  }

  goToPage(page: number): void {
    const p = Math.max(1, Math.min(page, this.totalPages));
    if (p !== this.currentPage) {
      this.currentPage = p;
      this.cdr.detectChanges();
    }
  }

  /** Page numbers to show in pagination (use -1 for ellipsis). */
  getPageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 3) return [1, 2, 3, 4, -1, total];
    if (current >= total - 2) return [1, -1, total - 3, total - 2, total - 1, total];
    return [1, -1, current - 1, current, current + 1, -1, total];
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  onExportCsv(): void {
    const headers = ['Ref', 'Type', 'Description', 'Amount', 'Status', 'Date'];
    const escape = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
    const rows = this.getFilteredTransactions().map((tx) =>
      [tx.ref, tx.type, tx.description, tx.amount, tx.status, tx.date].map(escape).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
