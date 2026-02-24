import { Component } from '@angular/core';
import { CreditDurationOption } from '../../../models';

/**
 * ViewModel: apply for loan (MVVM).
 */
@Component({
  selector: 'app-loan-apply',
  standalone: false,
  templateUrl: './loan-apply.html',
  styleUrl: './loan-apply.css',
})
export class LoanApply {
  readonly pageTitle = 'Apply for a Loan';
  readonly pageSubtitle = "Submit your request. We'll review and get back to you quickly.";
  readonly amountLabel = 'Loan amount';
  readonly downPaymentLabel = 'Down payment (optional)';
  readonly durationLabel = 'Duration (months)';
  readonly purposeLabel = 'Purpose of credit';
  readonly purposePlaceholder = 'e.g. Moto-taxi purchase, equipment...';
  readonly submitLabel = 'Submit request';
  readonly cancelLabel = 'Cancel';
  readonly cancelRoute = '/credit/my-loans';
  readonly estimatedLabel = 'Estimated monthly payment';
  readonly estimatedAmount = '265.00 TND';
  readonly estimatedUnit = '/ month';
  readonly estimatedNote = 'Based on current rate. Final terms after approval.';
  readonly currencySymbol = 'TND';

  readonly durationOptions: CreditDurationOption[] = [
    { value: 6, label: '6 months' },
    { value: 12, label: '12 months', selected: true },
    { value: 24, label: '24 months' },
    { value: 36, label: '36 months' },
  ];
}
