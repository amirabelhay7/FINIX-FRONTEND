import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NotificationApi, NotificationUnreadCountApi } from '../../models';

const API = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}

  getMyNotifications(): Observable<NotificationApi[]> {
    return this.http.get<NotificationApi[]>(`${API}/notifications/me`);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<NotificationUnreadCountApi>(`${API}/notifications/me/unread-count`).pipe(
      map(r => r.count)
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${API}/notifications/me/read/${id}`, null);
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${API}/notifications/me/read-all`, null);
  }
}
