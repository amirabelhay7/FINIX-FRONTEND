import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { TransactionDetailData } from '../../../models';
import { WalletService } from '../../../core/wallet/wallet.service';

@Component({
  selector: 'app-transaction-detail',
  standalone: false,
  templateUrl: './transaction-detail.html',
  styleUrl: './transaction-detail.css',
})
export class TransactionDetail implements OnInit {
  data: TransactionDetailData = {
    pageTitle: 'Transaction details',
    refLabel: '—',
    type: '—',
    amount: '—',
    date: '—',
    status: '—',
    statusClass: 'bg-gray-50 text-gray-700',
    reference: '—',
  };
  readonly backRoute = '/wallet/transactions';
  readonly backLabel = 'Back to transactions';
  loading = true;
  error: string | null = null;
  /** True for deposit / transfer in / agent top-up (amount shown in green). */
  amountPositive = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
    this.walletService.getMyTransaction(numId).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (t) => {
        const status = t?.status ?? '';
        const statusClass =
          status === 'COMPLETED'
            ? 'bg-green-50 text-green-700'
            : status === 'PENDING'
              ? 'bg-yellow-50 text-yellow-700'
              : 'bg-red-50 text-red-700';
        const amount = Number(t?.amount) ?? 0;
        const dateRaw = t?.transactionDate;
        const dateStr = dateRaw
          ? new Date(dateRaw as string | number).toLocaleString()
          : '—';
        this.amountPositive = ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP'].includes(t?.transactionType ?? '');
        this.data = {
          pageTitle: 'Transaction details',
          refLabel: '#' + (t?.referenceNumber || String(t?.id ?? '')),
          type: (t?.transactionType ?? '').replace(/_/g, ' '),
          amount: amount.toFixed(2) + ' TND',
          date: dateStr,
          status: status === 'COMPLETED' ? 'Success' : status || '—',
          statusClass,
          reference: t?.referenceNumber || String(t?.id ?? ''),
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err?.status === 404) {
          this.router.navigate([this.backRoute], { queryParams: { notFound: '1' } });
          return;
        }
        this.error = err?.error?.message || err?.message || 'Failed to load transaction';
        this.cdr.detectChanges();
      },
    });
  }
}
