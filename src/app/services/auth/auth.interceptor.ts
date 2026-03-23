import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();

  // Ne pas ajouter le token sur les endpoints d'authentification
  const isAuthEndpoint = req.url.includes('/api/auth/');

  const authReq = (token && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Déconnexion auto seulement si 401 ET ce n'est pas un login/register
      if (err.status === 401 && !isAuthEndpoint) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
