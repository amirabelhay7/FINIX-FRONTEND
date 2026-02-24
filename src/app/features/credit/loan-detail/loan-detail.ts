import { Component } from '@angular/core';
import { ContractTermItem, ContractDocumentRow } from '../../../models';

/**
 * ViewModel: loan/contract detail (MVVM).
 */
@Component({
  selector: 'app-loan-detail',
  standalone: false,
  templateUrl: './loan-detail.html',
  styleUrl: './loan-detail.css',
})
export class LoanDetail {
  readonly pageTitle = 'Contract #FIN-2025-0842';
  readonly pageSubtitle = 'Signed Jan 15, 2025 · Active';
  readonly backRoute = '/credit/my-loans';
  readonly termsTitle = 'Contract terms';
  readonly documentsTitle = 'Documents';
  readonly scheduleLabel = 'Repayment schedule';
  readonly scheduleRoute = '/repayment';
  readonly downloadLabel = 'Download';

  readonly terms: ContractTermItem[] = [
    { label: 'Credit amount', value: '5,000.00 TND' },
    { label: 'Interest rate', value: '8.5%' },
    { label: 'Duration', value: '12 months' },
    { label: 'Total to repay', value: '5,342.40 TND' },
    { label: 'First due date', value: 'Feb 15, 2025' },
    { label: 'End date', value: 'Jan 15, 2026' },
  ];

  readonly documents: ContractDocumentRow[] = [
    { title: 'Signed contract.pdf', uploadedAt: 'Uploaded Jan 15, 2025' },
    { title: 'ID document.pdf', uploadedAt: 'Uploaded Jan 10, 2025' },
  ];
}
