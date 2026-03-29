import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs';
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

  constructor(
    private walletService: WalletService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.walletService.adminGetAllTransactions().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        try {
          const arr = Array.isArray(data) ? data : [];
          this.txs = arr;
          console.log('Global transactions loaded:', this.txs.length);
        } catch (e) {
          this.error = (e instanceof Error ? e.message : 'Invalid transaction data') as string;
        }
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load global transactions';
      }
    });
  }

  isPositive(t: TransactionApi): boolean {
    return ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP', 'ADMIN_TOP_UP'].includes(t.transactionType);
  }

  formatDate(d: string): string {
    return d ? new Date(d).toLocaleString() : '';
  }
}
