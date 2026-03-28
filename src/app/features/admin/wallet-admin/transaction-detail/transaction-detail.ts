import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletService, TransactionApi } from '../../../../services/wallet/wallet.service';

@Component({
  selector: 'app-transaction-detail',
  standalone: false,
  templateUrl: './transaction-detail.html',
  styleUrl: './transaction-detail.css',
})
export class TransactionDetail implements OnInit {
  txn: TransactionApi | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private walletService: WalletService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.walletService.getTransactionById(id).subscribe({
      next: (t) => { this.txn = t; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Transaction not found'; this.loading = false; },
    });
  }

  isPositive(): boolean {
    return this.txn ? ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP', 'ADMIN_TOP_UP'].includes(this.txn.transactionType) : false;
  }

  formatDate(d: string): string {
    return d ? new Date(d).toLocaleString() : '';
  }

  goBack(): void {
    this.router.navigate(['/admin/wallet/transactions']);
  }
}
