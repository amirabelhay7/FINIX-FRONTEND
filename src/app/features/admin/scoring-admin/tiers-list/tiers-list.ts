import { Component } from '@angular/core';
import { AdminTierRow } from '../../../../models';

/**
 * ViewModel: admin user tiers list (MVVM).
 * All static data in VM; view only binds.
 */
@Component({
  selector: 'app-tiers-list',
  standalone: false,
  templateUrl: './tiers-list.html',
  styleUrl: './tiers-list.css',
})
export class TiersList {
  readonly pageTitle = 'User Tiers';
  readonly pageSubtitle = 'Bronze, Silver, Gold, Platinum — score ranges and benefits.';
  readonly addTierLabel = 'Add Tier';
  readonly addTierRoute = '/admin/scoring/tiers/new';
  readonly editLabel = 'Edit';

  readonly rows: AdminTierRow[] = [
    { id: 1, tierName: 'BEGINNER', scoreRange: '0 – 99', status: 'Active', statusClass: 'bg-green-50 text-green-700', editRoute: '/admin/scoring/tiers/edit/1' },
    { id: 2, tierName: 'BRONZE', scoreRange: '100 – 249', status: 'Active', statusClass: 'bg-green-50 text-green-700', editRoute: '/admin/scoring/tiers/edit/2' },
    { id: 3, tierName: 'SILVER', scoreRange: '250 – 499', status: 'Active', statusClass: 'bg-green-50 text-green-700', editRoute: '/admin/scoring/tiers/edit/3' },
    { id: 4, tierName: 'GOLD', scoreRange: '500 – 799', status: 'Active', statusClass: 'bg-green-50 text-green-700', editRoute: '/admin/scoring/tiers/edit/4' },
    { id: 5, tierName: 'PLATINUM', scoreRange: '800+', status: 'Active', statusClass: 'bg-green-50 text-green-700', editRoute: '/admin/scoring/tiers/edit/5' },
  ];
}
