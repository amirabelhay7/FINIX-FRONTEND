import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/notification/notification.service';
import { NotificationApi } from '../../models';

@Component({
  selector: 'app-backoffice',
  standalone: false,
  templateUrl: './backoffice.html',
  styleUrl: './backoffice.css',
})
export class Backoffice implements OnInit {
  protected readonly isSidebarOpen = signal(false);
  protected showUserMenu = false;
  protected showNotificationPanel = false;
  protected currentUser: { id: number; email: string; firstName: string; lastName: string; role: string } | null = null;
  protected userAvatarUrl = 'https://ui-avatars.com/api/?name=Admin&background=135bec&color=fff';
  protected notifications: NotificationApi[] = [];
  protected unreadCount = 0;

  constructor(
    private auth: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.auth.validateSession().subscribe(() => {
      setTimeout(() => {
        const user = this.auth.getCurrentUser();
        if (user) {
          this.currentUser = user;
          const name = `${user.firstName}+${user.lastName}`.trim() || 'Admin';
          this.userAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=135bec&color=fff`;
          this.loadNotifications();
          this.notificationService.getUnreadCount().subscribe({ next: c => { this.unreadCount = c; }, error: () => { this.unreadCount = 0; } });
        }
        this.cdr.detectChanges();
      }, 0);
    });
  }

  loadNotifications(): void {
    this.notificationService.getMyNotifications().subscribe({
      next: list => { this.notifications = list ?? []; },
      error: () => {}
    });
  }

  toggleNotificationPanel(): void {
    this.showNotificationPanel = !this.showNotificationPanel;
    if (this.showNotificationPanel) this.loadNotifications();
  }

  markAsRead(n: NotificationApi): void {
    if (n.read) return;
    this.notificationService.markAsRead(n.id).subscribe({
      next: () => { n.read = true; this.unreadCount = Math.max(0, this.unreadCount - 1); },
      error: () => {}
    });
  }

  markAllNotificationsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => { this.notifications.forEach(n => n.read = true); this.unreadCount = 0; },
      error: () => {}
    });
  }

  formatNotificationTime(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + 'm ago';
    if (diffHours < 24) return diffHours + 'h ago';
    if (diffDays < 7) return diffDays + 'd ago';
    return d.toLocaleDateString();
  }

  logout(): void {
    this.auth.logout();
  }

  protected toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  protected readonly menuItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { label: 'Users & Identity', icon: 'group', path: '/admin/users' },
    { label: 'Wallet & Ledger', icon: 'account_balance_wallet', path: '/admin/wallet' },
    { label: 'Credit Center', icon: 'monetization_on', path: '/admin/credit' },
    { label: 'Insurance Desk', icon: 'verified_user', path: '/admin/insurance' },
    { label: 'Risk & Scoring', icon: 'analytics', path: '/admin/scoring', exact: true },
    { label: 'Document verification', icon: 'description', path: '/admin/scoring/documents' },
    { label: 'Collateral (Vehicles)', icon: 'directions_car', path: '/admin/vehicles' },
    { label: 'Repayments', icon: 'payments', path: '/admin/repayments' },
    { label: 'Marketing & Events', icon: 'campaign', path: '/admin/marketing' },
    { label: 'Treasury & Strategy', icon: 'query_stats', path: '/admin/steering' },
  ];

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebarOnMobile() {
    if (window.innerWidth < 1024) {
      this.isSidebarOpen.set(false);
    }
  }
}
