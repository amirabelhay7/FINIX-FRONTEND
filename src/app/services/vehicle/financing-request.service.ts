import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FinancingRequestDto, FinancingRequestPayload, FinancingRequestStatus } from '../../models';
import { apiUrl } from '../../core/config/api-url';

@Injectable({ providedIn: 'root' })
export class FinancingRequestService {
  private readonly API = apiUrl('/api/financing-requests');

  constructor(private http: HttpClient) {}

  create(payload: FinancingRequestPayload): Observable<FinancingRequestDto> {
    return this.http.post<FinancingRequestDto>(this.API, payload);
  }

  myRequests(): Observable<FinancingRequestDto[]> {
    return this.http.get<FinancingRequestDto[]>(`${this.API}/my`);
  }

  getById(id: number): Observable<FinancingRequestDto> {
    return this.http.get<FinancingRequestDto>(`${this.API}/${id}`);
  }
}
