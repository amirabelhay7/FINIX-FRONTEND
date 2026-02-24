import { Component } from '@angular/core';
import { AdminPaymentDetailData } from '../../../../models';

/**
 * ViewModel: admin payment detail (MVVM).
 * All static copy and field data in VM; view only binds.
 */
@Component({
  selector: 'app-payment-detail',
  standalone: false,
  templateUrl: './payment-detail.html',
  styleUrl: './payment-detail.css',
})
export class PaymentDetail {
  readonly vm: AdminPaymentDetailData = {
    pageTitle: 'Payment details',
    pageSubtitle: 'Payment #1 — method, amount, status, linked delinquency/recovery.',
    backRoute: '/admin/repayments/payments',
    id: '1',
    method: 'WALLET',
    amountPaid: '500.00 TND',
    remainingAmount: '1,500.00 TND',
    paymentDate: '2025-02-20 14:30',
    status: 'COMPLETED',
    statusClass: 'bg-green-50 text-green-700',
    linkedDelinquency: '—',
    linkedRecovery: '—',
    backToListRoute: '/admin/repayments/payments',
    backToListLabel: 'Back to list',
  };
}
