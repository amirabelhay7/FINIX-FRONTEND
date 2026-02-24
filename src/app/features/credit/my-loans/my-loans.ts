import { Component } from '@angular/core';
import { LoanSummary, ActiveContractSummary, LoanRequest } from '../../../models';

/**
 * ViewModel: my loans (MVVM).
 */
@Component({
  selector: 'app-my-loans',
  standalone: false,
  templateUrl: './my-loans.html',
  styleUrl: './my-loans.css',
})
export class MyLoans {
  readonly pageTitle = 'My Loans';
  readonly pageSubtitle = 'Your loan requests and active contracts in one place.';

  readonly summary: LoanSummary = {
    activeContracts: 1,
    pendingRequests: 0,
    totalBorrowed: '5,000 TND',
  };

  readonly activeContract: ActiveContractSummary = {
    contractNumber: 'FIN-2025-0842',
    amount: '5,000 TND',
    duration: '12 months',
    rate: '8.5%',
    nextPaymentDate: 'Mar 15, 2025',
    nextPaymentAmount: '445.20 TND',
    contractRoute: '/credit/contract/1',
  };

  readonly loanRequests: LoanRequest[] = [
    { id: 1, amount: '5,000 TND', duration: '12 months', status: 'approved', submittedAt: 'Jan 10, 2025', note: 'Submitted Jan 10, 2025 · Approved', actionRoute: '/credit/contract/1', actionLabel: 'View contract', icon: 'check_circle', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
    { id: 2, amount: '3,000 TND', duration: '12 months · Vehicle', status: 'pending', submittedAt: '—', note: 'Preliminarily approved · Agent verification pending', actionRoute: '/credit/application/2', actionLabel: 'View status', icon: 'pending_actions', iconBgClass: 'bg-amber-50', iconColorClass: 'text-amber-600' },
    { id: 3, amount: '2,500 TND', duration: '6 months', status: 'rejected', submittedAt: 'Feb 5, 2025', note: 'Submitted Feb 5, 2025 · Rejected (insufficient score)', actionLabel: 'Rejected', icon: 'cancel', iconBgClass: 'bg-red-50', iconColorClass: 'text-red-500' },
  ];
}
