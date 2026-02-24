import { Component } from '@angular/core';
import { LoanRequestAdmin } from '../../../../models';

/**
 * ViewModel: loan requests list (MVVM).
 */
@Component({
  selector: 'app-loan-requests-list',
  standalone: false,
  templateUrl: './loan-requests-list.html',
  styleUrl: './loan-requests-list.css',
})
export class LoanRequestsList {
  readonly pageTitle = 'Loan requests';
  readonly pageSubtitle = 'Review and approve or reject loan requests.';

  readonly requests: LoanRequestAdmin[] = [
    { id: 101, clientName: 'Amadou Kone', amount: '5,000 TND', status: 'PENDING', statusClass: 'bg-amber-50 text-amber-700', requested: '2026-02-20' },
    { id: 102, clientName: 'Mariem Said', amount: '3,200 TND', status: 'APPROVED', statusClass: 'bg-green-50 text-green-700', requested: '2026-02-18' },
    { id: 103, clientName: 'Karim Ben Ali', amount: '12,000 TND', status: 'APPROVED', statusClass: 'bg-green-50 text-green-700', requested: '2026-02-15' },
    { id: 104, clientName: 'Fatma Trabelsi', amount: '2,500 TND', status: 'REJECTED', statusClass: 'bg-red-50 text-red-700', requested: '2026-02-12' },
    { id: 105, clientName: 'Youssef Hammami', amount: '7,500 TND', status: 'PENDING', statusClass: 'bg-amber-50 text-amber-700', requested: '2026-02-22' },
  ];

  onApprove(req: LoanRequestAdmin): void {}
  onReject(req: LoanRequestAdmin): void {}
  onView(req: LoanRequestAdmin): void {}
}
