import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

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
  currentTime = '';

  private timeTimer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private renderer: Renderer2,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('finix_theme') as 'light' | 'dark' | null;
    this.currentTheme = saved || 'dark';
    this.applyTheme();
    this.refreshCurrentTime();
    this.timeTimer = setInterval(() => this.refreshCurrentTime(), 1000);
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
    if (this.timeTimer) {
      clearInterval(this.timeTimer);
      this.timeTimer = null;
    }
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('finix_theme', this.currentTheme);
    this.applyTheme();
  }

  switchPage(page: string): void {
    this.selectedPage = page;
  }

  logout(): void {
    localStorage.removeItem('finix_access_token');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  private applyTheme(): void {
    this.renderer.setAttribute(document.documentElement, 'data-theme', this.currentTheme);
  }

  private refreshCurrentTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('fr-FR', {
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
