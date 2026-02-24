import { Component } from '@angular/core';
import { AdminGuaranteeRow, AdminFilterOption } from '../../../../models';

/**
 * ViewModel: admin guarantees list (MVVM).
 * All static data and filter options in VM; view only binds.
 */
@Component({
  selector: 'app-guarantees-list',
  standalone: false,
  templateUrl: './guarantees-list.html',
  styleUrl: './guarantees-list.css',
})
export class GuaranteesList {
  readonly pageTitle = 'Guarantees';
  readonly pageSubtitle = 'All guarantees: guarantor, beneficiary, points, acceptance status.';

  readonly searchPlaceholder = 'Search by guarantor or beneficiary...';
  readonly statusFilterOptions: AdminFilterOption[] = [
    { value: '', label: 'All status' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Expired', label: 'Expired' },
  ];

  readonly rows: AdminGuaranteeRow[] = [
    { id: 1, guarantor: 'Amadou Kone', beneficiary: 'Mariem Said', points: '50', created: '2025-02-01', accepted: 'Yes', acceptedClass: 'bg-green-50 text-green-700', viewRoute: '/admin/scoring/guarantees/1' },
    { id: 2, guarantor: 'Karim Ben Ali', beneficiary: 'Salah Haddad', points: '30', created: '2025-02-15', accepted: 'Pending', acceptedClass: 'bg-amber-50 text-amber-700', viewRoute: '/admin/scoring/guarantees/2' },
  ];
  readonly viewLabel = 'View';
}
