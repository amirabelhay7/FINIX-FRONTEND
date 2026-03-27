import { Component, OnDestroy, OnInit, Renderer2, ViewEncapsulation } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../services/auth/auth.service';
import { SellerShellService } from './seller-shell.service';

@Component({
  selector: 'app-seller',
  standalone: false,
  templateUrl: './seller.html',
  styleUrl: './seller.css',
  encapsulation: ViewEncapsulation.None,
})
export class SellerLayout implements OnInit, OnDestroy {
  /** False on routes other than dashboard — subnav is only on the dashboard (matches emna). */
  showSellerSubnav = true;

  currentTheme: 'light' | 'dark' = 'dark';
  showUserDropdown = false;
  userName = '';
  userInitials = '';
  userEmail = '';
  showAddModal = false;

  newVehicle = {
    brand: '',
    model: '',
    year: 2024,
    price: 0,
    km: 0,
    fuel: 'Essence',
    transmission: 'Manuelle',
    color: '',
    description: '',
  };

  private addModalSub?: Subscription;
  private navSub?: Subscription;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private themeService: ThemeService,
    private authService: AuthService,
    private sellerShell: SellerShellService,
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.initTheme(this.currentTheme);
    this.loadUser();
    this.syncSellerSubnav();
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncSellerSubnav());
    this.addModalSub = this.sellerShell.openAddVehicle$.subscribe(() => this.openAddModal());
  }

  private syncSellerSubnav(): void {
    this.showSellerSubnav = this.router.url.includes('/seller/dashboard');
  }

  private loadUser(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.userName = user.name || 'Vendeur';
        this.userEmail = user.email || '';
      }
    } catch {
      /* ignore */
    }
    if (!this.userName) this.userName = 'Vendeur';
    const parts = this.userName.split(' ');
    this.userInitials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
    this.addModalSub?.unsubscribe();
    this.navSub?.unsubscribe();
  }

  toggleTheme(): void {
    this.currentTheme = this.themeService.toggleTheme(this.currentTheme);
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  openAddModal(): void {
    this.showAddModal = true;
    this.newVehicle = {
      brand: '',
      model: '',
      year: 2024,
      price: 0,
      km: 0,
      fuel: 'Essence',
      transmission: 'Manuelle',
      color: '',
      description: '',
    };
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  logout(): void {
    this.showUserDropdown = false;
    this.authService.logout();
  }
}
