import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  clearFinixSessionStorage,
  FINIX_ACCESS_TOKEN_KEY,
  FINIX_ROLE_KEY,
  FINIX_USER_KEY,
  readStoredAccessToken,
} from './auth-storage';
import { apiUrl } from '../../core/config/api-url';

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
  access_token?: string;
  accessToken?: string;
  token?: string;
  jwt?: string;
  expires_in?: number;
  expiresIn?: number;
  role: string;
  name: string;
  email: string;
  userId: number;
}

export interface NeedsRoleSelectionResponse {
  needsRoleSelection: boolean;
  email: string;
  name: string;
  picture?: string;
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
  private readonly API_URL = apiUrl('/api/auth');

  private readonly http: HttpClient;

  private _isAuth$ = new BehaviorSubject<boolean>(this.hasValidToken());
  readonly isAuth$ = this._isAuth$.asObservable();

  constructor(
    httpBackend: HttpBackend,
    private router: Router,
  ) {
    /**
     * HttpClient sans intercepteurs (HttpBackend) pour /api/auth/* :
     * evite la dependance circulaire AuthService -> HttpClient -> intercepteur -> AuthService,
     * qui peut empecher l'ajout du Bearer sur les autres services (reservations, etc.).
     */
    this.http = new HttpClient(httpBackend);
    /** Aligne le role stocke sur le JWT (evite finix_role desynchronise). */
    this.syncRoleFromToken();
  }

  /** Met a jour localStorage `finix_role` a partir du claim `role` du JWT. */
  syncRoleFromToken(): void {
    if (!this.hasValidToken()) return;
    const p = this.getPayload() as Record<string, unknown> | null;
    const r = p?.['role'];
    if (typeof r === 'string' && r.length) {
      localStorage.setItem(FINIX_ROLE_KEY, r.toLowerCase().trim());
    }
  }

  /* ── LOGIN ── */
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, payload).pipe(
      tap((res) => this.saveSession(res)),
      catchError((err) => this.handleError(err)),
    );
  }

  loginWithGoogle(credential: string, role?: string, options?: { allowSelfRegistration?: boolean }): Observable<AuthResponse | NeedsRoleSelectionResponse> {
    const payload = {
      idToken: credential,
      role,
      allowSelfRegistration: options?.allowSelfRegistration ?? true,
    };
    return this.http.post<AuthResponse | NeedsRoleSelectionResponse>(`${this.API_URL}/google`, payload).pipe(
      tap((res) => {
        if ('access_token' in res || 'accessToken' in res || 'token' in res || 'jwt' in res) {
          this.saveSession(res as AuthResponse);
        }
      }),
      catchError((err) => this.handleError(err)),
    );
  }


  /* ── REGISTER ── */
  register(payload: RegisterPayload): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/register`, payload).pipe(
      tap((res) => {
        if (res?.access_token || res?.accessToken || res?.token || res?.jwt) {
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

  /**
   * Déconnexion complète (token + rôle + currentUser).
   * Redirection : espaces pro (admin, agent, insurer) → /login ; client & vendeur → /login-client.
   */
  logout(): void {
    this.syncRoleFromToken();
    let role = this.getEffectiveRole();
    if (!role) {
      role = (localStorage.getItem(FINIX_ROLE_KEY) || '').toLowerCase().trim();
    }
    clearFinixSessionStorage();
    this._isAuth$.next(false);
    const proRoles = ['admin', 'agent', 'insurer'];
    if (proRoles.includes(role)) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/login-client']);
    }
  }

  /* ── GETTERS ── */
  getToken(): string | null {
    return readStoredAccessToken();
  }

  getRole(): string | null {
    return localStorage.getItem(FINIX_ROLE_KEY);
  }

  /**
   * Role effectif uniquement si le JWT est encore valide (exp non depassee).
   * Evite isClient() === true avec finix_role=client mais token absent / expire
   * (ce qui declenchait des GET /api/reservations/my en 401).
   * A utiliser aussi pour les route guards (aligne UI et backend sur le JWT).
   */
  private effectiveRole(): string {
    if (!this.hasValidToken()) return '';
    const fromJwt = this.getPayload()?.role;
    if (typeof fromJwt === 'string' && fromJwt.length) {
      return fromJwt.toLowerCase().trim();
    }
    return (this.getRole() || '').toLowerCase().trim();
  }

  /** Rôle issu du JWT (ou repli localStorage si claim absent), apres validation exp. */
  getEffectiveRole(): string {
    return this.effectiveRole();
  }

  isAdmin(): boolean {
    return this.effectiveRole() === 'admin';
  }

  isSeller(): boolean {
    return this.effectiveRole() === 'seller';
  }

  isClient(): boolean {
    return this.effectiveRole() === 'client';
  }

  getUserId(): number | null {
    return this.getPayload()?.userId ?? null;
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
    const token = readStoredAccessToken();
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
    const token = (res.access_token || res.accessToken || res.token || res.jwt || '').trim();
    if (!token) {
      throw new Error('Token manquant dans la reponse de connexion.');
    }
    const role = (res.role || '').toLowerCase().trim();
    const name = res.name || 'Utilisateur';
    const email = res.email || '';
    const userId = typeof res.userId === 'number' ? res.userId : null;

    // Reset stale keys first to avoid mixing old/invalid tokens.
    clearFinixSessionStorage();

    localStorage.setItem(FINIX_ACCESS_TOKEN_KEY, token);
    sessionStorage.setItem(FINIX_ACCESS_TOKEN_KEY, token);
     // Une seule clé pour le token
    localStorage.setItem('access_token', token);
    sessionStorage.setItem('access_token', token);

    if (role) {
      localStorage.setItem(FINIX_ROLE_KEY, role);
      sessionStorage.setItem(FINIX_ROLE_KEY, role);
    }
    const userJson = JSON.stringify({
      name,
      email,
      role: role ? role.toUpperCase() : '',
      userId,
    });
    localStorage.setItem(FINIX_USER_KEY, userJson);
    sessionStorage.setItem(FINIX_USER_KEY, userJson);
    this.syncRoleFromToken();
    this._isAuth$.next(true);
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let message = 'Erreur inconnue';
    if (err.status === 401) message = 'Identifiants incorrects.';
    else if (err.status === 400) message = err.error?.message || 'Requête invalide.';
    else if (err.status === 403) message = 'Accès refusé.';
    else if (err.status === 500) message = err.error?.message || 'Erreur serveur. Veuillez réessayer.';
    else if (err.status === 0)
      message =
        'Impossible de joindre le backend. Démarrez Spring Boot sur le port 8082 (MySQL démarré). En dev, utilisez `ng serve` avec le proxy (proxy.conf.json).';
    return throwError(() => new Error(message));
  }
}
