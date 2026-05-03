import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { apiUrl } from '../../core/config/api-url';
import { AppNotificationDto, NotificationModuleApi } from '../../models';
import { readStoredAccessToken } from '../auth/auth-storage';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly API = apiUrl('/api/notifications');

  private readonly refresh$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  get refreshTrigger(): Observable<void> {
    return this.refresh$.asObservable();
  }

  requestRefresh(): void {
    this.refresh$.next();
  }

  private authHeaders(): { headers?: HttpHeaders } {
    const token = readStoredAccessToken();
    if (!token) return {};
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
  }

  getNotifications(module?: NotificationModuleApi): Observable<AppNotificationDto[]> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);
    return this.http.get<AppNotificationDto[]>(this.API, { params, ...this.authHeaders() });
  }

  getUnreadCount(module?: NotificationModuleApi): Observable<number> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);
    return this.http
      .get<{ count: number }>(`${this.API}/unread-count`, { params, ...this.authHeaders() })
      .pipe(map((r) => r.count));
  }

  markAsRead(id: number): Observable<void> {
    return this.http
      .put<void>(`${this.API}/${id}/read`, {}, { ...this.authHeaders() })
      .pipe(tap(() => this.requestRefresh()));
  }

  markAllAsRead(module?: NotificationModuleApi): Observable<number> {
    let params = new HttpParams();
    if (module) params = params.set('module', module);
    return this.http
      .put<{ updated: number }>(`${this.API}/read-all`, {}, { params, ...this.authHeaders() })
      .pipe(
        map((r) => r.updated),
        tap(() => this.requestRefresh()),
      );
  }
}
