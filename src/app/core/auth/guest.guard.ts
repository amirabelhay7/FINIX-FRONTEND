import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Use on auth routes (login, register). If user is already logged in, redirect to their role home.
 */
@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean | UrlTree {
    if (!this.auth.isAuthenticated()) {
      return true;
    }
    const user = this.auth.getCurrentUser();
    switch (user?.role) {
      case 'CLIENT': return this.router.createUrlTree(['/wallet']);
      case 'AGENT': return this.router.createUrlTree(['/agent']);
      case 'SELLER': return this.router.createUrlTree(['/seller']);
      case 'INSURER': return this.router.createUrlTree(['/insurer']);
      case 'ADMIN': return this.router.createUrlTree(['/admin/dashboard']);
      default: return this.router.createUrlTree(['/wallet']);
    }
  }
}
