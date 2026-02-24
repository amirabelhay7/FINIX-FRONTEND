import { Component } from '@angular/core';
import { WalletBalance, QuickAction, WalletTransaction } from '../../../models';

/**
 * ViewModel: wallet home (MVVM).
 * All static data lives here; view only binds.
 */
@Component({
  selector: 'app-wallet-home',
  standalone: false,
  templateUrl: './wallet-home.html',
  styleUrl: './wallet-home.css',
})
export class WalletHome {
  readonly pageTitle = 'My Wallet';
  readonly pageSubtitle = 'Your digital financial hub — deposits, transfers, and transaction history.';
  readonly ledgerStatus = 'Ledger: Live';

  readonly balance: WalletBalance = {
    amountWhole: '8,542',
    amountDecimals: '.50',
    currency: 'TND',
    inflow30d: '+15,200 TND',
    outflow30d: '-6,658 TND',
    accountMask: 'TN ** 4292',
  };

  readonly quickActions: QuickAction[] = [
    { title: 'Deposit', description: 'Add funds to wallet', route: '/wallet/deposit', icon: 'south_east', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
    { title: 'Withdraw', description: 'Cash out to your bank', route: '/wallet/withdraw', icon: 'north_west', iconBgClass: 'bg-red-50', iconColorClass: 'text-red-500' },
    { title: 'Top up via Agent', description: 'Cash at agent — no card needed', route: '/wallet/agent-top-up', icon: 'storefront', iconBgClass: 'bg-amber-50', iconColorClass: 'text-amber-600' },
    { title: 'P2P Transfer', description: 'Send to another user', route: '/wallet/transfer', icon: 'swap_horiz', iconBgClass: 'bg-blue-50', iconColorClass: 'text-[#135bec]' },
    { title: 'All Transactions', description: 'Full immutable ledger', route: '/wallet/transactions', icon: 'receipt_long', iconBgClass: 'bg-purple-50', iconColorClass: 'text-purple-600' },
  ];

  readonly recentTransactions: WalletTransaction[] = [
    { title: 'Deposit', subtitle: 'TXN-992144 · 2 mins ago', amount: '+4,350 TND', amountPositive: true, icon: 'south_east', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
    { title: 'Loan Repayment', subtitle: 'TXN-992145 · 14 mins ago', amount: '-445.20 TND', amountPositive: false, icon: 'sync_alt', iconBgClass: 'bg-blue-50', iconColorClass: 'text-[#135bec]' },
    { title: 'Transfer → Sarah Sidibe', subtitle: 'TXN-991990 · Yesterday', amount: '-600 TND', amountPositive: false, icon: 'swap_horiz', iconBgClass: 'bg-purple-50', iconColorClass: 'text-purple-600' },
    { title: 'Insurance Premium', subtitle: 'TXN-991887 · 3 days ago', amount: '-63 TND', amountPositive: false, icon: 'shield', iconBgClass: 'bg-orange-50', iconColorClass: 'text-orange-500' },
  ];
}
