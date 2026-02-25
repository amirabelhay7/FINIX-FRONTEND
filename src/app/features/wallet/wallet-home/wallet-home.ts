import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs';
import { WalletBalance, QuickAction, WalletTransaction, TransactionApi, WalletApi } from '../../../models';
import { WalletService } from '../../../core/wallet/wallet.service';

const QUICK_ACTIONS: QuickAction[] = [
  { title: 'Deposit', description: 'Add funds to wallet', route: '/wallet/deposit', icon: 'south_east', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
  { title: 'Withdraw', description: 'Cash out to your bank', route: '/wallet/withdraw', icon: 'north_west', iconBgClass: 'bg-red-50', iconColorClass: 'text-red-500' },
  { title: 'Top up via Agent', description: 'Cash at agent — no card needed', route: '/wallet/agent-top-up', icon: 'storefront', iconBgClass: 'bg-amber-50', iconColorClass: 'text-amber-600' },
  { title: 'P2P Transfer', description: 'Send to another user', route: '/wallet/transfer', icon: 'swap_horiz', iconBgClass: 'bg-blue-50', iconColorClass: 'text-[#135bec]' },
  { title: 'All Transactions', description: 'Full immutable ledger', route: '/wallet/transactions', icon: 'receipt_long', iconBgClass: 'bg-purple-50', iconColorClass: 'text-purple-600' },
];

function formatBalance(value: number): { whole: string; decimals: string } {
  const fixed = value.toFixed(2);
  const [w, d] = fixed.split('.');
  const whole = Number(w).toLocaleString('en');
  return { whole, decimals: '.' + (d || '00') };
}

function formatAmount(amount: number, positive: boolean): string {
  const s = Math.abs(amount).toFixed(2);
  return (positive ? '+' : '-') + Number(s).toLocaleString('en') + ' TND';
}

function txApiToUi(t: TransactionApi): WalletTransaction & { id: number } {
  const positive = ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP'].includes(t.transactionType);
  const iconMap: Record<string, string> = {
    DEPOSIT: 'south_east', WITHDRAWAL: 'north_west', TRANSFER_OUT: 'swap_horiz', TRANSFER_IN: 'swap_horiz',
    AGENT_TOP_UP: 'storefront',
  };
  const icon = iconMap[t.transactionType] ?? 'receipt_long';
  const iconBg = positive ? 'bg-green-50' : 'bg-gray-100';
  const iconColor = positive ? 'text-green-600' : 'text-red-500';
  const ref = t.referenceNumber || `#${t.id}`;
  const dateStr = t.transactionDate ? new Date(t.transactionDate).toLocaleString() : '';
  return {
    id: t.id,
    title: t.transactionType.replace(/_/g, ' '),
    subtitle: `${ref} · ${dateStr}`,
    amount: formatAmount(t.amount, positive),
    amountPositive: positive,
    icon,
    iconBgClass: iconBg,
    iconColorClass: iconColor,
  };
}

@Component({
  selector: 'app-wallet-home',
  standalone: false,
  templateUrl: './wallet-home.html',
  styleUrl: './wallet-home.css',
})
export class WalletHome implements OnInit {
  readonly pageTitle = 'My Wallet';
  readonly pageSubtitle = 'Your digital financial hub — deposits, transfers, and transaction history.';
  readonly ledgerStatus = 'Ledger: Live';
  readonly quickActions = QUICK_ACTIONS;

  balance: WalletBalance = {
    amountWhole: '0',
    amountDecimals: '.00',
    currency: 'TND',
    inflow30d: '+0 TND',
    outflow30d: '-0 TND',
    accountMask: '—',
  };
  recentTransactions: (WalletTransaction & { id?: number })[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private walletService: WalletService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.walletService.getMyWallet().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe({
      next: (w) => {
        try {
          this.applyWallet(w);
        } catch (e) {
          this.error = (e instanceof Error ? e.message : 'Invalid wallet data') as string;
        }
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load wallet';
      },
    });
    this.walletService.getMyTransactions().subscribe({
      next: (list) => {
        const tx = list.slice(0, 5).map(txApiToUi);
        setTimeout(() => {
          this.recentTransactions = tx;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        if (!this.error) this.error = err?.error?.message || err?.message || 'Failed to load transactions';
      },
    });
  }

  private applyWallet(w: WalletApi): void {
    const { whole, decimals } = formatBalance(w.balance);
    const mask = w.accountNumber ? `** ${w.accountNumber.slice(-4)}` : '—';
    this.balance = {
      amountWhole: whole,
      amountDecimals: decimals,
      currency: w.currency || 'TND',
      inflow30d: '+0 TND',
      outflow30d: '-0 TND',
      accountMask: mask,
    };
  }
}
