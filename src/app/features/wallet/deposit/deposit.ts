import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../../services/wallet/wallet.service';

@Component({
  selector: 'app-deposit',
  standalone: false,
  templateUrl: './deposit.html',
  styleUrl: './deposit.css',
})
export class Deposit {
  amount: number | null = null;
  description = '';
  loading = false;
  error: string | null = null;
  success = false;
  newBalance: number | null = null;

  constructor(private walletService: WalletService, private router: Router) {}

  submit(): void {
    if (!this.amount || this.amount <= 0) {
      this.error = 'Please enter a valid amount.';
      return;
    }
    this.loading = true;
    this.error = null;
    this.walletService.deposit({ amount: this.amount, description: this.description || 'Deposit' }).subscribe({
      next: (w) => {
        this.loading = false;
        this.success = true;
        this.newBalance = w.balance;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Deposit failed. Please try again.';
      },
    });
  }

  goHome(): void {
    this.router.navigate(['/wallet']);
  }
}
