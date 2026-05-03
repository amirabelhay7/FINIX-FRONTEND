import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventChatMessageDto } from '../event.service';

@Injectable({ providedIn: 'root' })
export class EventChatSocketService {
  private client: Client | null = null;
  private chatSubscription: StompSubscription | null = null;
  private currentEventId: number | null = null;
  private readonly messagesSubject = new Subject<EventChatMessageDto>();

  readonly messages$ = this.messagesSubject.asObservable();

  connect(eventId: number): void {
    this.currentEventId = eventId;
    const wsBase = environment.apiBaseUrl.replace(/\/api$/, '');
    const token = localStorage.getItem('finix_access_token') || '';

    if (!this.client) {
      this.client = new Client({
        webSocketFactory: () => new SockJS(`${wsBase}/ws`),
        reconnectDelay: 5000,
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        onConnect: () => this.ensureSubscription(),
        onStompError: (frame) => {
          console.error('Event chat STOMP error', frame.headers['message'], frame.body);
        },
      });
      this.client.activate();
      return;
    }

    if (this.client.active && this.client.connected) {
      this.ensureSubscription();
      return;
    }

    if (!this.client.active) {
      this.client.activate();
    }
  }

  /** @deprecated Prefer `publishPayload`. */
  send(eventId: number, userId: number, content: string): void {
    this.publishPayload(eventId, { userId, type: 'TEXT', content });
  }

  isConnected(): boolean {
    return !!(this.client?.active && this.client.connected);
  }

  publishPayload(eventId: number, body: Record<string, unknown>): void {
    if (!this.client?.connected) {
      return;
    }
    this.client.publish({
      destination: `/app/events/${eventId}/chat.send`,
      body: JSON.stringify(body),
    });
  }

  disconnect(): void {
    this.chatSubscription?.unsubscribe();
    this.chatSubscription = null;
    this.currentEventId = null;
    this.client?.deactivate();
    this.client = null;
  }

  private ensureSubscription(): void {
    if (!this.client || !this.client.connected || !this.currentEventId) return;
    this.chatSubscription?.unsubscribe();
    this.chatSubscription = this.client.subscribe(`/topic/events/${this.currentEventId}/chat`, (message: IMessage) => {
      try {
        const payload = JSON.parse(message.body) as EventChatMessageDto;
        this.messagesSubject.next(payload);
      } catch (error) {
        console.error('Invalid chat message payload', error);
      }
    });
  }
}
