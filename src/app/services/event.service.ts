import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CreateEventPayload {
  title: string;
  description: string;
  rules: string;
  city: string;
  address: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  imageUrl: string;
  status: string;
  publicEvent: boolean;
  userId: number;
}

export interface EventDto {
  idEvent?: number;
  title: string;
  description?: string;
  rules?: string;
  city?: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  image?: string;
  imageUrl?: string;
  status?: string;
  publicEvent?: boolean;
  userId?: number;
}

export interface EventPageResponse {
  content: EventDto[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export interface CreateEventRegistrationPayload {
  eventId: number;
  userId: number;
  status: 'PENDING';
}

export interface EventRegistrationDto {
  idRegistration?: number;
  eventId?: number;
  userId?: number;
  status?: string;
  registeredAt?: string;
  registrationCode?: string;
  checkedInAt?: string;
}

export interface EventRegistrationPageResponse {
  content: EventRegistrationDto[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export type ChatMessageKind = 'TEXT' | 'VOICE' | 'LOCATION';

export interface EventChatMessageDto {
  id?: number;
  eventId?: number;
  groupId?: number;
  userId?: number;
  senderName?: string;
  content?: string;
  /** Server JSON field name is `type` (Jackson). */
  type?: ChatMessageKind | string;
  audioUrl?: string;
  lat?: number;
  lng?: number;
  address?: string;
  status?: 'ACTIVE' | 'REJECTED' | 'DELETED' | string;
  moderationReason?: string;
  sentAt?: string;
}

export interface EventChatSendPayload {
  userId: number;
  type?: ChatMessageKind;
  content?: string;
  audioUrl?: string;
  lat?: number;
  lng?: number;
  address?: string;
}

export interface ChatAudioUploadResponse {
  audioUrl: string;
}

export interface EventChatMemberDto {
  userId?: number;
  fullName?: string;
  role?: 'MEMBER' | 'ADMIN' | string;
  active?: boolean;
  joinedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly apiBaseUrl = `${environment.apiBaseUrl}${environment.apiEndpoints.event}`;
  private readonly listApiUrl = `${this.apiBaseUrl}/events`;
  private readonly registrationApiUrl = `${this.apiBaseUrl}/registrations`;
  private readonly createEventUrl = `${this.apiBaseUrl}/events`;
  private readonly chatApiUrl = `${this.apiBaseUrl}/chat`;

  constructor(private http: HttpClient) {}

  getEvents(page = 0, size = 10): Observable<EventPageResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<EventPageResponse>(this.listApiUrl, { params }).pipe(catchError(this.handleError));
  }

  getEventById(eventId: number): Observable<EventDto> {
    return this.http.get<EventDto>(`${this.listApiUrl}/${eventId}`).pipe(catchError(this.handleError));
  }

  createEventRegistration(payload: CreateEventRegistrationPayload): Observable<unknown> {
    return this.http.post(this.registrationApiUrl, payload).pipe(catchError(this.handleError));
  }

  getEventRegistrations(page = 0, size = 1000): Observable<EventRegistrationPageResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<EventRegistrationPageResponse>(this.registrationApiUrl, { params }).pipe(catchError(this.handleError));
  }

  createEvent(payload: CreateEventPayload): Observable<unknown> {
    return this.http.post(this.createEventUrl, payload).pipe(catchError(this.handleError));
  }

  updateEvent(eventId: number, payload: CreateEventPayload): Observable<unknown> {
    return this.http.put(`${this.createEventUrl}/${eventId}`, payload).pipe(catchError(this.handleError));
  }

  getEventChatMessages(eventId: number, userId: number): Observable<EventChatMessageDto[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<EventChatMessageDto[]>(`${this.chatApiUrl}/events/${eventId}/messages`, { params }).pipe(catchError(this.handleError));
  }

  sendEventChatMessage(eventId: number, userId: number, content: string): Observable<EventChatMessageDto> {
    return this.http
      .post<EventChatMessageDto>(`${this.chatApiUrl}/events/${eventId}/messages`, {
        userId,
        type: 'TEXT',
        content,
      } as EventChatSendPayload)
      .pipe(catchError(this.handleError));
  }

  sendEventChatPayload(eventId: number, payload: EventChatSendPayload): Observable<EventChatMessageDto> {
    return this.http
      .post<EventChatMessageDto>(`${this.chatApiUrl}/events/${eventId}/messages`, payload)
      .pipe(catchError(this.handleError));
  }

  uploadChatAudio(blob: Blob, filename = 'recording.webm'): Observable<ChatAudioUploadResponse> {
    const fd = new FormData();
    fd.append('file', blob, filename);
    return this.http
      .post<ChatAudioUploadResponse>(`${environment.apiBaseUrl}/chat/audio`, fd)
      .pipe(catchError(this.handleError));
  }

  getEventChatUnreadCount(eventId: number, userId: number, sinceMs?: number): Observable<number> {
    let params = new HttpParams().set('userId', String(userId));
    if (sinceMs !== undefined && sinceMs !== null) {
      params = params.set('sinceMs', String(sinceMs));
    }
    return this.http
      .get<number>(`${this.chatApiUrl}/events/${eventId}/messages/unread-count`, { params })
      .pipe(
        catchError(this.handleError),
        map((v) => {
          const n = Number(v);
          return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
        }),
      );
  }

  getEventChatMembers(eventId: number, userId: number): Observable<EventChatMemberDto[]> {
    const params = new HttpParams().set('userId', userId);
    return this.http.get<EventChatMemberDto[]>(`${this.chatApiUrl}/events/${eventId}/members`, { params }).pipe(catchError(this.handleError));
  }

  leaveEventChatGroup(eventId: number, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', userId);
    return this.http.post<void>(`${this.chatApiUrl}/events/${eventId}/leave`, null, { params }).pipe(catchError(this.handleError));
  }

  removeEventChatMember(eventId: number, actorUserId: number, targetUserId: number): Observable<void> {
    const params = new HttpParams().set('actorUserId', actorUserId);
    return this.http.delete<void>(`${this.chatApiUrl}/events/${eventId}/members/${targetUserId}`, { params }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('❌ Event service client error:', error.error);
    } else {
      console.error('❌ Event service server error:', {
        status: error.status,
        message: error.message,
        body: error.error,
      });
    }

    // Preserve HttpErrorResponse so UI can read status and backend message.
    return throwError(() => error);
  }
}
