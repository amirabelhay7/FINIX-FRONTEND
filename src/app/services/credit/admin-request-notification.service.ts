import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminRequestNotificationEvent {
  type: 'NEW_REQUEST' | string;
  requestId: number;
  clientFullName: string;
  amount: number;
  objective: string;
  status: string;
  createdAt: string;
}

export interface AdminEventNotificationEvent {
  type: 'EVENT_SUBMITTED' | string;
  eventId: number;
  title: string;
  status: string;
  organizerId?: number;
  organizerFullName?: string;
  createdAt?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminRequestNotificationService {
  private client: Client | null = null;
  private readonly eventsSubject = new Subject<AdminRequestNotificationEvent>();
  private readonly eventEventsSubject = new Subject<AdminEventNotificationEvent>();
  private requestsSubscription: StompSubscription | null = null;
  private eventsSubscription: StompSubscription | null = null;

  get events$(): Observable<AdminRequestNotificationEvent> {
    return this.eventsSubject.asObservable();
  }

  get eventEvents$(): Observable<AdminEventNotificationEvent> {
    return this.eventEventsSubject.asObservable();
  }

  connect(): void {
    if (this.client?.active) {
      if (this.client.connected) {
        this.ensureAdminSubscriptions();
      }
      return;
    }

    const wsBase = environment.apiBaseUrl.replace(/\/api$/, '');
    const token = localStorage.getItem('finix_access_token') || '';

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${wsBase}/ws`),
      reconnectDelay: 5000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        this.ensureAdminSubscriptions();
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame.headers['message'], frame.body);
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.requestsSubscription?.unsubscribe();
    this.eventsSubscription?.unsubscribe();
    this.requestsSubscription = null;
    this.eventsSubscription = null;
    this.client?.deactivate();
    this.client = null;
  }

  private ensureAdminSubscriptions(): void {
    if (!this.client || !this.client.connected) return;

    this.requestsSubscription?.unsubscribe();
    this.eventsSubscription?.unsubscribe();

    this.requestsSubscription = this.client.subscribe('/topic/admin/requests', (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body) as AdminRequestNotificationEvent;
        this.eventsSubject.next(payload);
      } catch (error) {
        console.error('Invalid websocket notification payload', error);
      }
    });

    this.eventsSubscription = this.client.subscribe('/topic/admin/events', (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body) as AdminEventNotificationEvent;
        this.eventEventsSubject.next(payload);
      } catch (error) {
        console.error('Invalid websocket event payload', error);
      }
    });
  }
}
