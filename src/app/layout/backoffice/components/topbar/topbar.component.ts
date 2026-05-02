import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../../services/notification/notification.service';
import {
  AppNotificationDto,
  NotificationCategoryApi,
  NotificationModuleApi,
} from '../../../../models';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
  standalone: false,
})
export class TopbarComponent implements OnInit, OnDestroy, OnChanges {
  @Input() currentPage: string = 'dashboard';
  @Input() currentTheme: 'light' | 'dark' = 'light';
  /** Si défini (ex. `VEHICLE` sur la page véhicules), filtre badge + liste. */
  @Input() notificationModuleFilter: NotificationModuleApi | null = null;

  @Output() themeToggled = new EventEmitter<void>();
  @Output() loggedOut = new EventEmitter<void>();
  @Output() navigatePage = new EventEmitter<string>();

  searchValue: string = '';

  dropdownOpen = false;
  notifications: AppNotificationDto[] = [];
  unreadCount = 0;
  notificationsLoading = false;
  private refreshSub?: Subscription;
  private dropdownPollingId: ReturnType<typeof setInterval> | null = null;
  private backgroundPollingId: ReturnType<typeof setInterval> | null = null;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadUnreadCount();
    this.loadNotifications(true);
    this.startBackgroundPolling();
    this.refreshSub = this.notificationService.refreshTrigger.subscribe(() => {
      this.loadUnreadCount();
      this.loadNotifications(true);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notificationModuleFilter']) {
      this.loadUnreadCount();
      this.loadNotifications(true);
    }
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
    this.stopDropdownPolling();
    this.stopBackgroundPolling();
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount(this.notificationModuleFilter ?? undefined).subscribe({
      next: (n) => (this.unreadCount = n),
      error: () => (this.unreadCount = 0),
    });
  }

  loadNotifications(silent = false): void {
    if (!silent) this.notificationsLoading = true;
    this.notificationService.getNotifications(this.notificationModuleFilter ?? undefined).subscribe({
      next: (rows) => {
        this.notifications = rows.slice(0, 25);
        this.notificationsLoading = false;
      },
      error: () => {
        if (!silent) this.notifications = [];
        this.notificationsLoading = false;
      },
    });
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.loadNotifications();
      this.loadUnreadCount();
      this.startDropdownPolling();
      return;
    }
    this.stopDropdownPolling();
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
    this.stopDropdownPolling();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.dropdownOpen) return;
    const target = event.target as HTMLElement | null;
    const inside = !!target?.closest('.tb-notif-wrap');
    if (!inside) this.closeDropdown();
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead(this.notificationModuleFilter ?? undefined).subscribe({
      next: () => {
        this.loadUnreadCount();
        this.loadNotifications();
      },
    });
  }

  onSelectNotification(n: AppNotificationDto): void {
    if (!n.read) {
      this.notificationService.markAsRead(n.id).subscribe({
        next: () => {
          n.read = true;
          this.loadUnreadCount();
        },
      });
    }
    this.routeForNotification(n);
    this.closeDropdown();
  }

  private routeForNotification(n: AppNotificationDto): void {
    if (n.module === 'VEHICLE') {
      if (n.relatedEntityType === 'VEHICLE_RESERVATION' && n.relatedEntityId != null) {
        sessionStorage.setItem('finix_focus_reservation_id', String(n.relatedEntityId));
        sessionStorage.removeItem('finix_focus_vehicle_id');
        this.navigatePage.emit('reservations');
        return;
      }
      if (n.relatedEntityId != null) {
        sessionStorage.setItem('finix_focus_vehicle_id', String(n.relatedEntityId));
        sessionStorage.removeItem('finix_focus_reservation_id');
      }
      if (n.category === 'VEHICLE_SUBMITTED') {
        this.navigatePage.emit('vehicles');
        return;
      }
      if (n.category === 'VEHICLE_APPROVED' || n.category === 'VEHICLE_REJECTED') {
        this.navigatePage.emit('vehicles');
        return;
      }
      this.navigatePage.emit('vehicles');
      return;
    }
    this.navigatePage.emit('dashboard');
  }

  categoryLabel(cat: NotificationCategoryApi): string {
    const m: Record<string, string> = {
      VEHICLE_SUBMITTED: 'New request',
      VEHICLE_APPROVED: 'Approved',
      VEHICLE_REJECTED: 'Rejected',
      UPCOMING_DUE_DATE: 'Due date',
      OVERDUE_PAYMENT: 'Overdue',
      PAYMENT_RECEIVED: 'Payment',
      RISK_ALERT: 'Risk',
      RESERVATION_PENDING_ADMIN: 'Reservation to process',
      RESERVATION_CONFIRMED_CLIENT: 'Client request',
      RESERVATION_NEW_FOR_SELLER: 'New reservation',
      RESERVATION_APPROVED: 'Reservation approved',
      RESERVATION_REJECTED: 'Reservation rejected',
      RESERVATION_AUTO_REJECTED: 'Not retained',
      RESERVATION_ACTION_REQUIRED: 'Action required',
      RESERVATION_UNDER_REVIEW: 'Under review',
      RESERVATION_CANCELLED_BY_CLIENT: 'Cancelled (client)',
      RESERVATION_CANCELLED_BY_ADMIN: 'Cancelled (admin)',
    };
    return m[cat] ?? cat;
  }

  relativeTime(iso: string): string {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} m`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} h`;
    const days = Math.floor(h / 24);
    return `${days} d`;
  }

  private startDropdownPolling(): void {
    this.stopDropdownPolling();
    this.dropdownPollingId = setInterval(() => {
      if (!this.dropdownOpen) return;
      this.loadNotifications(true);
      this.loadUnreadCount();
    }, 8000);
  }

  private stopDropdownPolling(): void {
    if (this.dropdownPollingId) {
      clearInterval(this.dropdownPollingId);
      this.dropdownPollingId = null;
    }
  }

  private startBackgroundPolling(): void {
    this.stopBackgroundPolling();
    this.backgroundPollingId = setInterval(() => {
      this.loadUnreadCount();
      this.loadNotifications(true);
    }, 15000);
  }

  private stopBackgroundPolling(): void {
    if (this.backgroundPollingId) {
      clearInterval(this.backgroundPollingId);
      this.backgroundPollingId = null;
    }
  }

  onToggleTheme(): void {
    this.themeToggled.emit();
  }

  pageMap: Record<
    string,
    {
      title: string;
      breadcrumb: string;
    }
  > = {
    dashboard: { title: 'Dashboard', breadcrumb: 'Dashboard' },
    clients: { title: 'Clients', breadcrumb: 'Clients' },
    credits: { title: 'Credits & Dossiers', breadcrumb: 'Credits' },
    repayments: { title: 'Repayments', breadcrumb: 'Repayments' },
    vehicles: { title: 'Vehicles', breadcrumb: 'Vehicles' },
    insurance: { title: 'Insurance', breadcrumb: 'Insurance' },
    risk: { title: 'Risk & Scoring', breadcrumb: 'Risk' },
    rapports: { title: 'Reports', breadcrumb: 'Reports' },
    notifications: { title: 'Alerts & Notifications', breadcrumb: 'Notifications' },
    settings: { title: 'Settings', breadcrumb: 'Settings' },
  };
}

