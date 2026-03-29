import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.getToken();

  // Debug: Log authentication state
  console.log('Auth interceptor - Request URL:', req.url);
  console.log('Auth interceptor - Token exists:', !!token);
  console.log('Auth interceptor - User role:', auth.getRole());

  // Do not attach token to auth endpoints
  const isAuthEndpoint = req.url.includes('/api/auth/');

  const authReq = (token && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // Debug: Log final request headers
  if (token && !isAuthEndpoint) {
    console.log('Auth interceptor - Adding Bearer token to request');
  }

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Debug: Log error details
      console.log('Auth interceptor - Error:', err.status, err.url);
      
      // Auto logout only on 401, and not for login/register calls
      if (err.status === 401 && !isAuthEndpoint) {
        console.log('Auth interceptor - Auto logout due to 401');
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
