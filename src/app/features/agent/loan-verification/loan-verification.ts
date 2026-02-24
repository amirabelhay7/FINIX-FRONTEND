import { Component } from '@angular/core';
import { AgentVerificationRow } from '../../../models';

/**
 * ViewModel: loan verification (MVVM).
 */
@Component({
  selector: 'app-loan-verification',
  standalone: false,
  templateUrl: './loan-verification.html',
  styleUrl: './loan-verification.css',
})
export class LoanVerification {
  readonly pageTitle = 'Loan verification';
  readonly pageSubtitle = 'Verify applicants in person (ID check) after preliminary approval.';
  readonly pendingTitle = 'Pending verification';
  readonly approveLabel = 'Approve';
  readonly rejectLabel = 'Reject';

  readonly pending: AgentVerificationRow[] = [
    { name: 'Mariem Said', meta: 'Request #REQ-2025-008 · 5,000 TND vehicle credit · Preliminarily approved' },
  ];
}
