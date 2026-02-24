import { Component } from '@angular/core';
import { WalletAdminRow } from '../../../../models';

/**
 * ViewModel: wallet list (MVVM).
 */
@Component({
  selector: 'app-wallet-list',
  standalone: false,
  templateUrl: './wallet-list.html',
  styleUrl: './wallet-list.css',
})
export class WalletList {
  readonly pageTitle = 'All Wallets';

  readonly wallets: WalletAdminRow[] = [
    { id: 1, account: 'FINIX-****4292', clientEmail: 'amadou.kone@email.com', balance: '8,542.50 TND', status: 'Active', statusClass: 'bg-green-50 text-green-700', viewRoute: '/admin/wallet/wallets/1' },
    { id: 2, account: 'FINIX-****1002', clientEmail: 'mariem.said@email.com', balance: '1,200.00 TND', status: 'Active', statusClass: 'bg-green-50 text-green-700', viewRoute: '/admin/wallet/wallets/2' },
  ];
}
