import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { EventDto, EventRegistrationDto, EventService } from '../../../services/event.service';

@Component({
  selector: 'app-client-events',
  standalone: false,
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class ClientEvents implements OnInit {
  events: EventDto[] = [];
  eventsPage = 1;
  eventsPageSize = 6;
  loading = false;
  error = '';

  showDetailsModal = false;
  selectedEvent: EventDto | null = null;
  participating = false;
  participateError = '';
  participateSuccess = '';
  private participatedEventIds = new Set<number>();

  ngOnInit(): void {
    this.loadParticipatedEventsFromStorage();
    this.loadParticipatedEventsFromBackend();
    this.loadEvents();
  }

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  loadEvents(): void {
    this.loading = true;
    this.error = '';
    this.events = [];

    this.eventService
      .getEvents(0, 1000)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          this.events = Array.isArray(response?.content) ? response.content : [];
          this.eventsPage = 1;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Impossible de charger les événements.';
          this.cdr.detectChanges();
        },
      });
  }

  formatDate(value: unknown): string {
    if (!value) return '-';
    const d = new Date(value as string);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString();
  }

  formatModalDate(value: unknown): string {
    if (!value) return '-';
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatStatus(status: string | undefined): string {
    return (status || 'UNKNOWN').toUpperCase();
  }

  getStatusBadgeClass(status: string | undefined): string {
    switch ((status || '').toUpperCase()) {
      case 'PUBLISHED':
        return 'status-badge badge-approved';
      case 'DRAFT':
        return 'status-badge badge-rejected';
      case 'CANCELLED':
        return 'status-badge badge-rejected';
      default:
        return 'status-badge badge-pending';
    }
  }

  getParticipantsProgress(ev: EventDto): number {
    const max = Number(ev.maxParticipants) || 0;
    if (max <= 0) return 0;
    const current = Math.max(0, Number(ev.currentParticipants) || 0);
    return Math.max(0, Math.min(100, Math.round((current / max) * 100)));
  }

  formatCardDate(value: unknown): string {
    if (!value) return 'Date TBD';
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return 'Date TBD';
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getEventImage(ev: EventDto, index: number): string {
    if (ev.image && ev.image.trim().length > 0) {
      return ev.image;
    }
    if (ev.imageUrl && ev.imageUrl.trim().length > 0) {
      return ev.imageUrl;
    }
    const fallback = [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1560439514-4e9645039924?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=1200&auto=format&fit=crop',
    ];
    return fallback[index % fallback.length];
  }

  hasParticipated(ev: EventDto): boolean {
    return !!ev.idEvent && this.participatedEventIds.has(ev.idEvent);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.events.length / this.eventsPageSize));
  }

  get paginatedEvents(): EventDto[] {
    const start = (this.eventsPage - 1) * this.eventsPageSize;
    return this.events.slice(start, start + this.eventsPageSize);
  }

  get paginationPages(): number[] {
    const total = this.totalPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const current = this.eventsPage;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }

  goToPage(page: number): void {
    this.eventsPage = Math.min(Math.max(1, page), this.totalPages);
  }

  openEventDetails(eventRow: EventDto): void {
    this.selectedEvent = eventRow;
    this.participateError = '';
    this.participateSuccess = '';
    this.showDetailsModal = true;
  }

  getSelectedEventImage(): string | null {
    const ev = this.selectedEvent;
    if (!ev) return null;
    if (ev.imageUrl && ev.imageUrl.trim().length > 0) return ev.imageUrl;
    if (ev.image && ev.image.trim().length > 0) return ev.image;
    return null;
  }

  getSelectedEventPlaceholderStyle(): Record<string, string> {
    const title = this.selectedEvent?.title || 'Event';
    const seed = Array.from(title).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const hueA = seed % 360;
    const hueB = (seed * 1.7) % 360;
    return {
      background: `linear-gradient(135deg, hsl(${hueA} 72% 48%), hsl(${hueB} 70% 36%))`,
    };
  }

  get selectedProgressPercent(): number {
    if (!this.selectedEvent) return 0;
    return this.getParticipantsProgress(this.selectedEvent);
  }

  get selectedIsFull(): boolean {
    if (!this.selectedEvent) return false;
    const capacity = Math.max(0, Number(this.selectedEvent.maxParticipants) || 0);
    const current = Math.max(0, Number(this.selectedEvent.currentParticipants) || 0);
    return capacity > 0 && current >= capacity;
  }

  get selectedIsPaid(): boolean {
    const ev = this.selectedEvent as any;
    return Number(ev?.registrationFee || 0) > 0;
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
          this.markEventParticipated(this.selectedEvent?.idEvent);
          this.applyLocalParticipantIncrement(this.selectedEvent?.idEvent);
          this.loadEvents();
        },
        error: (err: any) => {
          this.participating = false;
          this.participateError = err?.error?.message || err?.message || "Echec de l'inscription à l'événement.";
        },
      });
  }

  private applyLocalParticipantIncrement(eventId?: number): void {
    if (!eventId) {
      return;
    }
    this.events = this.events.map((ev) => {
      if (ev.idEvent !== eventId) return ev;
      return {
        ...ev,
        currentParticipants: (ev.currentParticipants ?? 0) + 1,
      };
    });
    if (this.selectedEvent?.idEvent === eventId) {
      this.selectedEvent = {
        ...this.selectedEvent,
        currentParticipants: (this.selectedEvent.currentParticipants ?? 0) + 1,
      };
    }
    this.cdr.detectChanges();
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

  private storageKey(): string {
    const userId = this.getConnectedUserId();
    return `client_participated_events_${userId ?? 'guest'}`;
  }

  private loadParticipatedEventsFromStorage(): void {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (!raw) {
        this.participatedEventIds = new Set<number>();
        return;
      }
      const parsed = JSON.parse(raw);
      const ids = Array.isArray(parsed) ? parsed.map((x) => Number(x)).filter((x) => Number.isInteger(x) && x > 0) : [];
      this.participatedEventIds = new Set<number>(ids);
    } catch {
      this.participatedEventIds = new Set<number>();
    }
  }

  private markEventParticipated(eventId?: number): void {
    if (!eventId) return;
    this.participatedEventIds.add(eventId);
    try {
      localStorage.setItem(this.storageKey(), JSON.stringify(Array.from(this.participatedEventIds)));
    } catch {
      // ignore storage write failure (private mode/quota)
    }
  }

  private loadParticipatedEventsFromBackend(): void {
    const userId = this.getConnectedUserId();
    if (!userId) return;

    this.eventService.getEventRegistrations(0, 1000).subscribe({
      next: (response) => {
        const rows = Array.isArray(response?.content) ? response.content : [];
        const participatedIds = rows
          .filter((r: EventRegistrationDto) => Number(r.userId) === Number(userId) && !!r.eventId)
          .map((r: EventRegistrationDto) => Number(r.eventId))
          .filter((id) => Number.isInteger(id) && id > 0);

        if (participatedIds.length === 0) return;
        for (const id of participatedIds) {
          this.participatedEventIds.add(id);
        }
        try {
          localStorage.setItem(this.storageKey(), JSON.stringify(Array.from(this.participatedEventIds)));
        } catch {
          // ignore storage write failure
        }
        this.cdr.detectChanges();
      },
      error: () => {
        // keep local fallback only if backend call fails
      },
    });
  }
}
