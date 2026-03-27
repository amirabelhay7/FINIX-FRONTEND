import { Component, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notifications/notification.service';

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
  hasNotifications = false;

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
  }



  goToNotifications(): void {
    void this.router.navigate(['/notifications']).then(() => this.refreshUnread());
  }

  private refreshUnread(): void {
    this.notificationService.unreadCount().subscribe({
      next: (r) => {
        this.hasNotifications = (r?.count ?? 0) > 0;
      },
      error: () => {
        this.hasNotifications = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
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
    return ['/agent/stub', item.page];
  }

  routerLinkActiveOptions(item: AgentNavItem): { exact: boolean } {
    return { exact: item.page === 'dashboard' };
  }

  readonly navItems: AgentNavItem[] = [
    { page: 'dashboard', label: "Vue d'ensemble", section: 'PRINCIPAL', icon: 'grid' },
    { page: 'flux', label: 'Flux Capital', section: 'OPÉRATIONS', icon: 'trending-up', badge: '5' },
    {
      page: 'dossiers',
      label: 'Dossiers Crédit',
      section: 'OPÉRATIONS',
      icon: 'folder',
      badge: '12',
    },
    { page: 'remboursements', label: 'Remboursements', section: 'OPÉRATIONS', icon: 'dollar' },
    { page: 'clients', label: 'Clients', section: 'OPÉRATIONS', icon: 'users' },
    { page: 'vehicules', label: 'Véhicules', section: 'OPÉRATIONS', icon: 'truck' },
    { page: 'risque', label: 'Risque & Scoring', section: 'ANALYSE', icon: 'alert-triangle' },
    { page: 'rapports', label: 'Rapports', section: 'ANALYSE', icon: 'file-text' },
    { page: 'assurances', label: 'Assurances', section: 'ANALYSE', icon: 'shield' },
    {
      page: 'alertes',
      label: 'Alertes',
      section: 'SYSTÈME',
      icon: 'bell',
      badge: '3',
      badgeType: 'danger',
    },
    { page: 'parametres', label: 'Paramètres', section: 'SYSTÈME', icon: 'settings' },
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
      type: 'CRÉDIT',
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
      type: 'CRÉDIT',
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
