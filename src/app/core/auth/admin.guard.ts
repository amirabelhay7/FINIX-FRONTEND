import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Protects backoffice routes (/admin/*). Only ADMIN can access; others are redirected to their role home.
 */
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.auth.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/login']);
    }
    const role = this.auth.getCurrentUser()?.role ?? '';
    if (role === 'ADMIN') {
      return true;
    }
    return this.router.createUrlTree([this.auth.getRoleHome(role)]);
  }
}
