import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
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
  /** Numeric balance for client-side validation (withdraw not more than balance) */
  balanceNum = 0;
  amount: number | null = null;
  description = '';
  loading = true;
  submitting = false;
  error: string | null = null;

  constructor(
    private walletService: WalletService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.walletService.getMyWallet().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (w) => {
        const bal = w?.balance ?? 0;
        this.balanceNum = bal;
        this.balanceAmount = bal.toFixed(2) + ' DT';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load balance';
        this.cdr.detectChanges();
      },
    });
  }

  submit(): void {
    const amt = this.amount != null ? Number(this.amount) : 0;
    if (amt <= 0) {
      this.error = 'Enter a valid amount.';
      this.cdr.detectChanges();
      return;
    }
    if (amt > this.balanceNum) {
      this.error = `Insufficient balance. Your available balance is ${this.balanceAmount}.`;
      this.cdr.detectChanges();
      return;
    }
    this.error = null;
    this.submitting = true;
    this.cdr.detectChanges();
    this.walletService.withdraw(amt, this.description || undefined).subscribe({
      next: () => this.router.navigate(['/wallet']),
      error: (err) => {
        this.submitting = false;
        if (err?.status === 401) {
          this.error = 'Your session may have expired. Please log in again.';
        } else {
          const msg = (typeof err?.error === 'object' && err?.error?.message) ? err.error.message : (typeof err?.error === 'string' ? err.error : err?.message);
          this.error = msg || 'Withdrawal failed. Try again.';
        }
        this.cdr.detectChanges();
      },
    });
  }
}
