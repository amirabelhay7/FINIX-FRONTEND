import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

const FINIX_TOKEN = 'finix_token';
const FINIX_ROLE = 'finix_role';
const FINIX_EMAIL = 'finix_email';

/** Admin role only when email ends with @admin.com (e.g. test@admin.com) */
const ADMIN_EMAIL_SUFFIX = /@admin\.com$/i;

export type AuthRole = 'ADMIN' | 'USER';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _isAuthenticated$ = new BehaviorSubject<boolean>(this.hasToken());
  readonly isAuthenticated$ = this._isAuthenticated$.asObservable();

  constructor(private router: Router) {}

  hasToken(): boolean {
    return !!localStorage.getItem(FINIX_TOKEN);
  }

  getToken(): string | null {
    return localStorage.getItem(FINIX_TOKEN);
  }

  getStoredEmail(): string | null {
    return localStorage.getItem(FINIX_EMAIL);
  }

  get currentRole(): AuthRole | null {
    const r = localStorage.getItem(FINIX_ROLE);
    return r === 'ADMIN' || r === 'USER' ? r : null;
  }

  get currentUser(): AuthUser | null {
    const email = this.getStoredEmail();
    const role = this.currentRole;
    if (!email || !role) return null;
    return {
      id: 1,
      name: role === 'ADMIN' ? 'Admin User' : 'User',
      email,
      role,
    };
  }

  /** After login: ADMIN => /admin/dashboard, else /home. Optional returnUrl for same-role. */
  getRedirectAfterLogin(returnUrl: string | null): string {
    const role = this.currentRole;
    if (returnUrl && returnUrl !== '/auth/login' && returnUrl.startsWith('/') && !returnUrl.startsWith('/auth')) {
      if (returnUrl.startsWith('/admin') && role === 'ADMIN') return returnUrl;
      if (!returnUrl.startsWith('/admin') && role === 'USER') return returnUrl;
    }
    return role === 'ADMIN' ? '/admin/dashboard' : '/home';
  }

  /** True only when email ends with @admin.com (e.g. test@admin.com) */
  private isAdminEmail(email: string): boolean {
    return ADMIN_EMAIL_SUFFIX.test(email.trim());
  }

  login(email: string, _password: string, _rememberMe: boolean): Observable<boolean> {
    return of(true).pipe(
      delay(400),
      tap(() => {
        const role: AuthRole = this.isAdminEmail(email) ? 'ADMIN' : 'USER';
        const token = 'finix-jwt-mock-' + Date.now();
        localStorage.setItem(FINIX_TOKEN, token);
        localStorage.setItem(FINIX_ROLE, role);
        localStorage.setItem(FINIX_EMAIL, email.trim());
        this._isAuthenticated$.next(true);
      }),
    );
  }

  register(name: string, email: string, password: string): Observable<boolean> {
    return this.login(email, password, true);
  }

  requestPasswordReset(email: string): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  resetPassword(token: string, newPassword: string): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  logout(): void {
    localStorage.removeItem(FINIX_TOKEN);
    localStorage.removeItem(FINIX_ROLE);
    localStorage.removeItem(FINIX_EMAIL);
    this._isAuthenticated$.next(false);
    this.router.navigate(['/auth/login']);
  }

  isAuthenticated(): boolean {
    return this.hasToken();
  }
}
