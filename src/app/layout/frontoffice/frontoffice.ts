import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notifications/notification.service';
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
    { label: 'My credits', icon: '💳', route: '/client/credits', badge: '3' },
    { label: 'Repayments', icon: '💸', route: '/client/repayments', badge: '1', badgeClass: 'warn' },
    { label: 'Vehicles', icon: '🚗', route: '/client/vehicles' },
    { label: 'Insurance', icon: '🛡️', route: '/client/insurance' },
    { label: 'Wallet', icon: '👛', route: '/client/wallet' },
    { label: 'My score', icon: '📊', route: '/client/score' },
    { label: 'Documents', icon: '📄', route: '/client/documents' }
  ];

  showUserDropdown = false;
  userName = '';
  userInitials = '';
  userEmail = '';
  userRole = '';
  unreadCount = 0;
  private wsSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private themeService: ThemeService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.initTheme(this.currentTheme);
    this.loadUser();
    this.refreshUnread();

    const payload = this.authService.getPayload();
    const token = this.authService.getToken();
    if (payload?.userId) {
      this.notificationService.connectWebSocket(payload.userId, token || undefined);
      this.wsSubscription = this.notificationService.realTimeNotification$.subscribe(() => {
        this.unreadCount += 1;
      });
    }
  }



  goToNotifications(): void {
    void this.router.navigate(['/notifications']).then(() => this.refreshUnread());
  }

  private refreshUnread(): void {
    this.notificationService.unreadCount().subscribe({
      next: (r) => {
        this.unreadCount = r?.count ?? 0;
      },
      error: () => {
        this.unreadCount = 0;
      },
    });
  }

  private loadUser(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.userName = user.name || 'User';
        this.userRole = (user.role || 'CLIENT');
        this.userEmail = user.email || '';
      }
    } catch { }
    const parts = this.userName.split(' ');
    this.userInitials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  toggleTheme(): void {
    this.currentTheme = this.themeService.toggleTheme(this.currentTheme);
  }

  toggleUserDropdown() {
    this.showUserDropdown = !this.showUserDropdown;
  }

  logout() {
    this.showUserDropdown = false;
    this.authService.logout();
  }
}
