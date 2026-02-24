import { Component } from '@angular/core';

/**
 * ViewModel: claim detail (MVVM).
 */
@Component({
  selector: 'app-claim-detail',
  standalone: false,
  templateUrl: './claim-detail.html',
  styleUrl: './claim-detail.css',
})
export class ClaimDetail {
  readonly pageTitle = 'Claim details';
  readonly pageSubtitle = 'Claim #1';
  readonly backRoute = '/insurance/my-claims';
  readonly backLabel = 'Back to my claims';
  readonly policyLabel = 'Policy';
  readonly policyValue = 'Micro-health basic';
  readonly amountLabel = 'Amount claimed';
  readonly amountValue = '500 TND';
  readonly statusLabel = 'Status';
  readonly statusValue = 'Pending';
  readonly statusClass = 'bg-amber-50 text-amber-700';
  readonly submittedLabel = 'Submitted';
  readonly submittedValue = '2025-02-18';
  readonly descriptionLabel = 'Description';
  readonly descriptionText = 'Medical expense reimbursement — doctor visit and prescription.';
}
