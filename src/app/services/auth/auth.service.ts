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

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: number;
  cin?: string;
  address?: string;
  city?: string;
  role: string;
  localisation?: string;
  agenceCode?: number;
  region?: number;
  commercialRegister?: string;
  insurerName?: string;
  insurerEmail?: string;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
  role: string;
  name: string;
  email: string;
  userId: number;
}

export interface JwtPayload {
  sub: string;
  role: string;
  name: string;
  userId: number;
  iat: number;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = 'http://localhost:8081/api/auth';
  private readonly TOKEN_KEY = 'finix_access_token';
  private readonly ROLE_KEY = 'finix_role';
  private readonly USER_KEY = 'currentUser';

  private _isAuth$ = new BehaviorSubject<boolean>(this.hasValidToken());
  readonly isAuth$ = this._isAuth$.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  /* ── LOGIN ── */
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, payload).pipe(
      tap((res) => this.saveSession(res)),
      catchError((err) => this.handleError(err)),
    );
  }

  /* ── REGISTER ── */
  register(payload: RegisterPayload): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, payload).pipe(
      tap((res) => {
        if (res.access_token) {
          this.saveSession(res);
        }
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  /* ── VERIFY EMAIL ── */
  verifyEmail(email: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/verify-email`, { email, code }).pipe(
      tap((res) => this.saveSession(res)),
      catchError((err) => this.handleError(err)),
    );
  }

  /* ── RESEND CODE ── */
  resendCode(email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/resend-code`, { email }).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  /* ── FORGOT PASSWORD ── */
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/forgot-password`, { email }).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  /* ── RESET PASSWORD ── */
  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/reset-password`, { email, code, newPassword }).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  /* ── LOGOUT ── */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.USER_KEY);
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
    return this.getPayload()?.name ?? 'Utilisateur';
  }

  getUserInitials(): string {
    return this.getUserName()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64)) as JwtPayload;
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  /* ── PRIVATE ── */
  private saveSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    localStorage.setItem(this.ROLE_KEY, res.role);
    localStorage.setItem(this.USER_KEY, JSON.stringify({
      name: res.name,
      email: res.email,
      role: res.role.toUpperCase(),
      userId: res.userId,
    }));
    this._isAuth$.next(true);
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let message = 'Erreur inconnue';
    if (err.status === 401) message = 'Identifiants incorrects.';
    else if (err.status === 400) message = err.error?.message || 'Requête invalide.';
    else if (err.status === 403) message = 'Accès refusé.';
    else if (err.status === 0) message = 'Serveur injoignable.';
    return throwError(() => new Error(message));
  }
}
