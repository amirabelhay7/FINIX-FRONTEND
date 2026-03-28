import { Component, OnInit } from '@angular/core';
import { WalletService, WalletApi, TransactionApi } from '../../../services/wallet/wallet.service';

interface QuickAction {
  title: string;
  description: string;
  route: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { title: 'Deposit', description: 'Add funds to wallet', route: 'deposit', icon: 'south_east', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
  { title: 'Withdraw', description: 'Cash out to your bank', route: 'withdraw', icon: 'north_west', iconBgClass: 'bg-red-50', iconColorClass: 'text-red-500' },
  { title: 'Top up via Agent', description: 'Cash at agent — no card needed', route: 'agent-top-up', icon: 'storefront', iconBgClass: 'bg-amber-50', iconColorClass: 'text-amber-600' },
  { title: 'P2P Transfer', description: 'Send to another user', route: 'transfer', icon: 'swap_horiz', iconBgClass: 'bg-blue-50', iconColorClass: 'text-[#135bec]' },
  { title: 'All Transactions', description: 'Full immutable ledger', route: 'transactions', icon: 'receipt_long', iconBgClass: 'bg-purple-50', iconColorClass: 'text-purple-600' },
];

function formatBalance(value: number): { whole: string; decimals: string } {
  const [w, d] = value.toFixed(2).split('.');
  return { whole: Number(w).toLocaleString('en'), decimals: '.' + (d || '00') };
}

function formatAmount(amount: number, positive: boolean): string {
  return (positive ? '+' : '-') + Math.abs(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' TND';
}

function txToUi(t: TransactionApi) {
  const positive = ['DEPOSIT', 'TRANSFER_IN', 'AGENT_TOP_UP', 'ADMIN_TOP_UP'].includes(t.transactionType);
  const iconMap: Record<string, string> = {
    DEPOSIT: 'south_east', WITHDRAWAL: 'north_west',
    TRANSFER_OUT: 'swap_horiz', TRANSFER_IN: 'swap_horiz',
    AGENT_TOP_UP: 'storefront', ADMIN_TOP_UP: 'admin_panel_settings',
    TREASURY_OUT: 'account_balance',
  };
  return {
    id: t.id,
    title: t.transactionType.replace(/_/g, ' '),
    subtitle: `${t.referenceNumber || '#' + t.id} · ${t.transactionDate ? new Date(t.transactionDate).toLocaleString() : ''}`,
    amount: formatAmount(t.amount, positive),
    amountPositive: positive,
    icon: iconMap[t.transactionType] ?? 'receipt_long',
    iconBgClass: positive ? 'bg-green-50' : 'bg-gray-100',
    iconColorClass: positive ? 'text-green-600' : 'text-red-500',
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
  readonly quickActions = QUICK_ACTIONS;

  balanceWhole = '0';
  balanceDecimals = '.00';
  currency = 'TND';
  accountMask = '—';

  recentTransactions: ReturnType<typeof txToUi>[] = [];
  loading = true;
  error: string | null = null;

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    this.walletService.getMyWallet().subscribe({
      next: (w) => {
        const { whole, decimals } = formatBalance(w.balance ?? 0);
        this.balanceWhole = whole;
        this.balanceDecimals = decimals;
        this.currency = w.currency || 'TND';
        this.accountMask = w.accountNumber ? `** ${w.accountNumber.slice(-4)}` : '—';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load wallet';
        this.loading = false;
      },
    });

    this.walletService.getMyTransactions().subscribe({
      next: (list) => {
        this.recentTransactions = list.slice(0, 5).map(txToUi);
      },
      error: () => {},
    });
  }
}
