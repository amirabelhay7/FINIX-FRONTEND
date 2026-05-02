import { Component } from '@angular/core';
import { AdminTutorialRow, AdminFilterOption } from '../../../../models';

/**
 * ViewModel: admin tutorials list (MVVM).
 * All static data and filter options in VM; view only binds.
 */
@Component({
  selector: 'app-tutorials-list',
  standalone: false,
  templateUrl: './tutorials-list.html',
  styleUrl: './tutorials-list.css',
})
export class TutorialsList {
  readonly pageTitle = 'Tutorials';
  readonly pageSubtitle = 'Manage tutorials for document, profile, wallet, guarantee.';
  readonly addTutorialLabel = 'Add Tutorial';

  readonly searchPlaceholder = 'Search tutorials...';
  readonly typeFilterOptions: AdminFilterOption[] = [
    { value: '', label: 'All types' },
    { value: 'DOCUMENT', label: 'DOCUMENT' },
    { value: 'PROFILE', label: 'PROFILE' },
    { value: 'WALLET', label: 'WALLET' },
    { value: 'GUARANTEE', label: 'GUARANTEE' },
  ];

  readonly rows: AdminTutorialRow[] = [
    { id: 1, title: 'Upload your CIN', type: 'DOCUMENT', points: '25', difficulty: 'EASY', difficultyClass: 'bg-green-50 text-green-700', estMin: 5, editRoute: '/admin/scoring/tutorials/1' },
    { id: 2, title: 'Complete your profile', type: 'PROFILE', points: '15', difficulty: 'MEDIUM', difficultyClass: 'bg-amber-50 text-amber-700', estMin: 10, editRoute: '/admin/scoring/tutorials/2' },
    { id: 3, title: 'Load your wallet', type: 'WALLET', points: '20', difficulty: 'EASY', difficultyClass: 'bg-green-50 text-green-700', estMin: 3, editRoute: '/admin/scoring/tutorials/3' },
  ];
  readonly editLabel = 'Edit';
  readonly deleteLabel = 'Delete';
}
