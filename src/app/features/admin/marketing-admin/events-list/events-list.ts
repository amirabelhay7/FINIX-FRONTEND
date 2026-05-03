import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { EventDto, EventService } from '../../../../services/event.service';

interface EventListItem {
  id: number;
  name: string;
  date: string;
  registrations: string;
}

/**
 * ViewModel: events list (MVVM).
 */
@Component({
  selector: 'app-events-list',
  standalone: false,
  templateUrl: './events-list.html',
  styleUrl: './events-list.css',
})
export class EventsList implements OnInit {
  readonly pageTitle = 'Events';
  readonly pageSubtitle = 'Events and registrations.';
  loading = false;
  error = '';

  events: EventListItem[] = [];

  constructor(private readonly eventService: EventService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.error = '';
    this.events = [];
    this.eventService
      .getEvents(0, 1000)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          const content = Array.isArray(response?.content) ? response.content : [];
          this.events = content.map((event: EventDto) => ({
            id: Number(event.idEvent ?? 0),
            name: event.title || 'Untitled event',
            date: event.startDate ? new Date(event.startDate).toISOString().slice(0, 10) : '-',
            registrations: `${event.currentParticipants ?? 0}`,
          }));
        },
        error: () => {
          this.error = 'Unable to load events from database.';
        },
      });
  }

  onAddEvent(): void {}
  onView(event: EventListItem): void {}
  onDelete(event: EventListItem): void {}
}
