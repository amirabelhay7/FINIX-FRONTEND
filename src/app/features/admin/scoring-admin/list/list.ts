import { Component } from '@angular/core';
import { AdminHubCard } from '../../../../models';

/**
 * ViewModel: scoring admin hub (MVVM).
 */
@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  readonly pageTitle = 'Risk & Scoring';
  readonly pageSubtitle = 'Scoring rules, user tiers, tutorials, achievements, guarantees.';

  readonly cards: AdminHubCard[] = [
    { title: 'Scoring rules', subtitle: 'Configure rules', route: '/admin/scoring/rules', icon: 'rule', iconColorClass: 'text-[#135bec]' },
    { title: 'User tiers', subtitle: 'Bronze, Silver, Gold', route: '/admin/scoring/tiers', icon: 'workspace_premium', iconColorClass: 'text-amber-500' },
    { title: 'Tutorials', subtitle: 'Manage tutorials', route: '/admin/scoring/tutorials', icon: 'school', iconColorClass: 'text-green-600' },
    { title: 'Achievements', subtitle: 'Manage achievements', route: '/admin/scoring/achievements', icon: 'emoji_events', iconColorClass: 'text-purple-600' },
    { title: 'Guarantees', subtitle: 'View all guarantees', route: '/admin/scoring/guarantees', icon: 'handshake', iconColorClass: 'text-blue-600' },
  ];
}
