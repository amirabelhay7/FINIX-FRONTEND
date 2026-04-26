import { Component } from '@angular/core';
import { PaymentDetailData } from '../../../models';

/**
 * ViewModel: payment detail (MVVM).
 */
@Component({
  selector: 'app-payment-detail',
  standalone: false,
  templateUrl: './payment-detail.html',
  styleUrl: './payment-detail.css',
})
export class PaymentDetail {
  readonly data: PaymentDetailData = {
    pageTitle: 'Payment details',
    refLabel: 'Payment #1',
    amount: '500.00 TND',
    method: 'Wallet',
    date: '2025-02-20 14:30',
    status: 'Paid',
    statusClass: 'bg-green-50 text-green-700',
    installmentLabel: 'Installment 3 of 12 — Loan #1',
    backRoute: '/repayment/history',
    backLabel: 'Back to history',
  };
}
