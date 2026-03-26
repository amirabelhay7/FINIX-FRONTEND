import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-agent',
  standalone: false,
  templateUrl: './agent.html',
  styleUrl: './agent.css',
  encapsulation: ViewEncapsulation.None,
})
export class AgentLayout implements OnInit, OnDestroy {
  currentTheme: 'light' | 'dark' = 'dark';
  selectedPage = 'dashboard';
  showUserMenu = false;

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.initTheme(this.currentTheme);

    // Drive UI from URL: /agent/:page
    this.route.paramMap.subscribe((pm) => {
      const page = pm.get('page');
      this.selectedPage = page || 'dashboard';
    });
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
  }

  toggleTheme(): void {
    this.currentTheme = this.themeService.toggleTheme(this.currentTheme);
  }

  switchPage(page: string): void {
    this.selectedPage = page;
    void this.router.navigate(['/agent', page]);
  }

  logout(): void {
    this.authService.logout();
  }

  get currentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  navItems = [
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

  navBySection(section: string) {
    return this.navItems.filter((i) => i.section === section);
  }

  tickerItems = [
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

  chartBars = [35, 42, 55, 48, 38, 52, 60, 45, 58, 72, 65, 85];
  chartMonths = [
    'Mar',
    'Avr',
    'Mai',
    'Jun',
    'Jul',
    'Aoû',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
    'Jan',
    'Fév',
  ];

  riskClients = [
    { initials: 'C', name: 'S. Hammami', detail: 'Auto · 24 000 TND', pct: 72, color: '#EF4444' },
    {
      initials: 'B',
      name: 'W. Ferchichi',
      detail: 'Immo. · 120 000 TND',
      pct: 48,
      color: '#F59E0B',
    },
    { initials: 'D', name: 'I. Oueslati', detail: 'Conso. · 8 500 TND', pct: 35, color: '#EF4444' },
  ];
}
