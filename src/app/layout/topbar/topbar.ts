import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService, FinixTheme } from '../../core/services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-topbar',
  standalone: false,
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  @Output() menuToggle = new EventEmitter<void>();

  notificationsOpen = false;
  userMenuOpen = false;

  readonly theme$: Observable<FinixTheme>;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
  ) {
    this.theme$ = this.themeService.theme$;
  }

  get userName(): string {
    return this.authService.currentUser?.name ?? 'Alex Johnson';
  }

  get userRole(): string {
    const role = this.authService.currentRole;
    return role === 'ADMIN' ? 'Admin' : 'User';
  }

  toggleMenu(): void {
    this.menuToggle.emit();
  }

  toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      this.userMenuOpen = false;
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.notificationsOpen = false;
    }
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
  }
}

