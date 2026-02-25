import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status !== 401) return throwError(() => err);
        // Don't logout on 401 for auth, notifications, or document upload (so user sees error instead of being kicked out)
        if (req.url.includes('/api/auth') || req.url.includes('/api/notifications') || req.url.includes('/api/user-documents')) {
          return throwError(() => err);
        }
        this.auth.logout();
        this.router.navigate(['/auth/login'], { queryParams: { sessionExpired: '1' } });
        return throwError(() => err);
      })
    );
  }
}
