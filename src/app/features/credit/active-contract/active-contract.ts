import { Component } from '@angular/core';
import { UpcomingPaymentRow } from '../../../models';

/**
 * ViewModel: active contract (MVVM).
 */
@Component({
  selector: 'app-active-contract',
  standalone: false,
  templateUrl: './active-contract.html',
  styleUrl: './active-contract.css',
})
export class ActiveContract {
  readonly pageTitle = 'Active Contract';
  readonly pageSubtitle = 'Your current loan and next repayment.';
  readonly contractLabel = 'Contract #FIN-2025-0842';
  readonly contractAmount = '5,000 TND';
  readonly contractDuration = '12 months';
  readonly contractRate = 'Interest rate 8.5% · Total to repay 5,342.40 TND';
  readonly nextPaymentLabel = 'Next payment';
  readonly nextPaymentValue = '445.20 TND — Mar 15, 2025';
  readonly payFromWalletLabel = 'Pay from wallet';
  readonly payFromWalletRoute = '/wallet';
  readonly fullContractLabel = 'Full contract details';
  readonly fullContractRoute = '/credit/contract/1';
  readonly progressTitle = 'Repayment progress';
  readonly progressText = '3 / 12 payments';
  readonly progressPaid = '1,335.60 TND paid of 5,342.40 TND';
  readonly progressPercent = 25;
  readonly upcomingTitle = 'Upcoming payments';
  readonly viewScheduleLabel = 'View full schedule';
  readonly viewScheduleRoute = '/repayment';

  readonly upcomingPayments: UpcomingPaymentRow[] = [
    { date: 'Mar 15, 2025', subtitle: 'Due in 18 days', amount: '445.20 TND', isNext: true },
    { date: 'Apr 15, 2025', subtitle: '', amount: '445.20 TND', isNext: false },
    { date: 'May 15, 2025', subtitle: '', amount: '445.20 TND', isNext: false },
  ];
}
