import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminWalletDetailData, AdminWalletRecentTx, TransactionApi } from '../../../../models';
import { WalletService } from '../../../../core/wallet/wallet.service';
import { AuthService } from '../../../../core/auth/auth.service';

function txToRecent(t: TransactionApi): AdminWalletRecentTx {
  const positive = ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP'].includes(t.transactionType);
  const amountStr = (positive ? '+' : '-') + Math.abs(t.amount).toFixed(2) + ' TND';
  const iconMap: Record<string, string> = {
    DEPOSIT: 'south_east', WITHDRAWAL: 'north_west', TRANSFER_OUT: 'swap_horiz', TRANSFER_IN: 'swap_horiz',
    AGENT_TOP_UP: 'storefront',
  };
  const icon = iconMap[t.transactionType] ?? 'receipt_long';
  const iconBg = positive ? 'bg-green-50' : 'bg-gray-100';
  const iconColor = positive ? 'text-green-600' : 'text-red-500';
  const ref = t.referenceNumber || '#' + t.id;
  const dateStr = t.transactionDate ? new Date(t.transactionDate).toLocaleString() : '';
  return {
    title: t.transactionType.replace(/_/g, ' '),
    subtitle: `${ref} · ${dateStr}`,
    amount: amountStr,
    amountClass: positive ? 'text-green-600' : 'text-red-500',
    icon,
    iconBgClass: iconBg,
    iconColorClass: iconColor,
    route: '/admin/wallet/transactions/' + t.id,
  };
}

@Component({
  selector: 'app-wallet-detail',
  standalone: false,
  templateUrl: './wallet-detail.html',
  styleUrl: './wallet-detail.css',
})
export class WalletDetail implements OnInit {
  vm: AdminWalletDetailData = {
    backRoute: '/admin/wallet/wallets',
    pageTitle: 'Wallet',
    pageSubtitle: '—',
    status: '—',
    statusClass: 'bg-gray-100 text-gray-600',
    balanceLabel: 'Balance',
    balance: '—',
    currencyLabel: 'Currency',
    currency: '—',
    accountLabel: 'Account number',
    accountNumber: '—',
    recentTitle: 'Recent transactions',
    viewAllRoute: '/admin/wallet/transactions',
    viewAllLabel: 'View all',
    recentTransactions: [],
  };
  walletId: number | null = null;
  /** When true, owner is soft-deleted; wallet is read-only (no fill, deduct, status, delete). */
  clientDeleted = false;
  loading = true;
  error: string | null = null;
  updatingStatus = false;
  deleting = false;
  adjustAmount: number | null = null;
  adjustDescription = '';
  adjustLoading = false;
  adjustError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private walletService: WalletService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.walletId = id ? +id : null;
    if (!this.walletId) {
      this.loading = false;
      this.error = 'Invalid wallet id';
      return;
    }
    this.walletService.getWalletByIdAdmin(this.walletId).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (w) => {
        try {
          this.clientDeleted = !!w.clientDeleted;
          const status = this.clientDeleted ? 'Deleted (account)' : (w.isActive ? 'Active' : 'Inactive');
          const statusClass = this.clientDeleted ? 'bg-red-50 text-red-700' : (w.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600');
          this.vm = {
            ...this.vm,
            pageTitle: 'Wallet **' + (w.accountNumber?.slice(-4) ?? '—'),
            pageSubtitle: w.clientEmail ?? '—',
            status,
            statusClass,
            balance: w.balance.toFixed(2) + ' TND',
            currency: w.currency ?? 'TND',
            accountNumber: w.accountNumber ?? '—',
            recentTransactions: this.vm.recentTransactions,
          };
          this.loadTransactions();
        } catch (e) {
          this.error = (e instanceof Error ? e.message : 'Invalid wallet data') as string;
        }
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load wallet';
      },
    });
  }

  private loadTransactions(): void {
    if (!this.walletId) return;
    this.walletService.getWalletTransactionsAdmin(this.walletId).subscribe({
      next: (list) => {
        this.vm.recentTransactions = list.slice(0, 10).map(txToRecent);
      },
    });
  }

  toggleStatus(): void {
    if (!this.walletId || this.updatingStatus || this.clientDeleted) return;
    const newActive = this.vm.status !== 'Active';
    this.updatingStatus = true;
    this.walletService.updateWalletStatusAdmin(this.walletId, newActive).subscribe({
      next: (w) => {
        this.vm.status = w.isActive ? 'Active' : 'Inactive';
        this.vm.statusClass = w.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600';
        this.updatingStatus = false;
      },
      error: (err) => {
        this.updatingStatus = false;
        this.error = err?.error?.message || err?.message || 'Failed to update status';
      },
    });
  }

  deleteWallet(): void {
    if (!this.walletId || this.deleting || this.clientDeleted) return;
    if (!confirm('Are you sure you want to delete this wallet? This cannot be undone.')) return;
    this.deleting = true;
    this.walletService.deleteWalletAdmin(this.walletId).subscribe({
      next: () => this.router.navigate(['/admin/wallet/wallets']),
      error: (err) => {
        this.deleting = false;
        this.error = err?.error?.message || err?.message || 'Failed to delete wallet';
      },
    });
  }

  adminFill(): void {
    if (!this.walletId || this.adjustLoading || this.clientDeleted) return;
    const amt = this.adjustAmount != null ? Number(this.adjustAmount) : 0;
    if (amt <= 0) {
      this.adjustError = 'Enter a valid amount.';
      this.cdr.detectChanges();
      return;
    }
    this.adjustError = null;
    this.adjustLoading = true;
    this.walletService.adminDepositWallet(this.walletId, amt, this.adjustDescription || undefined).subscribe({
      next: (w) => {
        this.vm.balance = w.balance.toFixed(2) + ' TND';
        this.adjustAmount = null;
        this.adjustDescription = '';
        this.adjustLoading = false;
        this.loadTransactions();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.adjustLoading = false;
        if (err?.status === 401) {
          this.adjustError = 'Session expired or not authorized. Please log in again as admin.';
          this.auth.logout();
        } else {
          this.adjustError = (typeof err?.error === 'object' && err?.error?.message) ? err.error.message : (err?.message || 'Fill failed');
        }
        this.cdr.detectChanges();
      },
    });
  }

  adminDeduct(): void {
    if (!this.walletId || this.adjustLoading || this.clientDeleted) return;
    const amt = this.adjustAmount != null ? Number(this.adjustAmount) : 0;
    if (amt <= 0) {
      this.adjustError = 'Enter a valid amount.';
      this.cdr.detectChanges();
      return;
    }
    this.adjustError = null;
    this.adjustLoading = true;
    this.walletService.adminWithdrawWallet(this.walletId, amt, this.adjustDescription || undefined).subscribe({
      next: (w) => {
        this.vm.balance = w.balance.toFixed(2) + ' TND';
        this.adjustAmount = null;
        this.adjustDescription = '';
        this.adjustLoading = false;
        this.loadTransactions();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.adjustLoading = false;
        if (err?.status === 401) {
          this.adjustError = 'Session expired or not authorized. Please log in again as admin.';
          this.auth.logout();
        } else {
          this.adjustError = (typeof err?.error === 'object' && err?.error?.message) ? err.error.message : (err?.message || 'Deduct failed');
        }
        this.cdr.detectChanges();
      },
    });
  }
}
