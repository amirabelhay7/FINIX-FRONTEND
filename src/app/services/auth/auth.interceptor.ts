import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { readStoredAccessToken } from './auth-storage';
import { AuthService } from './auth.service';

/** Mettre a true uniquement pour diagnostiquer l'attachement du Bearer (puis remettre false). */
const FINIX_AUTH_DEBUG = false;

/**
 * Intercepteur d'authentification :
 * - Lit le JWT via readStoredAccessToken() (pas via une methode qui pourrait dependre du cycle DI).
 * - Attache Authorization: Bearer sur toutes les URLs sauf /api/auth/*.
 * - Sur 401 avec un token envoye : logout() pour resynchroniser l'UI.
 *
 * AuthService utilise HttpBackend (client HTTP sans intercepteurs) pour /api/auth :
 * pas de dependance circulaire HttpClient -> intercepteur -> AuthService -> HttpClient.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = readStoredAccessToken();
  const isAuthEndpoint = req.url.includes('/api/auth/');

  const authReq =
    token && !isAuthEndpoint
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  if (FINIX_AUTH_DEBUG && !isAuthEndpoint) {
    console.debug('[FINIX authInterceptor]', req.method, req.url, {
      hasStoredToken: !!token,
      authorizationHeader: authReq.headers.get('Authorization') ? 'Bearer ***' : '(none)',
    });
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      /**
       * 401 avec Bearer envoye :
       * - token local expire -> deconnexion immediate
       * - token local "semble" valide mais backend le rejette (signature invalide / token stale)
       *   -> forcer aussi la reconnexion pour regenerer un JWT propre.
       */
      const msg =
        (typeof err.error === 'string' ? err.error : (err.error as { message?: string } | null)?.message) || '';
      const backendRejectedJwt = /bearer token valide|authentification requise/i.test(msg);
      if (err.status === 401 && !isAuthEndpoint && token && (!auth.hasValidToken() || backendRejectedJwt)) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
