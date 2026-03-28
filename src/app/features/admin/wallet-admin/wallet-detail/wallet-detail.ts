import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { WalletService, WalletApi, TransactionApi } from '../../../../services/wallet/wallet.service';

@Component({
  selector: 'app-wallet-detail',
  standalone: false,
  templateUrl: './wallet-detail.html',
  styleUrl: './wallet-detail.css',
})
export class WalletDetail implements OnInit {
  wallet: WalletApi | null = null;
  transactions: TransactionApi[] = [];
  loading = true;
  error: string | null = null;
  
  creditAmount: number | null = null;
  creditDescription = '';
  creditLoading = false;

  constructor(
    private route: ActivatedRoute,
    private walletService: WalletService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadData(userId);
  }

  loadData(userId: number): void {
    this.loading = true;
    this.walletService.adminGetWallet(userId).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (w) => {
        this.wallet = w;
        this.walletService.adminGetUserTransactions(userId).subscribe({
          next: (txs) => {
            this.transactions = txs;
          },
          error: () => { }
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'Wallet not found';
      }
    });
  }

  applyCredit(): void {
    if (!this.creditAmount || this.creditAmount <= 0) return;
    this.creditLoading = true;
    this.walletService.adminCredit(this.wallet!.id, { 
      amount: this.creditAmount, 
      description: this.creditDescription || 'Admin adjustment' 
    }).pipe(
      finalize(() => {
        this.creditLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (w) => {
        this.wallet = w;
        this.creditAmount = null;
        this.creditDescription = '';
        this.loadData(w.id); // Reload transactions
      },
      error: (err) => {
        alert(err?.error?.message || 'Credit failed');
      }
    });
  }

  formatDate(d: string): string {
    return d ? new Date(d).toLocaleString() : '';
  }

  isPositive(t: TransactionApi): boolean {
    return ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP', 'ADMIN_TOP_UP'].includes(t.transactionType);
  }
}
