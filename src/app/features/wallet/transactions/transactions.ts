import { Component } from '@angular/core';
import { TransactionsPageKpis, TransactionRow } from '../../../models';

/**
 * ViewModel: transaction history (MVVM).
 */
@Component({
  selector: 'app-transactions',
  standalone: false,
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  readonly pageTitle = 'Transaction History';
  readonly pageSubtitle = 'Your complete immutable financial ledger.';
  readonly paginationLabel = 'Showing 5 of 38 transactions';

  readonly kpis: TransactionsPageKpis = {
    totalIn: '+15,200 TND',
    totalOut: '-6,658 TND',
    net: '+8,542 TND',
    count: '38',
    countLabel: '(30d)',
  };

  readonly transactions: TransactionRow[] = [
    { ref: '#TXN-992144', type: 'DEPOSIT', typeClass: 'bg-green-50 text-green-700 border-green-100', description: 'Bank transfer — BIAT', amount: '+4,350 TND', amountPositive: true, status: 'Success', statusDotClass: 'bg-green-500', statusTextClass: 'text-green-600', date: 'Feb 24, 2026' },
    { ref: '#TXN-992145', type: 'REPAYMENT', typeClass: 'bg-blue-50 text-blue-700 border-blue-100', description: 'Contract #FIN-2025-0842 · Installment 2', amount: '-445.20 TND', amountPositive: false, status: 'Success', statusDotClass: 'bg-green-500', statusTextClass: 'text-green-600', date: 'Feb 24, 2026' },
    { ref: '#TXN-991990', type: 'TRANSFER', typeClass: 'bg-purple-50 text-purple-700 border-purple-100', description: 'P2P → Sarah Sidibe (Rent)', amount: '-600 TND', amountPositive: false, status: 'Success', statusDotClass: 'bg-green-500', statusTextClass: 'text-green-600', date: 'Feb 23, 2026' },
    { ref: '#TXN-991887', type: 'INSURANCE', typeClass: 'bg-orange-50 text-orange-700 border-orange-100', description: 'Moto Cover + Health Micro · Monthly', amount: '-63 TND', amountPositive: false, status: 'Success', statusDotClass: 'bg-green-500', statusTextClass: 'text-green-600', date: 'Feb 21, 2026' },
    { ref: '#TXN-991201', type: 'WITHDRAWAL', typeClass: 'bg-red-50 text-red-700 border-red-100', description: 'Cash out → La Poste Tunisienne', amount: '-1,500 TND', amountPositive: false, status: 'Pending', statusDotClass: 'bg-yellow-400', statusTextClass: 'text-yellow-600', date: 'Feb 20, 2026' },
  ];

  onExportCsv(): void {}
}
