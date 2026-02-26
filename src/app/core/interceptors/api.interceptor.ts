import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private toastService: ToastService,
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let modifiedReq = req;

    const token = this.authService.getToken();
    const isAdminApi = req.url.startsWith('/api/admin') || req.url.includes('/admin/');

    if (token && isAdminApi) {
      modifiedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(modifiedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        const msg = this.toFriendlyMessage(error);
        this.toastService.showError(msg);
        return throwError(() => error);
      }),
    );
  }

  private toFriendlyMessage(error: HttpErrorResponse): string {
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (typeof error.error === 'object') {
        if (typeof (error.error as any).message === 'string') {
          return (error.error as any).message;
        }
        if (Array.isArray((error.error as any).errors)) {
          return (error.error as any).errors.join(', ');
        }
      }
    }

    if (error.status === 0) {
      return 'Le serveur API est indisponible. Veuillez réessayer plus tard.';
    }

    if (error.status >= 400 && error.status < 500) {
      return 'Votre requête est invalide. Merci de vérifier les informations saisies.';
    }

    return 'Une erreur est survenue. Merci de réessayer plus tard.';
  }
}

