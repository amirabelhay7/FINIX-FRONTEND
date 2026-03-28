import { Component, OnInit } from '@angular/core';
import { WalletService, TransactionApi } from '../../../../services/wallet/wallet.service';

@Component({
  selector: 'app-transaction-list',
  standalone: false,
  templateUrl: './transaction-list.html',
  styleUrl: './transaction-list.css',
})
export class TransactionList implements OnInit {
  readonly pageTitle = 'Global Ledger';
  txs: TransactionApi[] = [];
  loading = true;
  error: string | null = null;

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    this.walletService.adminGetAllTransactions().subscribe({
      next: (data) => {
        this.txs = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load global transactions';
        this.loading = false;
      },
    });
  }

  isPositive(t: TransactionApi): boolean {
    return ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP', 'ADMIN_TOP_UP'].includes(t.transactionType);
  }

  formatDate(d: string): string {
    return d ? new Date(d).toLocaleString() : '';
  }
}
