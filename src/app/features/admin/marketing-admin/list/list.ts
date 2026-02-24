import { Component } from '@angular/core';
import { AdminHubCard } from '../../../../models';

/**
 * ViewModel: marketing hub (MVVM).
 */
@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  readonly pageTitle = 'Marketing';
  readonly pageSubtitle = 'Campaigns, segments, events, registrations.';

  readonly cards: AdminHubCard[] = [
    { title: 'Campaigns', subtitle: 'Marketing campaigns', route: '/admin/marketing/campaigns', icon: 'campaign', iconColorClass: 'text-[#135bec]' },
    { title: 'Segments', subtitle: 'Audience segments', route: '/admin/marketing/segments', icon: 'group', iconColorClass: 'text-green-600' },
    { title: 'Events', subtitle: 'Events & registrations', route: '/admin/marketing/events', icon: 'event', iconColorClass: 'text-amber-500' },
  ];
}
