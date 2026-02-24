import { Component } from '@angular/core';
import { PaymentHistoryItem } from '../../../models';

/**
 * ViewModel: payment history (MVVM).
 */
@Component({
  selector: 'app-payment-history',
  standalone: false,
  templateUrl: './payment-history.html',
  styleUrl: './payment-history.css',
})
export class PaymentHistory {
  readonly pageTitle = 'Payment History';
  readonly pageSubtitle = 'All your loan payments in one place.';
  readonly sectionTitle = 'Payments';

  readonly payments: PaymentHistoryItem[] = [
    { contractRef: 'FIN-2025-0842', date: 'Feb 15, 2025', note: 'Installment 2 · Wallet', amount: '445.20 TND', icon: 'check_circle', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
    { contractRef: 'FIN-2025-0842', date: 'Jan 15, 2025', note: 'Installment 1 · Wallet', amount: '445.20 TND', icon: 'check_circle', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
    { contractRef: 'FIN-2023-4521', date: 'Dec 10, 2024', note: 'Final installment · Bank transfer', amount: '312.50 TND', icon: 'check_circle', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
  ];
}
