import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DeliveryVehicleDto,
  DeliveryVehiclePayload,
  DocumentVehicleDto,
  DocumentVehiclePayload,
  EscrowPaymentDto,
  EscrowPaymentPayload,
  FeedbackSearchQuery,
  FeedbackVehicleDto,
  FeedbackVehiclePayload,
  GpsTrackerDto,
  GpsTrackerPayload,
  RecommendedVehicleDto,
  VehicleDto,
  VehiclePayload,
  VehicleSearchQuery,
  VehicleStatsDto,
} from '../../models';
import { apiUrl } from '../../core/config/api-url';
import { readStoredAccessToken } from '../auth/auth-storage';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private readonly API = apiUrl('/api/vehicles');
  private readonly DOC_API = apiUrl('/api/vehicle-documents');
  private readonly DELIVERY_API = apiUrl('/api/vehicle-deliveries');
  private readonly FEEDBACK_API = apiUrl('/api/vehicle-feedbacks');
  private readonly ESCROW_API = apiUrl('/api/vehicle-escrow-payments');
  private readonly GPS_API = apiUrl('/api/vehicle-gps-trackers');

  constructor(private http: HttpClient) {}

  private withAuthHeaders(): { headers?: HttpHeaders } {
    const token = readStoredAccessToken();
    if (!token) return {};
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  private toParams(q?: VehicleSearchQuery): HttpParams {
    let p = new HttpParams();
    if (!q) return p;
    const set = (key: string, v: string | number | boolean | undefined | null) => {
      if (v === undefined || v === null || v === '') return;
      p = p.set(key, String(v));
    };
    set('q', q.q);
    set('marque', q.marque);
    set('modele', q.modele);
    set('status', q.status);
    if (q.active !== undefined) set('active', q.active);
    if (q.minPrice !== undefined) set('minPrice', q.minPrice);
    if (q.maxPrice !== undefined) set('maxPrice', q.maxPrice);
    if (q.hasImage !== undefined) set('hasImage', q.hasImage);
    if (q.recentOnly !== undefined) set('recentOnly', q.recentOnly);
    set('sort', q.sort);
    set('sellerUserId', q.sellerUserId);
    set('reservationStatus', q.reservationStatus);
    return p;
  }

  private toFeedbackParams(q?: FeedbackSearchQuery): HttpParams {
    let p = new HttpParams();
    if (!q) return p;
    const set = (key: string, v: string | number | boolean | undefined | null) => {
      if (v === undefined || v === null || v === '') return;
      p = p.set(key, String(v));
    };
    set('feedbackType', q.feedbackType);
    set('authorUserId', q.authorUserId);
    if (q.visible !== undefined) set('visible', q.visible);
    return p;
  }

  /** AI recommendations for the authenticated client. */
  getRecommendations(): Observable<RecommendedVehicleDto[]> {
    return this.http.get<RecommendedVehicleDto[]>(`${this.API}/recommendations/me`, this.withAuthHeaders());
  }

  /** Catalogue / back-office : tous les véhicules (filtrage serveur). */
  searchVehicles(query?: VehicleSearchQuery): Observable<VehicleDto[]> {
    return this.http.get<VehicleDto[]>(this.API, { params: this.toParams(query) });
  }

  /** AGENT IMF operations dashboard */
  getAgentVehicles(query?: VehicleSearchQuery): Observable<VehicleDto[]> {
    return this.http.get<VehicleDto[]>(`${this.API}/agent`, { params: this.toParams(query) });
  }

  /** Vendeur (ou admin) : véhicules « mes annonces » / parc pour admin. */
  getMyVehicles(query?: VehicleSearchQuery): Observable<VehicleDto[]> {
    return this.http.get<VehicleDto[]>(`${this.API}/mine`, {
      params: this.toParams(query),
      ...this.withAuthHeaders(),
    });
  }

  getVehicleStats(): Observable<VehicleStatsDto> {
    return this.http.get<VehicleStatsDto>(`${this.API}/stats`, this.withAuthHeaders());
  }

  uploadVehicleImage(file: File): Observable<{ imageUrl: string }> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http.post<{ imageUrl: string }>(`${this.API}/images`, fd, this.withAuthHeaders());
  }

  uploadVehicleImages(files: File[]): Observable<{ imageUrls: string[] }> {
    const fd = new FormData();
    files.forEach((file) => fd.append('files', file));
    return this.http.post<{ imageUrls: string[] }>(`${this.API}/images/batch`, fd, this.withAuthHeaders());
  }

  createVehicle(payload: VehiclePayload): Observable<VehicleDto> {
    return this.http.post<VehicleDto>(this.API, payload, this.withAuthHeaders());
  }

  getVehicleById(id: number): Observable<VehicleDto> {
    return this.http.get<VehicleDto>(`${this.API}/${id}`);
  }

  getAgentVehicleById(id: number): Observable<VehicleDto> {
    return this.http.get<VehicleDto>(`${this.API}/agent/${id}`);
  }

  updateVehicle(id: number, payload: VehiclePayload): Observable<VehicleDto> {
    return this.http.put<VehicleDto>(`${this.API}/${id}`, payload, this.withAuthHeaders());
  }

  deleteVehicle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`, this.withAuthHeaders());
  }

  getAllDocuments(): Observable<DocumentVehicleDto[]> {
    return this.http.get<DocumentVehicleDto[]>(this.DOC_API);
  }
  createDocument(payload: DocumentVehiclePayload): Observable<DocumentVehicleDto> {
    return this.http.post<DocumentVehicleDto>(this.DOC_API, payload);
  }
  updateDocument(id: number, payload: DocumentVehiclePayload): Observable<DocumentVehicleDto> {
    return this.http.put<DocumentVehicleDto>(`${this.DOC_API}/${id}`, payload);
  }
  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.DOC_API}/${id}`);
  }

  getAllDeliveries(): Observable<DeliveryVehicleDto[]> {
    return this.http.get<DeliveryVehicleDto[]>(this.DELIVERY_API);
  }
  createDelivery(payload: DeliveryVehiclePayload): Observable<DeliveryVehicleDto> {
    return this.http.post<DeliveryVehicleDto>(this.DELIVERY_API, payload);
  }
  updateDelivery(id: number, payload: DeliveryVehiclePayload): Observable<DeliveryVehicleDto> {
    return this.http.put<DeliveryVehicleDto>(`${this.DELIVERY_API}/${id}`, payload);
  }
  deleteDelivery(id: number): Observable<void> {
    return this.http.delete<void>(`${this.DELIVERY_API}/${id}`);
  }

  getAllFeedbacks(query?: FeedbackSearchQuery): Observable<FeedbackVehicleDto[]> {
    return this.http.get<FeedbackVehicleDto[]>(this.FEEDBACK_API, {
      params: this.toFeedbackParams(query),
      ...this.withAuthHeaders(),
    });
  }
  getMyFeedbacks(): Observable<FeedbackVehicleDto[]> {
    return this.http.get<FeedbackVehicleDto[]>(`${this.FEEDBACK_API}/my`, this.withAuthHeaders());
  }
  createFeedback(payload: FeedbackVehiclePayload): Observable<FeedbackVehicleDto> {
    return this.http.post<FeedbackVehicleDto>(this.FEEDBACK_API, payload, this.withAuthHeaders());
  }
  updateFeedback(id: number, payload: FeedbackVehiclePayload): Observable<FeedbackVehicleDto> {
    return this.http.put<FeedbackVehicleDto>(`${this.FEEDBACK_API}/${id}`, payload, this.withAuthHeaders());
  }
  updateFeedbackVisibility(id: number, visible: boolean): Observable<FeedbackVehicleDto> {
    return this.http.patch<FeedbackVehicleDto>(
      `${this.FEEDBACK_API}/${id}/visibility`,
      { visible },
      this.withAuthHeaders(),
    );
  }
  deleteFeedback(id: number): Observable<void> {
    return this.http.delete<void>(`${this.FEEDBACK_API}/${id}`, this.withAuthHeaders());
  }

  getAllEscrows(): Observable<EscrowPaymentDto[]> {
    return this.http.get<EscrowPaymentDto[]>(this.ESCROW_API);
  }
  createEscrow(payload: EscrowPaymentPayload): Observable<EscrowPaymentDto> {
    return this.http.post<EscrowPaymentDto>(this.ESCROW_API, payload);
  }
  updateEscrow(id: number, payload: EscrowPaymentPayload): Observable<EscrowPaymentDto> {
    return this.http.put<EscrowPaymentDto>(`${this.ESCROW_API}/${id}`, payload);
  }
  deleteEscrow(id: number): Observable<void> {
    return this.http.delete<void>(`${this.ESCROW_API}/${id}`);
  }

  getAllGpsTrackers(): Observable<GpsTrackerDto[]> {
    return this.http.get<GpsTrackerDto[]>(this.GPS_API);
  }
  createGpsTracker(payload: GpsTrackerPayload): Observable<GpsTrackerDto> {
    return this.http.post<GpsTrackerDto>(this.GPS_API, payload);
  }
  updateGpsTracker(id: number, payload: GpsTrackerPayload): Observable<GpsTrackerDto> {
    return this.http.put<GpsTrackerDto>(`${this.GPS_API}/${id}`, payload);
  }
  deleteGpsTracker(id: number): Observable<void> {
    return this.http.delete<void>(`${this.GPS_API}/${id}`);
  }
}

/** @deprecated Utiliser VehicleService — alias pour compatibilité éventuelle */
export { VehicleService as Vehicle };
