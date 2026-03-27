import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppNotificationDto {
  id: number;
  title?: string | null;
  body?: string | null;
  readAt?: string | null;
  createdAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = 'http://localhost:8081/api/notifications';

  constructor(private http: HttpClient) {}

  list(): Observable<AppNotificationDto[]> {
    return this.http.get<AppNotificationDto[]>(this.api);
  }

  unreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.api}/unread-count`);
  }

  markRead(id: number): Observable<unknown> {
    return this.http.patch(`${this.api}/${id}/read`, {});
  }
}
