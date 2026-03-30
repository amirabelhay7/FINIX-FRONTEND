import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { ClientCreditsSearchService } from '../../services/client-credits-search.service';
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
    { label: 'Mes Crédits', icon: '💳', route: '/client/credits', badge: '3' },
    { label: 'Remboursements', icon: '💸', route: '/client/repayments', badge: '1', badgeClass: 'warn' },
    { label: 'Véhicules', icon: '🚗', route: '/client/vehicles' },
    { label: 'Evenements', icon: '📅', route: '/client/events' },
    { label: 'Assurance', icon: '🛡️', route: '/client/insurance' },
    { label: 'Wallet', icon: '👛', route: '/client/wallet' },
    { label: 'Mon Score', icon: '📊', route: '/client/score' },
    { label: 'Documents', icon: '📄', route: '/client/documents' }
  ];

  showUserDropdown = false;
  userName = '';
  userInitials = '';
  userEmail = '';
  userRole = '';

  /** Valeur affichée dans la barre de recherche (filtrage des crédits par statut). */
  creditsSearchQuery = '';

  private creditsSearchSub?: Subscription;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private clientCreditsSearch: ClientCreditsSearchService,
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('finix_theme') as 'light' | 'dark' | null;
    this.currentTheme = saved || 'dark';
    this.applyTheme();
    this.loadUser();
    this.creditsSearchQuery = this.clientCreditsSearch.getSearchQuery();
    this.creditsSearchSub = this.clientCreditsSearch.searchChanges.subscribe((q: string) => {
      this.creditsSearchQuery = q;
    });
  }

  private loadUser(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.userName = user.name || 'Utilisateur';
        this.userRole = (user.role || 'CLIENT');
        this.userEmail = user.email || '';
      }
    } catch { }
    const parts = this.userName.split(' ');
    this.userInitials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  ngOnDestroy(): void {
    this.creditsSearchSub?.unsubscribe();
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
  }

  onCreditsSearchInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.creditsSearchQuery = v;
    this.clientCreditsSearch.setSearchQuery(v);
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

  logout() {
    localStorage.removeItem('finix_access_token');
    localStorage.removeItem('currentUser');
    this.showUserDropdown = false;
    this.router.navigate(['/login-client']);
  }
}
