import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

/* ── Types ── */
export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'insurer';
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API_URL   = 'http://localhost:8080/api/auth'; // ← modifier selon votre backend
  private readonly TOKEN_KEY = 'finix_access_token';
  private readonly ROLE_KEY  = 'finix_role';

  private _isAuth$ = new BehaviorSubject<boolean>(this.hasValidToken());
  readonly isAuth$ = this._isAuth$.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /* ── LOGIN (appel réel) ── */
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, payload)
      .pipe(
        tap(res => this.saveSession(res)),
        catchError(this.handleError)
      );
  }

  /* ── LOGOUT ── */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this._isAuth$.next(false);
    this.router.navigate(['/login']);
  }

  /* ── GETTERS ── */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(base64)) as JwtPayload;
    } catch {
      return null;
    }
  }

  getUserName(): string {
    return this.getPayload()?.name ?? 'Administrateur';
  }

  getUserInitials(): string {
    return this.getUserName()
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    try {
      const base64  = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64)) as JwtPayload;
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  /* ── PRIVÉ ── */
  private saveSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    const payload = this.getPayload();
    if (payload?.role) {
      localStorage.setItem(this.ROLE_KEY, payload.role);
    }
    this._isAuth$.next(true);
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let message = 'Erreur inconnue';
    if (err.status === 401) message = 'Identifiants incorrects.';
    else if (err.status === 403) message = 'Accès refusé.';
    else if (err.status === 0)   message = 'Serveur injoignable.';
    return throwError(() => new Error(message));
  }
}
