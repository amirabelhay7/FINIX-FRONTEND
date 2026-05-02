import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

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
    { label: 'Documents', icon: '📄', route: '/client/documents' }
  ];

  showUserDropdown = false;
  userName = '';
  userInitials = '';
  userEmail = '';
  userRole = '';
  userImageUrl = '';

  private readonly userUpdatedListener = () => this.loadUser();

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('finix_theme') as 'light' | 'dark' | null;
    this.currentTheme = saved || 'dark';
    this.applyTheme();
    this.loadUser();
    window.addEventListener('finix-user-updated', this.userUpdatedListener);
  }

  private loadUser(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.userName = user.name || 'Utilisateur';
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
