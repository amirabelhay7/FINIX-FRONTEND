import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface EventWorkflowNotification {
  type: 'EVENT_SUBMITTED' | 'EVENT_APPROVED' | string;
  eventId: number;
  title: string;
  status: string;
  organizerId?: number;
  organizerFullName?: string;
  createdAt?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class EventNotificationService {
  private client: Client | null = null;
  private readonly adminEventsSubject = new Subject<EventWorkflowNotification>();
  private readonly insurerEventsSubject = new Subject<EventWorkflowNotification>();
  private adminSubscription: StompSubscription | null = null;
  private insurerSubscription: StompSubscription | null = null;

  get adminEvents$(): Observable<EventWorkflowNotification> {
    return this.adminEventsSubject.asObservable();
  }

  get insurerEvents$(): Observable<EventWorkflowNotification> {
    return this.insurerEventsSubject.asObservable();
  }

  connect(): void {
    if (this.client?.active) {
      if (this.client.connected) {
        this.ensureSubscriptions();
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
        this.ensureSubscriptions();
      },
      onStompError: (frame) => {
        console.error('Event STOMP error', frame.headers['message'], frame.body);
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.adminSubscription?.unsubscribe();
    this.insurerSubscription?.unsubscribe();
    this.adminSubscription = null;
    this.insurerSubscription = null;
    this.client?.deactivate();
    this.client = null;
  }

  private emitParsed(message: IMessage, target: Subject<EventWorkflowNotification>): void {
    try {
      const payload = JSON.parse(message.body) as EventWorkflowNotification;
      target.next(payload);
    } catch (error) {
      console.error('Invalid event websocket payload', error);
    }
  }

  private ensureSubscriptions(): void {
    if (!this.client || !this.client.connected) return;

    this.adminSubscription?.unsubscribe();
    this.insurerSubscription?.unsubscribe();

    this.adminSubscription = this.client.subscribe('/topic/admin/events', (message: IMessage) => {
      this.emitParsed(message, this.adminEventsSubject);
    });
    this.insurerSubscription = this.client.subscribe('/topic/insurer/events', (message: IMessage) => {
      this.emitParsed(message, this.insurerEventsSubject);
    });
  }
}
