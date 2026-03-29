import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClientSearchResult {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cin?: string;
  initials: string;
  isActive: boolean;
  walletBalance?: number;
  createdAt: string;
  lastActiveAt?: string;
}

export interface ClientSearchRequest {
  query: string;
  limit?: number;
  includeInactive?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClientSearchService {
  private baseUrl = 'http://localhost:8081/api/clients';

  constructor(private http: HttpClient) {}

  searchClients(request: ClientSearchRequest): Observable<ClientSearchResult[]> {
    const params = new URLSearchParams();
    params.append('q', request.query);
    if (request.limit) params.append('limit', request.limit.toString());
    if (request.includeInactive) params.append('includeInactive', 'true');

    return this.http.get<ClientSearchResult[]>(`${this.baseUrl}/search?${params}`);
  }

  getClientById(clientId: string): Observable<ClientSearchResult> {
    return this.http.get<ClientSearchResult>(`${this.baseUrl}/${clientId}`);
  }

  getClientByEmail(email: string): Observable<ClientSearchResult> {
    return this.http.get<ClientSearchResult>(`${this.baseUrl}/by-email/${encodeURIComponent(email)}`);
  }

  getClientByPhone(phone: string): Observable<ClientSearchResult> {
    return this.http.get<ClientSearchResult>(`${this.baseUrl}/by-phone/${encodeURIComponent(phone)}`);
  }

  getClientByCin(cin: string): Observable<ClientSearchResult> {
    return this.http.get<ClientSearchResult>(`${this.baseUrl}/by-cin/${encodeURIComponent(cin)}`);
  }
}
