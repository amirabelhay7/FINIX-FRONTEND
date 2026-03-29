import { Component, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notifications/notification.service';
import { Subscription } from 'rxjs';

export interface AgentNavItem {
  page: string;
  label: string;
  section: string;
  icon: string;
  badge?: string;
  badgeType?: 'danger';
}

@Component({
  selector: 'app-agent-shell',
  standalone: false,
  templateUrl: './agent-shell.html',
  styleUrl: './agent-shell.css',
  encapsulation: ViewEncapsulation.None,
})
export class AgentShell implements OnInit, OnDestroy {
  currentTheme: 'light' | 'dark' = 'dark';
  showUserMenu = false;
  unreadCount = 0;
  private wsSubscription: Subscription | null = null;

  constructor(
    private renderer: Renderer2,
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.initTheme(this.currentTheme);
    this.refreshUnread();

    const payload = this.authService.getPayload();
    const token = this.authService.getToken();
    if (payload?.userId) {
      this.notificationService.connectWebSocket(payload.userId, token || undefined);
      this.wsSubscription = this.notificationService.realTimeNotification$.subscribe(() => {
        this.unreadCount += 1;
        this.updateNavBadge();
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
        this.updateNavBadge();
      },
      error: () => {
        this.unreadCount = 0;
        this.updateNavBadge();
      },
    });
  }

  private updateNavBadge(): void {
    const alertsItem = this.navItems.find(i => i.page === 'alertes');
    if (alertsItem) {
      alertsItem.badge = this.unreadCount > 0 ? (this.unreadCount > 99 ? '99+' : this.unreadCount.toString()) : undefined;
    }
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

  logout(): void {
    this.authService.logout();
  }

  /** Matches `origin/emna` layout/agent/agent.ts nav; real routes + stub for the rest. */
  navLinkFor(item: AgentNavItem): string | string[] {
    if (item.page === 'dashboard') return '/agent/dashboard';
    if (item.page === 'clients') return '/agent/clients';
    if (item.page === 'alertes') return '/notifications';
    if (item.page === 'top-up') return '/agent/top-up';
    if (item.page === 'top-up-enhanced') return '/agent/top-up-enhanced';
    return ['/agent/stub', item.page];
  }

  routerLinkActiveOptions(item: AgentNavItem): { exact: boolean } {
    return { exact: item.page === 'dashboard' };
  }

  readonly navItems: AgentNavItem[] = [
    { page: 'dashboard', label: "Overview", section: 'MAIN', icon: 'grid' },
    { page: 'flux', label: 'Capital Flow', section: 'OPERATIONS', icon: 'trending-up', badge: '5' },
    {
      page: 'dossiers',
      label: 'Credit Files',
      section: 'OPERATIONS',
      icon: 'folder',
      badge: '12',
    },
    { page: 'remboursements', label: 'Repayments', section: 'OPERATIONS', icon: 'dollar' },
    { page: 'top-up', label: 'Top-Up', section: 'OPERATIONS', icon: 'trending-up' },
    { page: 'top-up-enhanced', label: 'Enhanced Top-Up', section: 'OPERATIONS', icon: 'plus-circle' },
    { page: 'clients', label: 'Clients', section: 'OPERATIONS', icon: 'users' },
    { page: 'vehicules', label: 'Vehicles', section: 'OPERATIONS', icon: 'truck' },
    { page: 'risque', label: 'Risk & Scoring', section: 'ANALYSIS', icon: 'alert-triangle' },
    { page: 'rapports', label: 'Reports', section: 'ANALYSIS', icon: 'file-text' },
    { page: 'assurances', label: 'Insurance', section: 'ANALYSIS', icon: 'shield' },
    {
      page: 'alertes',
      label: 'Alerts',
      section: 'SYSTEM',
      icon: 'bell',
      badgeType: 'danger',
    },
    { page: 'parametres', label: 'Settings', section: 'SYSTEM', icon: 'settings' },
  ];

  get navSections(): string[] {
    const seen = new Set<string>();
    return this.navItems
      .filter((i) => {
        if (seen.has(i.section)) return false;
        seen.add(i.section);
        return true;
      })
      .map((i) => i.section);
  }

  navBySection(section: string): AgentNavItem[] {
    return this.navItems.filter((i) => i.section === section);
  }

  readonly tickerItems = [
    {
      ref: '#CR-2025-844',
      client: 'S. Bouaziz',
      amount: '-32 000 TND',
      type: 'CREDIT',
      typeClass: 'credit',
    },
    {
      ref: '#VIR-0392',
      client: 'R. Khelifi',
      amount: '+750 TND',
      type: 'REMB.',
      typeClass: 'remb',
    },
    {
      ref: '#CR-2025-841',
      client: 'K. Mansour',
      amount: '+4 800 TND',
      type: 'REMB.',
      typeClass: 'remb',
    },
    {
      ref: '#CR-2025-842',
      client: 'L. Chaari',
      amount: '-85 000 TND',
      type: 'CREDIT',
      typeClass: 'credit',
    },
  ];

  get currentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
