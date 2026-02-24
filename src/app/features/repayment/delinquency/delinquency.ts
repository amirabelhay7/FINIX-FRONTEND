import { Component } from '@angular/core';

/**
 * ViewModel: delinquency (MVVM).
 */
@Component({
  selector: 'app-delinquency',
  standalone: false,
  templateUrl: './delinquency.html',
  styleUrl: './delinquency.css',
})
export class Delinquency {
  readonly pageTitle = 'Delinquency';
  readonly pageSubtitle = 'Overdue payments and recovery status.';
  readonly scheduleRoute = '/repayment/schedule';
  readonly scheduleLabel = 'Go to schedule';
  readonly noOverdueTitle = 'No overdue payments';
  readonly noOverdueText = "You're up to date. Next payment due Mar 15, 2025.";
  readonly faqTitle = 'What happens if I miss a payment?';
  readonly faqText = "We'll send reminders before and after the due date. Late payments may affect your score and attract penalties. Contact us if you're facing difficulty.";
}
