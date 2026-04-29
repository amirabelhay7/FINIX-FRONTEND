import { Component, OnInit } from '@angular/core';
import { EventDto, EventService } from '../../../services/event.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class ClientDashboard implements OnInit {
  firstName = 'Utilisateur';
  events: EventDto[] = [];
  calendarCursor = new Date();
  showEventModal = false;
  selectedEvent: EventDto | null = null;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.firstName = (user.name || 'Utilisateur').split(' ')[0];
      }
    } catch { }
    this.loadEvents();
  }

  loadEvents(): void {
    this.eventService.getEvents(0, 1000).subscribe({
      next: (response) => {
        this.events = Array.isArray(response?.content) ? response.content : [];
      },
      error: () => {
        this.events = [];
      },
    });
  }

  get calendarMonthLabel(): string {
    return this.calendarCursor.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  get calendarWeekdays(): string[] {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }

  get calendarDays(): Array<{ day: number; date: Date; inMonth: boolean; isEventDay: boolean; hasMultiple: boolean }> {
    const year = this.calendarCursor.getFullYear();
    const month = this.calendarCursor.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startOffset = (first.getDay() + 6) % 7;
    const totalCells = Math.ceil((startOffset + last.getDate()) / 7) * 7;
    const counts = this.eventCountsByDate();

    const cells: Array<{ day: number; date: Date; inMonth: boolean; isEventDay: boolean; hasMultiple: boolean }> = [];
    for (let i = 0; i < totalCells; i += 1) {
      const current = new Date(year, month, i - startOffset + 1);
      const key = this.dateKey(current);
      const count = counts.get(key) || 0;
      cells.push({
        day: current.getDate(),
        date: current,
        inMonth: current.getMonth() === month,
        isEventDay: count > 0,
        hasMultiple: count > 1,
      });
    }
    return cells;
  }

  prevCalendarMonth(): void {
    this.calendarCursor = new Date(this.calendarCursor.getFullYear(), this.calendarCursor.getMonth() - 1, 1);
  }

  nextCalendarMonth(): void {
    this.calendarCursor = new Date(this.calendarCursor.getFullYear(), this.calendarCursor.getMonth() + 1, 1);
  }

  onCalendarDayClick(day: { date: Date; inMonth: boolean; isEventDay: boolean }): void {
    if (!day.inMonth || !day.isEventDay) return;
    const key = this.dateKey(day.date);
    const matching = this.events.filter((ev) => this.dateKey(ev.startDate) === key);
    if (matching.length === 0) return;
    this.selectedEvent = matching.sort((a, b) => {
      const ta = a.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
      const tb = b.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
      return ta - tb;
    })[0];
    this.showEventModal = true;
  }

  closeEventModal(): void {
    this.showEventModal = false;
    this.selectedEvent = null;
  }

  formatDate(value: unknown): string {
    if (!value) return '-';
    const d = new Date(value as string);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString();
  }

  private eventCountsByDate(): Map<string, number> {
    const map = new Map<string, number>();
    for (const ev of this.events) {
      const key = this.dateKey(ev.startDate);
      if (!key) continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }

  private dateKey(value: unknown): string {
    if (!value) return '';
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
