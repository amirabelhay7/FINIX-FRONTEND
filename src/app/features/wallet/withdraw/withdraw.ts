import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletFormOption } from '../../../models';
import { WalletService } from '../../../core/wallet/wallet.service';

@Component({
  selector: 'app-withdraw',
  standalone: false,
  templateUrl: './withdraw.html',
  styleUrl: './withdraw.css',
})
export class Withdraw implements OnInit {
  readonly pageTitle = 'Withdraw';
  readonly pageSubtitle = 'Cash out to your bank or collect at an agent.';
  readonly balanceLabel = 'Available balance';
  readonly amountLabel = 'Amount (DT)';
  readonly methodLabel = 'Withdrawal method';
  readonly submitLabel = 'Request withdrawal';

  readonly withdrawalMethods: WalletFormOption[] = [
    { value: 'bank', label: 'Bank account' },
    { value: 'agent', label: 'Collect at agent' },
  ];

  balanceAmount = '0.00 DT';
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
        this.balanceAmount = w.balance.toFixed(2) + ' DT';
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to load balance';
      },
    });
  }

  submit(): void {
    const amt = this.amount != null ? Number(this.amount) : 0;
    if (amt <= 0) {
      this.error = 'Enter a valid amount.';
      return;
    }
    this.error = null;
    this.submitting = true;
    this.walletService.withdraw(amt, this.description || undefined).subscribe({
      next: () => this.router.navigate(['/wallet']),
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message || err?.message || 'Withdrawal failed';
      },
    });
  }
}
