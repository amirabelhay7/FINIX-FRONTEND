import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.hasValidToken()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

const roleToRoute: Record<string, string> = {
  admin: '/admin',
  agent: '/agent',
  insurer: '/insurer',
  client: '/client',
  seller: '/seller',
  ADMIN: '/admin',
  AGENT: '/agent',
  INSURER: '/insurer',
  CLIENT: '/client',
  SELLER: '/seller',
};

function homeRouteForRole(role: string | null): string {
  if (!role) return '/client';
  const key = role.toLowerCase();
  return roleToRoute[key] ?? '/client';
}

/** Blocks login/register/forgot-password when already signed in. */
export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.hasValidToken()) {
    return true;
  }

  router.navigate([homeRouteForRole(authService.getRole())]);
  return false;
};

export function roleGuard(...allowedRoles: string[]): CanActivateFn {
  return (route, state) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    if (!authService.hasValidToken()) {
      router.navigate(['/login']);
      return false;
    }

    const userRole = authService.getRole();
    if (userRole && allowedRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase())) {
      return true;
    }

    router.navigate(['/unauthorized']);
    return false;
  };
}
