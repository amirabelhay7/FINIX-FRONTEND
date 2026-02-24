import { Component } from '@angular/core';
import { AdminScoringRuleRow, AdminFilterOption } from '../../../../models';

/**
 * ViewModel: admin scoring rules list (MVVM).
 * All static data and filter options in VM; view only binds.
 */
@Component({
  selector: 'app-rules-list',
  standalone: false,
  templateUrl: './rules-list.html',
  styleUrl: './rules-list.css',
})
export class RulesList {
  readonly pageTitle = 'Scoring Rules';
  readonly pageSubtitle = 'Configure score rules: document verification, profile, wallet, guarantees.';
  readonly addRuleLabel = 'Add Rule';
  readonly addRuleRoute = '/admin/scoring/rules/new';

  readonly searchPlaceholder = 'Search rules...';
  readonly typeFilterOptions: AdminFilterOption[] = [
    { value: '', label: 'All types' },
    { value: 'DOCUMENT_VERIFICATION', label: 'DOCUMENT_VERIFICATION' },
    { value: 'PROFILE_COMPLETION', label: 'PROFILE_COMPLETION' },
    { value: 'WALLET_DEPOSIT', label: 'WALLET_DEPOSIT' },
    { value: 'GUARANTEE_RECEIVED', label: 'GUARANTEE_RECEIVED' },
  ];

  readonly rows: AdminScoringRuleRow[] = [
    { id: 1, ruleName: 'CIN verification', type: 'DOCUMENT_VERIFICATION', points: '50', status: 'Active', statusClass: 'bg-green-50 text-green-700', editRoute: '/admin/scoring/rules/edit/1', actionLabel: 'Deactivate', actionButtonClass: 'text-red-600' },
    { id: 2, ruleName: 'Profile completion', type: 'PROFILE_COMPLETION', points: '30', status: 'Active', statusClass: 'bg-green-50 text-green-700', editRoute: '/admin/scoring/rules/edit/2', actionLabel: 'Deactivate', actionButtonClass: 'text-red-600' },
    { id: 3, ruleName: 'First wallet deposit', type: 'WALLET_DEPOSIT', points: '20', status: 'Inactive', statusClass: 'bg-gray-100 text-gray-600', editRoute: '/admin/scoring/rules/edit/3', actionLabel: 'Activate', actionButtonClass: 'text-green-600' },
  ];
  readonly editLabel = 'Edit';
}
