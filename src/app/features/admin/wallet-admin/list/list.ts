import { Component } from '@angular/core';
import { AdminHubCard } from '../../../../models';

/**
 * ViewModel: wallet admin hub (MVVM).
 */
@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  readonly pageTitle = 'Wallet & Ledger';
  readonly pageSubtitle = 'All wallets, agent top-ups, and transaction ledger.';

  readonly cards: AdminHubCard[] = [
    { title: 'All Wallets', subtitle: 'View and manage user wallets', route: '/admin/wallet/wallets', icon: 'account_balance_wallet', iconColorClass: 'text-[#135bec]' },
    { title: 'Transaction Ledger', subtitle: 'Full immutable transaction log', route: '/admin/wallet/transactions', icon: 'receipt_long', iconColorClass: 'text-green-600' },
  ];
}
