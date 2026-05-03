import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation, HostListener } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';
import { AppNotificationDto, NotificationCategoryApi } from '../../models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-frontoffice',
  standalone: true,
  templateUrl: './frontoffice.html',
  styleUrl: './frontoffice.css',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf],
  encapsulation: ViewEncapsulation.None,
})
export class Frontoffice implements OnInit, OnDestroy {
  currentTheme: 'light' | 'dark' = 'dark';

  navTabs = [
    { label: 'Dashboard', icon: '🏠', route: '/client/dashboard' },
    { label: 'My Credits', icon: '💳', route: '/client/credits' },
    { label: 'Repayments', icon: '💸', route: '/client/repayments', badge: '1', badgeClass: 'warn' },
    { label: 'Vehicles', icon: '🚗', route: '/client/vehicles' },
    { label: 'Insurance', icon: '🛡️', route: '/client/insurance' },
    { label: 'Wallet', icon: '👛', route: '/client/wallet' },
    { label: 'My Score', icon: '📊', route: '/client/score' },
    { label: 'Documents', icon: '📄', route: '/client/documents' },
  ];

  showUserDropdown = false;
  showNotifDropdown = false;
  notifications: AppNotificationDto[] = [];
  notificationsLoading = false;
  unreadCount = 0;
  userName = '';
  userInitials = '';
  userEmail = '';
  userRole = '';
  userImageUrl = '';

  private readonly userUpdatedListener = () => this.loadUser();
  private notifRefreshSub?: Subscription;
  private dropdownPollingId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private auth: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('finix_theme') as 'light' | 'dark' | null;
    this.currentTheme = saved || 'dark';
    this.applyTheme();
    this.loadUser();
    this.loadUnreadCount();
    this.loadNotifications(true);
    this.notifRefreshSub = this.notificationService.refreshTrigger.subscribe(() => {
      this.loadUnreadCount();
      if (this.showNotifDropdown) this.loadNotifications();
    });
    window.addEventListener('finix-user-updated', this.userUpdatedListener);
  }

  private loadUser(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.userName = user.name || 'User';
        this.userRole = (user.role || 'CLIENT');
        this.userEmail = user.email || '';
        this.userImageUrl = this.getImageUrl(user.profileImageUrl || '');
      }
    } catch { }
    const parts = this.userName.split(' ');
    this.userInitials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  ngOnDestroy(): void {
    window.removeEventListener('finix-user-updated', this.userUpdatedListener);
    this.notifRefreshSub?.unsubscribe();
    this.stopDropdownPolling();
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('finix_theme', this.currentTheme);
    this.applyTheme();
  }

  private applyTheme(): void {
    this.renderer.setAttribute(document.documentElement, 'data-theme', this.currentTheme);
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  toggleNotifDropdown(): void {
    this.showNotifDropdown = !this.showNotifDropdown;
    if (this.showNotifDropdown) {
      this.loadNotifications();
      this.loadUnreadCount();
      this.startDropdownPolling();
      return;
    }
    this.stopDropdownPolling();
  }

  closeNotifDropdown(): void {
    this.showNotifDropdown = false;
    this.stopDropdownPolling();
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count) => (this.unreadCount = count),
      error: () => (this.unreadCount = 0),
    });
  }

  loadNotifications(silent = false): void {
    if (!silent) this.notificationsLoading = true;
    this.notificationService.getNotifications().subscribe({
      next: (rows) => {
        this.notifications = rows.slice(0, 25);
        this.notificationsLoading = false;
      },
      error: () => {
        this.notifications = [];
        this.notificationsLoading = false;
      },
    });
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
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
    if (n.module === 'VEHICLE') {
      if (n.relatedEntityType === 'VEHICLE_RESERVATION' && n.relatedEntityId != null) {
        sessionStorage.setItem('finix_focus_reservation_id', String(n.relatedEntityId));
        sessionStorage.removeItem('finix_focus_vehicle_id');
        void this.router.navigate(['/client/vehicles/suivi']);
      } else {
        if (n.relatedEntityId != null) {
          sessionStorage.setItem('finix_focus_vehicle_id', String(n.relatedEntityId));
          sessionStorage.removeItem('finix_focus_reservation_id');
        }
        void this.router.navigate(['/client/vehicles']);
      }
    }
    this.closeNotifDropdown();
  }

  notificationCategoryLabel(category: NotificationCategoryApi): string {
    const labels: Record<string, string> = {
      VEHICLE_SUBMITTED: 'New request',
      VEHICLE_APPROVED: 'Approved',
      VEHICLE_REJECTED: 'Rejected',
      UPCOMING_DUE_DATE: 'Due date',
      OVERDUE_PAYMENT: 'Overdue',
      PAYMENT_RECEIVED: 'Payment',
      RISK_ALERT: 'Risk',
      RESERVATION_PENDING_ADMIN: 'Reservation (admin)',
      RESERVATION_CONFIRMED_CLIENT: 'Request received',
      RESERVATION_NEW_FOR_SELLER: 'New reservation',
      RESERVATION_APPROVED: 'Reservation approved',
      RESERVATION_REJECTED: 'Reservation rejected',
      RESERVATION_AUTO_REJECTED: 'Reservation not retained',
      RESERVATION_ACTION_REQUIRED: 'Action required',
      RESERVATION_UNDER_REVIEW: 'Under review',
      RESERVATION_CANCELLED_BY_CLIENT: 'Cancelled (client)',
      RESERVATION_CANCELLED_BY_ADMIN: 'Cancelled (platform)',
    };
    return labels[category] ?? category;
  }

  notificationRelativeTime(iso: string): string {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} m`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} h`;
    return `${Math.floor(h / 24)} d`;
  }

  private startDropdownPolling(): void {
    this.stopDropdownPolling();
    this.dropdownPollingId = setInterval(() => {
      if (!this.showNotifDropdown) return;
      this.loadNotifications();
      this.loadUnreadCount();
    }, 10000);
  }

  private stopDropdownPolling(): void {
    if (this.dropdownPollingId) {
      clearInterval(this.dropdownPollingId);
      this.dropdownPollingId = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.tb-user')) this.showUserDropdown = false;
    if (!target?.closest('.tb-notif-wrap')) this.closeNotifDropdown();
  }

  logout() {
    this.showUserDropdown = false;
    this.auth.logout();
  }

  goToMyProfile(): void {
    this.showUserDropdown = false;
    this.router.navigate(['/client/users/me']);
  }

  private getImageUrl(path?: string): string {
    if (!path || !path.trim()) return '';
    const raw = path.trim();
    if (/^https?:\/\//i.test(raw)) return raw;
    const backendBase = 'http://localhost:8082';
    if (raw.startsWith('/')) return `${backendBase}${raw}`;
    return `${backendBase}/${raw}`;
  }
}

