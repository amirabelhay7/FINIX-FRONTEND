import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import { EventDto, EventService } from '../../../services/event.service';

@Component({
  selector: 'app-client-events',
  standalone: false,
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class ClientEvents implements OnInit {
  events: EventDto[] = [];
  loading = false;
  error = '';

  showDetailsModal = false;
  selectedEvent: EventDto | null = null;
  participating = false;
  participateError = '';
  participateSuccess = '';

  ngOnInit(): void {
    this.loadEvents();
  }

  constructor(
    private eventService: EventService,
    private authService: AuthService,
  ) {}

  loadEvents(): void {
    this.loading = true;
    this.error = '';
    this.events = [];

    this.eventService.getEvents(0, 1000).subscribe({
      next: (response) => {
        this.events = Array.isArray(response?.content) ? response.content : [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les événements.';
        this.loading = false;
      },
    });
  }

  openEventDetails(eventRow: EventDto): void {
    this.selectedEvent = eventRow;
    this.participateError = '';
    this.participateSuccess = '';
    this.showDetailsModal = true;
  }

  closeEventDetails(): void {
    this.showDetailsModal = false;
    this.selectedEvent = null;
    this.participateError = '';
    this.participateSuccess = '';
    this.participating = false;
  }

  participate(): void {
    if (!this.selectedEvent?.idEvent) {
      this.participateError = "ID événement introuvable.";
      return;
    }

    const userId = this.getConnectedUserId();
    if (!userId) {
      this.participateError = 'Utilisateur connecté introuvable.';
      return;
    }

    this.participating = true;
    this.participateError = '';
    this.participateSuccess = '';

    this.eventService
      .createEventRegistration({
        eventId: this.selectedEvent.idEvent,
        userId,
        status: 'PENDING',
      })
      .subscribe({
        next: () => {
          this.participating = false;
          this.participateSuccess = 'Participation enregistrée avec succès.';
        },
        error: () => {
          this.participating = false;
          this.participateError = "Echec de l'inscription à l'événement.";
        },
      });
  }

  private getConnectedUserId(): number | null {
    const payload = this.authService.getPayload();
    if (payload?.userId) {
      return payload.userId;
    }

    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      const user = JSON.parse(raw);
      return typeof user.userId === 'number' ? user.userId : null;
    } catch {
      return null;
    }
  }
}
