import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

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
  public readonly realTimeNotification$ = new Subject<AppNotificationDto>();
  private stompClient: Client | null = null;

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

  connectWebSocket(userId: number, token?: string): void {
    if (this.stompClient && this.stompClient.active) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws-notifications'),
      onConnect: () => {
        console.log('Connected to WS for user', userId);
        this.stompClient?.subscribe(`/topic/notifications/${userId}`, (message) => {
          if (message.body) {
            this.realTimeNotification$.next(JSON.parse(message.body) as AppNotificationDto);
          }
        });
      },
      onStompError: (frame) => console.error('STOMP Error:', frame),
    });

    if (token) {
      this.stompClient.connectHeaders = { Authorization: 'Bearer ' + token };
    }

    this.stompClient.activate();
  }

  disconnectWebSocket(): void {
    if (this.stompClient && this.stompClient.active) {
      void this.stompClient.deactivate();
      this.stompClient = null;
    }
  }
}
