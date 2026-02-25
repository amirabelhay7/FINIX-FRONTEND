import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const numId = id ? +id : 0;
    if (!numId) {
      this.loading = false;
      this.error = 'Invalid transaction id';
      return;
    }
    this.walletService.getTransactionByIdAdmin(numId).subscribe({
      next: (t) => {
        const statusClass = t.status === 'COMPLETED' ? 'px-2 py-0.5 rounded text-xs bg-green-50 text-green-700' : t.status === 'PENDING' ? 'px-2 py-0.5 rounded text-xs bg-yellow-50 text-yellow-700' : 'px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600';
        const amountStr = t.amount.toFixed(2) + ' TND';
        this.vm = {
          backRoute: '/admin/wallet/transactions',
          pageTitle: 'Transaction ' + (t.referenceNumber || '#' + t.id),
          pageSubtitle: t.transactionType.replace(/_/g, ' ') + ' · ' + t.status,
          fields: [
            { label: 'ID', value: String(t.id), valueClass: 'font-mono' },
            { label: 'Reference', value: t.referenceNumber || String(t.id), valueClass: 'font-mono' },
            { label: 'Type', value: t.transactionType.replace(/_/g, ' ') },
            { label: 'Amount', value: amountStr },
            { label: 'Status', value: t.status, valueClass: statusClass, isBadge: true },
            { label: 'Date', value: t.transactionDate ? new Date(t.transactionDate).toLocaleString() : '—' },
            { label: 'Description', value: t.description ?? '—' },
          ],
        };
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to load transaction';
      },
    });
  }
}
