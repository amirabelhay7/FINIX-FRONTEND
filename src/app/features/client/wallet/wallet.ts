import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs';
import { WalletService, WalletApi, TransactionApi } from '../../../services/wallet/wallet.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-client-wallet',
  standalone: false,
  templateUrl: './wallet.html',
  styleUrl: './wallet.css',
})
export class ClientWallet implements OnInit {
  loading = true;
  error: string | null = null;
  wallet: WalletApi | null = null;
  transactions: TransactionApi[] = [];

  constructor(
    private walletService: WalletService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    console.log('ClientWallet initialized');
    console.log('Token exists:', !!this.authService.getToken());
    console.log('User name:', this.authService.getUserName());
    console.log('User role:', this.authService.getRole());
    this.loadWalletData();
  }

  loadWalletData(): void {
    this.loading = true;
    this.error = null;

    console.log('Starting to load wallet data...');

    // Load wallet data
    this.walletService.getMyWallet()
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (data: WalletApi) => {
          console.log('Wallet API response:', data);
          this.wallet = data;
          console.log('Wallet loaded:', this.wallet);
        },
        error: (err) => {
          console.error('Wallet API error:', err);
          this.error = err?.error?.message || 'Failed to load wallet data';
          console.error('Wallet error:', err);
        }
      });

    // Load transactions
    this.walletService.getMyTransactions()
      .subscribe({
        next: (data: TransactionApi[]) => {
          console.log('Transactions API response:', data);
          this.transactions = Array.isArray(data) ? data : [];
          console.log('Transactions loaded:', this.transactions);
        },
        error: (err) => {
          console.error('Transactions API error:', err);
          // Don't set main error for transactions, just log it
        }
      });
  }

  formatBalance(amount: number): string {
    return (amount ?? 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' TND';
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-TN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  }

  getTransactionIcon(transactionType: string): string {
    switch (transactionType?.toUpperCase()) {
      case 'DEPOSIT':
      case 'ADMIN_TOP_UP':
        return '⬆️';
      case 'WITHDRAWAL':
      case 'TRANSFER':
        return '⬇️';
      default:
        return '💳';
    }
  }

  getTransactionIconBg(transactionType: string): string {
    switch (transactionType?.toUpperCase()) {
      case 'DEPOSIT':
      case 'ADMIN_TOP_UP':
        return 'var(--fx-success-soft)';
      case 'WITHDRAWAL':
      case 'TRANSFER':
        return 'var(--fx-danger-soft)';
      default:
        return 'var(--fx-primary-soft)';
    }
  }

  isCredit(transactionType: string): boolean {
    return ['DEPOSIT', 'ADMIN_TOP_UP'].includes(transactionType?.toUpperCase());
  }

  abs(value: number): number {
    return Math.abs(value);
  }
}
