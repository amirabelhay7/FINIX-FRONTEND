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

  // Operation states
  withdrawLoading = false;
  transferLoading = false;

  // Form states
  showWithdrawModal = false;
  showTransferModal = false;
  showAddFundsModal = false;

  // Form data
  withdrawForm = { amount: '', description: '' };
  transferForm = { amount: '', description: '', targetEmail: '' };

  // Messages
  successMessage: string | null = null;

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

  // ─── Wallet Operations ──────────────────────────────────────────────────────

  withdraw(): void {
    if (!this.withdrawForm.amount || parseFloat(this.withdrawForm.amount) <= 0) {
      this.error = 'Please enter a valid amount';
      return;
    }

    if (this.wallet && parseFloat(this.withdrawForm.amount) > this.wallet.balance) {
      this.error = 'Insufficient balance';
      return;
    }

    this.withdrawLoading = true;
    this.error = null;
    this.successMessage = null;

    this.walletService.withdraw({
      amount: parseFloat(this.withdrawForm.amount),
      description: this.withdrawForm.description || 'Cash withdrawal request'
    }).subscribe({
      next: (updatedWallet) => {
        this.wallet = updatedWallet;
        this.withdrawLoading = false;
        this.successMessage = `Withdrawal request for ${this.formatBalance(parseFloat(this.withdrawForm.amount))} submitted. Contact agent for cash pickup.`;
        this.showWithdrawModal = false;
        this.withdrawForm = { amount: '', description: '' };
        this.loadWalletData(); // Refresh data
      },
      error: (err) => {
        this.withdrawLoading = false;
        this.error = err?.error?.message || 'Withdrawal request failed';
      }
    });
  }

  transfer(): void {
    if (!this.transferForm.amount || parseFloat(this.transferForm.amount) <= 0) {
      this.error = 'Please enter a valid amount';
      return;
    }

    if (!this.transferForm.targetEmail) {
      this.error = 'Please enter recipient email';
      return;
    }

    if (this.wallet && parseFloat(this.transferForm.amount) > this.wallet.balance) {
      this.error = 'Insufficient balance';
      return;
    }

    this.transferLoading = true;
    this.error = null;
    this.successMessage = null;

    this.walletService.transfer({
      amount: parseFloat(this.transferForm.amount),
      description: this.transferForm.description || 'Transfer',
      targetEmail: this.transferForm.targetEmail
    }).subscribe({
      next: (updatedWallet) => {
        this.wallet = updatedWallet;
        this.transferLoading = false;
        this.successMessage = `Successfully transferred ${this.formatBalance(parseFloat(this.transferForm.amount))} to ${this.transferForm.targetEmail}`;
        this.showTransferModal = false;
        this.transferForm = { amount: '', description: '', targetEmail: '' };
        this.loadWalletData(); // Refresh data
      },
      error: (err) => {
        this.transferLoading = false;
        this.error = err?.error?.message || 'Transfer failed';
      }
    });
  }

  // ─── UI Helpers ─────────────────────────────────────────────────────────────

  openWithdrawModal(): void {
    this.showWithdrawModal = true;
    this.error = null;
    this.successMessage = null;
  }

  openTransferModal(): void {
    this.showTransferModal = true;
    this.error = null;
    this.successMessage = null;
  }

  showAddFundsInfo(): void {
    this.showAddFundsModal = true;
    this.error = null;
    this.successMessage = null;
  }

  closeModals(): void {
    this.showWithdrawModal = false;
    this.showTransferModal = false;
    this.showAddFundsModal = false;
    this.error = null;
    this.successMessage = null;
  }

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }
}
