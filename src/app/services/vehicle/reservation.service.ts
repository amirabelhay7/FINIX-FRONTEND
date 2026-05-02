import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  VehicleReservationDto,
  VehicleReservationPayload,
  ReservationRejectPayload,
  ReservationRequestDocumentsPayload,
  ReservationCancelPayload,
  ReservationStatus,
} from '../../models';
import { apiUrl } from '../../core/config/api-url';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly API = apiUrl('/api/reservations');
  private readonly ACTIVE_STATUSES: ReservationStatus[] = [
    'PENDING_ADMIN_APPROVAL',
    'WAITING_CUSTOMER_ACTION',
    'UNDER_REVIEW',
    'APPROVED',
  ];

  constructor(private http: HttpClient) {}

  create(payload: VehicleReservationPayload): Observable<VehicleReservationDto> {
    return this.http.post<VehicleReservationDto>(this.API, payload);
  }

  myReservations(): Observable<VehicleReservationDto[]> {
    const params = new HttpParams().set('_ts', String(Date.now()));
    return this.http.get<VehicleReservationDto[]>(`${this.API}/my`, { params });
  }

  myHasActiveReservation(): Observable<boolean> {
    return this.myReservations().pipe(
      map((rows) => rows.some((r) => this.ACTIVE_STATUSES.includes(r.status))),
    );
  }

  sellerReservations(): Observable<VehicleReservationDto[]> {
    return this.http.get<VehicleReservationDto[]>(`${this.API}/seller`);
  }

  adminList(): Observable<VehicleReservationDto[]> {
    return this.http.get<VehicleReservationDto[]>(`${this.API}/admin`);
  }

  getPendingReservations(): Observable<VehicleReservationDto[]> {
    const params = new HttpParams().set('_ts', String(Date.now()));
    return this.http.get<VehicleReservationDto[]>(`${this.API}/pending`, { params });
  }

  getAgentReservations(filter?: {
    vehicleId?: number;
    status?: ReservationStatus;
  }): Observable<VehicleReservationDto[]> {
    let params = new HttpParams();
    if (filter?.vehicleId !== undefined && filter.vehicleId !== null) {
      params = params.set('vehicleId', String(filter.vehicleId));
    }
    if (filter?.status) {
      params = params.set('status', filter.status);
    }
    return this.http.get<VehicleReservationDto[]>(`${this.API}/agent`, { params });
  }

  getById(id: number): Observable<VehicleReservationDto> {
    return this.http.get<VehicleReservationDto>(`${this.API}/${id}`);
  }

  cancel(id: number, body?: ReservationCancelPayload | null): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/cancel`, body ?? {});
  }

  approve(id: number): Observable<VehicleReservationDto> {
    return this.http.patch<VehicleReservationDto>(`${this.API}/${id}/approve`, {});
  }

  approveReservation(id: number): Observable<VehicleReservationDto> {
    return this.http.put<VehicleReservationDto>(`${this.API}/${id}/approve`, {});
  }

  reject(id: number, payload: ReservationRejectPayload): Observable<VehicleReservationDto> {
    return this.http.patch<VehicleReservationDto>(`${this.API}/${id}/reject`, payload);
  }

  rejectReservation(id: number, payload: ReservationRejectPayload): Observable<VehicleReservationDto> {
    return this.http.put<VehicleReservationDto>(`${this.API}/${id}/reject`, payload);
  }

  requestDocuments(id: number, payload: ReservationRequestDocumentsPayload): Observable<VehicleReservationDto> {
    return this.http.patch<VehicleReservationDto>(`${this.API}/${id}/request-documents`, payload);
  }

  markUnderReview(id: number): Observable<VehicleReservationDto> {
    return this.http.patch<VehicleReservationDto>(`${this.API}/${id}/under-review`, {});
  }

  setUnderReview(id: number): Observable<VehicleReservationDto> {
    return this.http.put<VehicleReservationDto>(`${this.API}/${id}/under-review`, {});
  }

  setWaitingCustomer(id: number): Observable<VehicleReservationDto> {
    return this.http.put<VehicleReservationDto>(`${this.API}/${id}/waiting-client`, {});
  }
}
