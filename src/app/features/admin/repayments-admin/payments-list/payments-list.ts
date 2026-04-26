import { Component } from '@angular/core';
import { PaymentAdminRow } from '../../../../models';

/**
 * ViewModel: payments list (MVVM).
 */
@Component({
  selector: 'app-payments-list',
  standalone: false,
  templateUrl: './payments-list.html',
  styleUrl: './payments-list.css',
})
export class PaymentsList {
  readonly pageTitle = 'Payments';
  readonly pageSubtitle = 'All loan payments (method, amount, status).';
  readonly backRoute = '/admin/repayments';
  readonly searchPlaceholder = 'Search by ID or amount...';

  readonly payments: PaymentAdminRow[] = [
    { id: 1, method: 'WALLET', amount: '500.00 TND', remaining: '1,500.00 TND', date: '2025-02-20 14:30', status: 'COMPLETED', statusClass: 'bg-green-50 text-green-700', viewRoute: '/admin/repayments/payments/1' },
    { id: 2, method: 'BANK_TRANSFER', amount: '300.00 TND', remaining: '1,200.00 TND', date: '2025-02-18 10:00', status: 'PENDING', statusClass: 'bg-amber-50 text-amber-700', viewRoute: '/admin/repayments/payments/2' },
  ];
}
