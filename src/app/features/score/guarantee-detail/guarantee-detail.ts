import { Component } from '@angular/core';

/**
 * ViewModel: guarantee detail (MVVM).
 */
@Component({
  selector: 'app-guarantee-detail',
  standalone: false,
  templateUrl: './guarantee-detail.html',
  styleUrl: './guarantee-detail.css',
})
export class GuaranteeDetail {
  readonly pageTitle = 'Guarantee request';
  readonly pageSubtitle = 'From Karim Ben Ali — 50 points';
  readonly backRoute = '/score/guarantees';
  readonly guarantorLabel = 'Guarantor';
  readonly guarantorValue = 'Karim Ben Ali';
  readonly pointsLabel = 'Points offered';
  readonly pointsValue = '50';
  readonly statusLabel = 'Status';
  readonly statusValue = 'Pending';
  readonly statusClass = 'bg-amber-50 text-amber-700';
  readonly expiresLabel = 'Expires';
  readonly expiresValue = '2025-03-15';
  readonly reasonLabel = 'Reason';
  readonly reasonText = 'Supporting my loan application as guarantor.';
  readonly acceptLabel = 'Accept';
  readonly rejectLabel = 'Reject';
  readonly backLabel = 'Back';
}
