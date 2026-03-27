import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { AppNotificationDto, NotificationService } from '../../../../services/notifications/notification.service';

@Component({
  selector: 'app-inbox-list',
  standalone: false,
  templateUrl: './inbox-list.html',
  styleUrl: './inbox-list.css',
})
export class InboxList implements OnInit {
  readonly pageTitle = 'Notifications';
  readonly pageSubtitle = 'Platform updates for your account (read-only feed).';

  loading = true;
  errorMessage = '';
  items: AppNotificationDto[] = [];

  constructor(
    private notifications: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
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
