import { Component } from '@angular/core';
import { AdminAchievementRow, AdminFilterOption } from '../../../../models';

/**
 * ViewModel: admin achievements list (MVVM).
 * All static data and filter options in VM; view only binds.
 */
@Component({
  selector: 'app-achievements-list',
  standalone: false,
  templateUrl: './achievements-list.html',
  styleUrl: './achievements-list.css',
})
export class AchievementsList {
  readonly pageTitle = 'Achievements';
  readonly pageSubtitle = 'Manage achievements (DOCUMENT, PROFILE, WALLET, GUARANTEE, LOAN).';
  readonly addAchievementLabel = 'Add Achievement';

  readonly searchPlaceholder = 'Search achievements...';
  readonly typeFilterOptions: AdminFilterOption[] = [
    { value: '', label: 'All types' },
    { value: 'DOCUMENT', label: 'DOCUMENT' },
    { value: 'PROFILE', label: 'PROFILE' },
    { value: 'WALLET', label: 'WALLET' },
    { value: 'GUARANTEE', label: 'GUARANTEE' },
    { value: 'LOAN', label: 'LOAN' },
  ];

  readonly rows: AdminAchievementRow[] = [
    { id: 1, title: 'First document verified', type: 'DOCUMENT', points: '50', status: 'Active', statusClass: 'bg-green-50 text-green-700', editRoute: '/admin/scoring/achievements/1' },
    { id: 2, title: 'Profile 100%', type: 'PROFILE', points: '30', status: 'Active', statusClass: 'bg-green-50 text-green-700', editRoute: '/admin/scoring/achievements/2' },
    { id: 3, title: 'First loan repaid', type: 'LOAN', points: '100', status: 'Active', statusClass: 'bg-green-50 text-green-700', editRoute: '/admin/scoring/achievements/3' },
  ];
  readonly editLabel = 'Edit';
  readonly deleteLabel = 'Delete';
}
