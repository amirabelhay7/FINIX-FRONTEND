import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../../services/wallet/wallet.service';

@Component({
  selector: 'app-transfer',
  standalone: false,
  templateUrl: './transfer.html',
  styleUrl: './transfer.css',
})
export class Transfer {
  targetEmail = '';
  amount: number | null = null;
  description = '';
  showConfirm = false;
  loading = false;
  error: string | null = null;
  success = false;
  newBalance: number | null = null;

  constructor(private walletService: WalletService, private router: Router) {}

  openConfirm(): void {
    if (!this.targetEmail.trim()) { this.error = 'Please enter a recipient email.'; return; }
    if (!this.amount || this.amount <= 0) { this.error = 'Please enter a valid amount.'; return; }
    this.error = null;
    this.showConfirm = true;
  }

  cancelConfirm(): void {
    this.showConfirm = false;
  }

  confirm(): void {
    this.loading = true;
    this.error = null;
    this.walletService.transfer({
      targetEmail: this.targetEmail,
      amount: this.amount!,
      description: this.description || 'P2P Transfer',
    }).subscribe({
      next: (w) => {
        this.loading = false;
        this.showConfirm = false;
        this.success = true;
        this.newBalance = w.balance;
      },
      error: (err) => {
        this.loading = false;
        this.showConfirm = false;
        this.error = err?.error?.message || 'Transfer failed. Please try again.';
      },
    });
  }

  goHome(): void {
    this.router.navigate(['/wallet']);
  }
}
