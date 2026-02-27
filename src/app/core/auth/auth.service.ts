import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LoginRequest, LoginResponse, RegisterRequest } from '../../models';

const API = 'http://localhost:8081/api';
const TOKEN_KEY = 'finix_token';
const USER_KEY = 'finix_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * Validate token on app load. If we have a token, call one protected endpoint.
   * On 401 the interceptor will logout and redirect; on 200 we keep the user logged in.
   */
  validateSession(): Observable<void> {
    if (!this.getToken()) return of(undefined);
    // Use a lightweight endpoint that is accessible to all authenticated roles
    // (CLIENT, ADMIN, AGENT, etc.) just to validate the token.
    return this.http.get<unknown>(`${API}/notifications/me/unread-count`, { observe: 'response' }).pipe(
      map(() => undefined),
      catchError(() => of(undefined))
    );
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/login`, request).pipe(
      tap((res) => {
        this.storeSession(res);
      })
    );
  }

  register(request: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API}/auth/register`, request).pipe(
      tap((res) => {
        this.storeSession(res);
      })
    );
  }

  private storeSession(res: LoginResponse): void {
    const token = res?.token ?? (res as { accessToken?: string })?.accessToken;
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      id: res.id,
      email: res.email,
      firstName: res.firstName,
      lastName: res.lastName,
      role: res.role
    }));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getCurrentUser(): { id: number; email: string; firstName: string; lastName: string; role: string } | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /** Path to redirect to after login or when accessing a route not allowed for this role. */
  getRoleHome(role: string): string {
    switch (role) {
      case 'CLIENT': return '/wallet';
      case 'AGENT': return '/agent';
      case 'SELLER': return '/seller';
      case 'INSURER': return '/insurer';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/';
    }
  }

  redirectByRole(role: string): void {
    this.router.navigate([this.getRoleHome(role)]);
  }
}
