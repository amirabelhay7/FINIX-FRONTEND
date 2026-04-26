import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
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
  private readonly apiBaseUrl = `${environment.apiBaseUrl}${environment.apiEndpoints.event}`;
  private readonly listApiUrl = `${this.apiBaseUrl}/events`;
  private readonly registrationApiUrl = `${this.apiBaseUrl}/registrations`;
  private readonly createEventUrl = `${this.apiBaseUrl}/events`;

  constructor(private http: HttpClient) {}

  getEvents(page = 0, size = 10): Observable<EventPageResponse> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<EventPageResponse>(this.listApiUrl, { params }).pipe(
      tap(response => console.log('✅ Fetched events:', response)),
      catchError(this.handleError)
    );
  }

  createEventRegistration(payload: CreateEventRegistrationPayload): Observable<unknown> {
    return this.http.post(this.registrationApiUrl, payload).pipe(
      tap(response => console.log('✅ Created event registration:', response)),
      catchError(this.handleError)
    );
  }

  createEvent(payload: CreateEventPayload): Observable<unknown> {
    return this.http.post(this.createEventUrl, payload).pipe(
      tap(response => console.log('✅ Created event:', response)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred with events service';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
      console.error('❌ Event service client error:', error.error);
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      console.error('❌ Event service server error:', {
        status: error.status,
        message: error.message,
        body: error.error
      });
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
