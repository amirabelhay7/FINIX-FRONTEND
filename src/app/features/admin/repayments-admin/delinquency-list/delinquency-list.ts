import { Component } from '@angular/core';
import { AdminDelinquencyRow, AdminFilterOption } from '../../../../models';

/**
 * ViewModel: admin delinquency list (MVVM).
 * All static data and filter options in VM; view only binds.
 */
@Component({
  selector: 'app-delinquency-list',
  standalone: false,
  templateUrl: './delinquency-list.html',
  styleUrl: './delinquency-list.css',
})
export class DelinquencyList {
  readonly pageTitle = 'Delinquency cases';
  readonly pageSubtitle = 'Overdue repayment cases (risk level, category, status).';
  readonly backRoute = '/admin/repayments';

  readonly statusOptions: AdminFilterOption[] = [
    { value: '', label: 'All status' },
    { value: 'OPEN', label: 'OPEN' },
    { value: 'IN_PROGRESS', label: 'IN_PROGRESS' },
    { value: 'CLOSED', label: 'CLOSED' },
  ];
  readonly riskOptions: AdminFilterOption[] = [
    { value: '', label: 'All risk' },
    { value: 'LOW', label: 'LOW' },
    { value: 'MEDIUM', label: 'MEDIUM' },
    { value: 'HIGH', label: 'HIGH' },
  ];

  readonly rows: AdminDelinquencyRow[] = [
    { id: 1, riskLevel: 'MEDIUM', riskClass: 'bg-amber-50 text-amber-700', category: 'LATE_PAYMENT', status: 'IN_PROGRESS', statusClass: 'bg-blue-50 text-[#135bec]', opened: '2025-02-10', viewRoute: '/admin/repayments/delinquency/1' },
    { id: 2, riskLevel: 'HIGH', riskClass: 'bg-red-50 text-red-700', category: 'DEFAULT', status: 'OPEN', statusClass: 'bg-gray-100 text-gray-600', opened: '2025-02-18', viewRoute: '/admin/repayments/delinquency/2' },
  ];
}
