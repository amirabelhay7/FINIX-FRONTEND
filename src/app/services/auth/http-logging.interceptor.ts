import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, tap } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Enhanced HTTP Logging Interceptor
 * Logs all HTTP requests and responses for debugging
 * Shows request method, URL, status code, and response time
 */
export const httpLoggingInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // Don't add token to auth endpoints
  const isAuthEndpoint = req.url.includes('/api/auth/');

  const authReq = (token && !isAuthEndpoint)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // Log outgoing request
  const requestTime = performance.now();
  const method = req.method;
  const url = req.url;

  console.log(
    `%c[HTTP] ${method} ${url}`,
    'color: #0066cc; font-weight: bold;'
  );

  return next(authReq).pipe(
    tap(event => {
      // Log response
      const responseTime = (performance.now() - requestTime).toFixed(0);
      // Only log on HttpResponse events
      if ('status' in event && 'body' in event) {
        console.log(
          `%c[HTTP] ${method} ${url} - ✅ ${event.status} (${responseTime}ms)`,
          'color: #00aa00; font-weight: bold;'
        );
        // Keep logs lightweight; large payload logs can freeze UI.
      }
    }),
    catchError((err: HttpErrorResponse) => {
      // Log error
      const responseTime = (performance.now() - requestTime).toFixed(0);
      const errorStatus = err.status || 'Unknown';
      
      console.log(
        `%c[HTTP] ${method} ${url} - ❌ ${errorStatus} (${responseTime}ms)`,
        'color: #ff0000; font-weight: bold;'
      );
      
      console.error('🚨 Error details:', {
        status: err.status,
        statusText: err.statusText,
        message: err.message,
        body: err.error,
      });

      // Auto logout on 401
      if (err.status === 401 && !isAuthEndpoint) {
        auth.logout();
      }

      return throwError(() => err);
    })
  );
};
