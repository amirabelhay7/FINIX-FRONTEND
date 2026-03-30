import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

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
  paidEvent: boolean;
  registrationFee: number;
  imageUrl: string;
  externalUrl: string;
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
  paidEvent?: boolean;
  registrationFee?: number;
  imageUrl?: string;
  externalUrl?: string;
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

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly listApiUrl = 'http://localhost:8081/api/event/events';
  private readonly registrationApiUrl = 'http://localhost:8081/api/event/registrations';
  private readonly createEventEndpoints = [
    'http://localhost:8081/api/event/events',
    'http://localhost:8081/api/events',
    'http://localhost:8081/api/event',
    'http://localhost:8081/api/events/create',
    'http://localhost:8081/api/event/create',
  ];

  constructor(private http: HttpClient) {}

  getEvents(page = 0, size = 10): Observable<EventPageResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<EventPageResponse>(this.listApiUrl, { params });
  }

  createEventRegistration(payload: CreateEventRegistrationPayload): Observable<unknown> {
    return this.http.post(this.registrationApiUrl, payload);
  }

  createEvent(payload: CreateEventPayload): Observable<unknown> {
    return this.tryCreateEvent(0, payload);
  }

  /**
   * Retry on backend route mismatch (403/404/405) using common endpoint variants.
   * Keeps the first successful response and preserves existing behavior otherwise.
   */
  private tryCreateEvent(index: number, payload: CreateEventPayload): Observable<unknown> {
    const url = this.createEventEndpoints[index];
    if (!url) {
      return throwError(() => new Error("Echec de création de l'événement (endpoint introuvable)."));
    }

    return this.http.post(url, payload).pipe(
      catchError((err) => {
        const canTryNext =
          (err?.status === 403 || err?.status === 404 || err?.status === 405) &&
          index < this.createEventEndpoints.length - 1;

        if (canTryNext) {
          return this.tryCreateEvent(index + 1, payload);
        }

        return throwError(() => err);
      }),
    );
  }
}
