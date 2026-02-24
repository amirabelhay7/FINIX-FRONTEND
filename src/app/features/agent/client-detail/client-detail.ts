import { Component } from '@angular/core';
import { ClientDetailProfileItem, ClientDetailLoanRow } from '../../../models';

/**
 * ViewModel: client detail (MVVM).
 */
@Component({
  selector: 'app-client-detail',
  standalone: false,
  templateUrl: './client-detail.html',
  styleUrl: './client-detail.css',
})
export class ClientDetail {
  readonly pageTitle = 'Client details';
  readonly pageSubtitle = 'Amadou Kone — profile, wallet, loans';
  readonly backRoute = '/agent/clients';
  readonly profileTitle = 'Profile';
  readonly loansTitle = 'Loans';
  readonly walletTitle = 'Wallet';
  readonly walletAmount = '1,250.00 TND';
  readonly walletAccount = 'Account: ACC-001';
  readonly recordTopUpLabel = 'Record top-up';
  readonly recordTopUpRoute = '/agent/top-up';

  readonly profileItems: ClientDetailProfileItem[] = [
    { label: 'Name', value: 'Amadou Kone' },
    { label: 'Email', value: 'amadou.kone@email.com' },
    { label: 'Phone', value: '+216 12 345 678' },
    { label: 'CIN', value: '12345678', valueClass: 'font-mono' },
    { label: 'City', value: 'Tunis' },
  ];

  readonly loans: ClientDetailLoanRow[] = [
    { label: 'Loan #1', amount: '5,000 TND', status: 'Active', statusClass: 'bg-green-50 text-green-700' },
  ];
}
