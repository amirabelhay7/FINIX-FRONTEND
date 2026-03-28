import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../../services/wallet/wallet.service';

@Component({
  selector: 'app-agent-top-up',
  standalone: false,
  templateUrl: './agent-top-up.html',
  styleUrl: './agent-top-up.css',
})
export class AgentTopUp {
  clientEmail = '';
  amount: number | null = null;
  description = '';
  showConfirm = false;
  loading = false;
  error: string | null = null;
  success = false;
  resultBalance: number | null = null;

  constructor(private walletService: WalletService, private router: Router) {}

  openConfirm(): void {
    if (!this.clientEmail.trim()) { this.error = 'Please enter the client email.'; return; }
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
    this.walletService.agentTopUp({
      targetEmail: this.clientEmail,
      amount: this.amount!,
      description: this.description || 'Agent cash-in',
    }).subscribe({
      next: (w) => {
        this.loading = false;
        this.showConfirm = false;
        this.success = true;
        this.resultBalance = w.balance;
      },
      error: (err) => {
        this.loading = false;
        this.showConfirm = false;
        this.error = err?.error?.message || 'Top-up failed. Please try again.';
      },
    });
  }

  reset(): void {
    this.clientEmail = '';
    this.amount = null;
    this.description = '';
    this.success = false;
    this.resultBalance = null;
    this.error = null;
  }

  goHome(): void {
    this.router.navigate(['/wallet']);
  }
}
