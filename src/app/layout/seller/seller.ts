import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-seller',
  standalone: false,
  templateUrl: './seller.html',
  styleUrl: './seller.css',
  encapsulation: ViewEncapsulation.None,
})
export class SellerLayout implements OnInit, OnDestroy {
  currentTheme: 'light' | 'dark' = 'dark';
  showUserDropdown = false;
  userName = '';
  userInitials = '';
  userEmail = '';
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
        this.userName = user.name || 'Vendeur';
        this.userEmail = user.email || '';
        this.userImageUrl = this.getImageUrl(user.profileImageUrl || '');
      }
    } catch {
      /* ignore */
    }
    if (!this.userName) this.userName = 'Vendeur';
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

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  logout(): void {
    this.showUserDropdown = false;
    this.auth.logout();
  }

  goToMyProfile(): void {
    this.showUserDropdown = false;
    this.router.navigate(['/seller/profile']);
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
