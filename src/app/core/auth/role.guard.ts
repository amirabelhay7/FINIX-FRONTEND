import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Protects routes by role. Use in route data: data: { roles: ['CLIENT', 'SELLER'] }.
 * Only users with one of the given roles can access; others are redirected to their role home or /.
 */
@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.auth.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/login']);
    }
    const allowedRoles: string[] = (route.data['roles'] as string[]) ?? [];
    const role = this.auth.getCurrentUser()?.role ?? '';
    if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
      return true;
    }
    return this.router.createUrlTree([this.auth.getRoleHome(role)]);
  }
}
