import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService } from '../../../core/wallet/wallet.service';

@Component({
  selector: 'app-transfer',
  standalone: false,
  templateUrl: './transfer.html',
  styleUrl: './transfer.css',
})
export class Transfer implements OnInit {
  readonly pageTitle = 'P2P Transfer';
  readonly pageSubtitle = 'Send money instantly to any FINIX user (by email).';
  readonly balanceLabel = 'Your Balance';
  readonly recipientLabel = 'Recipient email';
  readonly recipientPlaceholder = 'client@example.com';
  readonly amountLabel = 'Amount';
  readonly noteLabel = 'Note (Optional)';
  readonly notePlaceholder = 'e.g. Rent payment...';
  readonly summaryTransfer = 'Transfer Amount';
  readonly summaryFee = 'Platform Fee';
  readonly summaryFeeValue = 'Free';
  readonly summaryTotal = 'Total Deducted';
  readonly confirmLabel = 'Confirm Transfer';
  readonly backLabel = 'Back to Wallet';

  balanceAmount = '0.00 TND';
  targetEmail = '';
  amount: number | null = null;
  description = '';
  loading = true;
  submitting = false;
  error: string | null = null;

  constructor(
    private walletService: WalletService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.walletService.getMyWallet().subscribe({
      next: (w) => {
        this.balanceAmount = w.balance.toFixed(2) + ' TND';
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to load balance';
      },
    });
  }

  get amountHint(): string {
    return `Max: ${this.balanceAmount} — Transfer fee: 0.00 TND (free)`;
  }

  get summaryAmount(): string {
    return this.amount != null && this.amount > 0 ? this.amount.toFixed(2) + ' TND' : '0.00 TND';
  }

  setQuickAmount(value: number): void {
    this.amount = value;
  }

  submit(): void {
    const email = (this.targetEmail || '').trim();
    const amt = this.amount != null ? Number(this.amount) : 0;
    if (!email) {
      this.error = 'Enter recipient email.';
      return;
    }
    if (amt <= 0) {
      this.error = 'Enter a valid amount.';
      return;
    }
    this.error = null;
    this.submitting = true;
    this.walletService.transfer(email, amt, this.description || undefined).subscribe({
      next: () => this.router.navigate(['/wallet']),
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message || err?.message || 'Transfer failed';
      },
    });
  }
}
