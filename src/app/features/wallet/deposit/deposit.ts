import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { WalletFormOption } from '../../../models';
import { WalletService } from '../../../core/wallet/wallet.service';

@Component({
  selector: 'app-deposit',
  standalone: false,
  templateUrl: './deposit.html',
  styleUrl: './deposit.css',
})
export class Deposit {
  readonly pageTitle = 'Deposit (Online)';
  readonly pageSubtitle = 'Add funds by card or bank transfer.';
  readonly amountLabel = 'Amount (DT)';
  readonly methodLabel = 'Payment method';
  readonly continueLabel = 'Continue to payment';
  readonly infoText = 'Unbanked? Top up in cash at an agent near you — no card needed.';
  readonly findAgentLabel = 'Find agent →';
  readonly findAgentRoute = '/wallet/agent-top-up';

  readonly paymentMethods: WalletFormOption[] = [
    { value: 'card', label: 'Card' },
    { value: 'bank', label: 'Bank transfer' },
  ];

  amount: number | null = null;
  description = '';
  submitting = false;
  error: string | null = null;

  constructor(
    private walletService: WalletService,
    private router: Router,
  ) {}

  submit(): void {
    const amt = this.amount != null ? Number(this.amount) : 0;
    if (amt <= 0) {
      this.error = 'Enter a valid amount.';
      return;
    }
    this.error = null;
    this.submitting = true;
    this.walletService.deposit(amt, this.description || undefined).subscribe({
      next: () => this.router.navigate(['/wallet']),
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message || err?.message || 'Deposit failed';
      },
    });
  }
}
