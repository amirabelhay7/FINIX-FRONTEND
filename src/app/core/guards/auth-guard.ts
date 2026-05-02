import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  authService.syncRoleFromToken();
  if (authService.hasValidToken()) {
    return true;
  }

  router.navigate(['/login-client']);
  return false;
};

const roleToRoute: Record<string, string> = {
  admin: '/backoffice',
  agent: '/agent',
  insurer: '/insurer',
  client: '/client',
  seller: '/seller',
  ADMIN: '/backoffice',
  AGENT: '/agent',
  INSURER: '/insurer',
  CLIENT: '/client',
  SELLER: '/seller',
};


export function roleGuard(...allowedRoles: string[]): CanActivateFn {
  return (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (!authService.hasValidToken()) {
      router.navigate(['/login-client']);
      return false;
    }

    authService.syncRoleFromToken();
    const userRole = authService.getEffectiveRole();
    if (!userRole) {
      router.navigate(['/login-client']);
      return false;
    }

    const allowed = allowedRoles.map((r) => r.toLowerCase());
    if (allowed.includes(userRole.toLowerCase())) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
}
