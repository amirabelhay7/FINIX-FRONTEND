import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminTransactionDetailData } from '../../../../models';
import { WalletService } from '../../../../core/wallet/wallet.service';

@Component({
  selector: 'app-transaction-detail',
  standalone: false,
  templateUrl: './transaction-detail.html',
  styleUrl: './transaction-detail.css',
})
export class TransactionDetail implements OnInit {
  vm: AdminTransactionDetailData = {
    backRoute: '/admin/wallet/transactions',
    pageTitle: 'Transaction',
    pageSubtitle: '—',
    fields: [],
  };
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private walletService: WalletService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const numId = id ? +id : 0;
    if (!numId) {
      this.loading = false;
      this.error = 'Invalid transaction id';
      this.cdr.detectChanges();
      return;
    }
    this.walletService.getTransactionByIdAdmin(numId).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (t) => {
        if (!t) {
          this.error = 'Transaction not found';
          return;
        }
        try {
          const status = t.status ?? '—';
          const statusClass = status === 'COMPLETED' ? 'px-2 py-0.5 rounded text-xs bg-green-50 text-green-700' : status === 'PENDING' ? 'px-2 py-0.5 rounded text-xs bg-yellow-50 text-yellow-700' : 'px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600';
          const amountNum = typeof t.amount === 'number' ? t.amount : Number(t.amount);
          const amountStr = (Number.isFinite(amountNum) ? amountNum.toFixed(2) : '—') + ' TND';
          const typeStr = (t.transactionType ?? '').replace(/_/g, ' ');
          const dateStr = t.transactionDate ? (typeof t.transactionDate === 'string' ? new Date(t.transactionDate) : new Date((t.transactionDate as unknown) as string)).toLocaleString() : '—';
          this.vm = {
            backRoute: '/admin/wallet/transactions',
            pageTitle: 'Transaction ' + (t.referenceNumber || '#' + (t.id ?? '')),
            pageSubtitle: typeStr + (status ? ' · ' + status : ''),
            fields: [
              { label: 'ID', value: String(t.id ?? '—'), valueClass: 'font-mono' },
              { label: 'Reference', value: (t.referenceNumber || String(t.id ?? '—')), valueClass: 'font-mono' },
              { label: 'Type', value: typeStr || '—' },
              { label: 'Amount', value: amountStr },
              { label: 'Status', value: status, valueClass: statusClass, isBadge: true },
              { label: 'Date', value: dateStr },
              { label: 'Description', value: t.description ?? '—' },
            ],
          };
        } catch (e) {
          this.error = (e instanceof Error ? e.message : 'Invalid transaction data') as string;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load transaction';
        this.cdr.detectChanges();
      },
    });
  }
}
