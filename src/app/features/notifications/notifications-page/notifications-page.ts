import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { AppNotificationDto, NotificationService } from '../../../services/notifications/notification.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-notifications-page',
  standalone: false,
  templateUrl: './notifications-page.html',
  styleUrl: './notifications-page.css',
})
export class NotificationsPageComponent implements OnInit {
  readonly pageTitle = 'Notifications';
  readonly pageSubtitle = 'System updates for your account. One-way alerts only — not messaging.';

  homeRoute = '/client';
  loading = true;
  errorMessage = '';
  items: AppNotificationDto[] = [];

  constructor(
    private notifications: NotificationService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.homeRoute = this.auth.getHomeRoute();
    this.load();
  }

  load(): void {
    this.loading = true;
    this.errorMessage = '';
    this.notifications
      .list()
      .pipe(
        catchError(() => {
          this.errorMessage = 'Unable to load notifications.';
          return of([] as AppNotificationDto[]);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe((rows) => {
        this.items = rows ?? [];
      });
  }

  isUnread(n: AppNotificationDto): boolean {
    return n.readAt == null || n.readAt === '';
  }

  markRead(n: AppNotificationDto): void {
    if (!n.id || !this.isUnread(n)) return;
    this.notifications.markRead(n.id).subscribe(() => {
      n.readAt = new Date().toISOString();
      this.cdr.detectChanges();
    });
  }

  formatWhen(raw: string | null | undefined): string {
    if (!raw) return '—';
    try {
      const d = new Date(raw);
      return Number.isNaN(d.getTime()) ? raw : d.toLocaleString();
    } catch {
      return raw;
    }
  }
}
