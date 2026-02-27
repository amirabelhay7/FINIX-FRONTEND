import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/notification/notification.service';
import { NotificationApi } from '../../models';

export interface NavItem {
  path: string;
  label: string;
}

@Component({
  selector: 'app-frontoffice',
  standalone: true,
  templateUrl: './frontoffice.html',
  styleUrl: './frontoffice.css',
  imports: [RouterOutlet, RouterLink, RouterLinkActive]
})
export class Frontoffice implements OnInit, OnDestroy {

  userRole: string = '';
  isLoggedIn: boolean = false;
  private routerSub?: Subscription;
  currentUser: { id: number; email: string; firstName: string; lastName: string; role: string } | null = null;
  showUserMenu: boolean = false;
  showMobileMenu: boolean = false;
  showNotificationPanel: boolean = false;
  showBreadcrumbs: boolean = false;
  currentModule: string = '';
  flashMessage: string = '';
  notifications: NotificationApi[] = [];
  unreadCount = 0;

  /** Nav items by role. Guest sees only Home. */
  private static readonly NAV_CLIENT: NavItem[] = [
    { path: '/', label: 'Home' },
    { path: '/credit', label: 'Credit' },
    { path: '/score', label: 'Scoring' },
    { path: '/wallet', label: 'Wallet' },
    { path: '/insurance', label: 'Insurance' },
    { path: '/repayment', label: 'Repayment' },
    { path: '/vehicles', label: 'Vehicles' },
  ];
  private static readonly NAV_AGENT: NavItem[] = [
    { path: '/', label: 'Home' },
    { path: '/agent/dashboard', label: 'Dashboard' },
    { path: '/agent/clients', label: 'Clients' },
    { path: '/agent/top-up', label: 'Top-up' },
    { path: '/agent/loan-verification', label: 'Loan verification' },
  ];
  private static readonly NAV_SELLER: NavItem[] = [
    { path: '/', label: 'Home' },
    { path: '/wallet', label: 'Wallet' },
    { path: '/seller/dashboard', label: 'Dashboard' },
    { path: '/seller/listings', label: 'Listings' },
    { path: '/seller/orders', label: 'Orders' },
  ];
  private static readonly NAV_INSURER: NavItem[] = [
    { path: '/', label: 'Home' },
    { path: '/insurer', label: 'Dashboard' },
  ];
  /** Admin has no front-office wallet/score; only Home and link to backoffice. */
  private static readonly NAV_ADMIN: NavItem[] = [
    { path: '/', label: 'Home' },
    { path: '/admin/dashboard', label: 'Admin dashboard' },
  ];
  private static readonly NAV_GUEST: NavItem[] = [
    { path: '/', label: 'Home' },
  ];

  get navItems(): NavItem[] {
    if (!this.isLoggedIn) return Frontoffice.NAV_GUEST;
    switch (this.userRole) {
      case 'CLIENT': return Frontoffice.NAV_CLIENT;
      case 'AGENT': return Frontoffice.NAV_AGENT;
      case 'SELLER': return Frontoffice.NAV_SELLER;
      case 'INSURER': return Frontoffice.NAV_INSURER;
      case 'ADMIN': return Frontoffice.NAV_ADMIN;
      default: return Frontoffice.NAV_GUEST;
    }
  }

  get userAvatarUrl(): string {
    const u = this.currentUser;
    const name = u ? `${u.firstName}+${u.lastName}` : 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=135bec&color=fff`;
  }

  /** Display role label (e.g. Client, Agent). */
  get roleLabel(): string {
    if (!this.userRole) return '';
    return this.userRole.charAt(0) + this.userRole.slice(1).toLowerCase();
  }

  constructor(
    private router: Router,
    private auth: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.checkUserAuthentication();
    this.auth.validateSession().subscribe(() => this.checkUserAuthentication());
    this.routerSub = this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd)
    ).subscribe(() => this.checkUserAuthentication());
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
  }

  checkUserAuthentication() {
    if (this.auth.isAuthenticated()) {
      this.isLoggedIn = true;
      this.currentUser = this.auth.getCurrentUser();
      this.userRole = this.currentUser?.role || 'CLIENT';
      this.notificationService.getUnreadCount().subscribe({
        next: c => {
          setTimeout(() => {
            this.unreadCount = c;
            this.cdr.detectChanges();
          }, 0);
        },
        error: () => {
          setTimeout(() => {
            this.unreadCount = 0;
            this.cdr.detectChanges();
          }, 0);
        }
      });
    } else {
      this.isLoggedIn = false;
      this.currentUser = null;
      this.userRole = '';
      this.unreadCount = 0;
    }
  }

  loadNotifications() {
    this.notificationService.getMyNotifications().subscribe({
      next: list => { this.notifications = list ?? []; },
      error: () => {}
    });
  }

  toggleNotificationPanel() {
    this.showNotificationPanel = !this.showNotificationPanel;
    if (this.showNotificationPanel) this.loadNotifications();
  }

  markNotificationAsRead(n: NotificationApi) {
    if (n.read) return;
    this.notificationService.markAsRead(n.id).subscribe({
      next: () => { n.read = true; this.unreadCount = Math.max(0, this.unreadCount - 1); },
      error: () => {}
    });
  }

  markAllNotificationsRead() {
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

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  logout() {
    this.auth.logout();
    this.isLoggedIn = false;
    this.currentUser = null;
    this.userRole = '';
    this.showUserMenu = false;
  }

  // Method to set flash messages
  setFlashMessage(message: string) {
    this.flashMessage = message;
    setTimeout(() => {
      this.flashMessage = '';
    }, 5000);
  }

  // Method to set current module for breadcrumbs
  setCurrentModule(module: string) {
    this.currentModule = module;
    this.showBreadcrumbs = true;
  }
}
