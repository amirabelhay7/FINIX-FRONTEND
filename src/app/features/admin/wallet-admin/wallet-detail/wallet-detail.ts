import { Component } from '@angular/core';
import { AdminWalletDetailData } from '../../../../models';

/**
 * ViewModel: admin wallet detail (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-wallet-detail',
  standalone: false,
  templateUrl: './wallet-detail.html',
  styleUrl: './wallet-detail.css',
})
export class WalletDetail {
  readonly vm: AdminWalletDetailData = {
    backRoute: '/admin/wallet/wallets',
    pageTitle: 'Wallet FINIX-****4292',
    pageSubtitle: 'amadou.kone@email.com',
    status: 'Active',
    statusClass: 'bg-green-50 text-green-700',
    balanceLabel: 'Balance',
    balance: '2,840.50 DT',
    currencyLabel: 'Currency',
    currency: 'DT',
    accountLabel: 'Account number',
    accountNumber: 'FINIX-****4292',
    recentTitle: 'Recent transactions',
    viewAllRoute: '/admin/wallet/transactions',
    viewAllLabel: 'View all',
    recentTransactions: [
      { title: 'Deposit', subtitle: 'TXN-992144 · 2 mins ago', amount: '+1,450.00 DT', amountClass: 'text-green-600', icon: 'south_east', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600', route: '/admin/wallet/transactions/101' },
      { title: 'Transfer', subtitle: 'TXN-992145 · 14 mins ago', amount: '-200.00 DT', amountClass: 'text-red-500', icon: 'swap_horiz', iconBgClass: 'bg-blue-50', iconColorClass: 'text-[#135bec]', route: '/admin/wallet/transactions/102' },
    ],
  };
}
