import { Component } from '@angular/core';
import { EventListItem } from '../../../../models';

/**
 * ViewModel: events list (MVVM).
 */
@Component({
  selector: 'app-events-list',
  standalone: false,
  templateUrl: './events-list.html',
  styleUrl: './events-list.css',
})
export class EventsList {
  readonly pageTitle = 'Events';
  readonly pageSubtitle = 'Events and registrations.';

  readonly events: EventListItem[] = [
    { id: 1, name: 'Financial literacy workshop', date: '2025-03-15', registrations: '42' },
    { id: 2, name: 'Savings challenge kickoff', date: '2025-04-01', registrations: '128' },
    { id: 3, name: 'Agent summit Q2', date: '2025-04-20', registrations: '56' },
  ];

  onAddEvent(): void {}
  onView(event: EventListItem): void {}
  onDelete(event: EventListItem): void {}
}
