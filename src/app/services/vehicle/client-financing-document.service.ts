import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientDocumentType, ClientFinancingDocumentDto } from '../../models';
import { apiUrl } from '../../core/config/api-url';

@Injectable({ providedIn: 'root' })
export class ClientFinancingDocumentService {
  private readonly API = apiUrl('/api/client-financing-documents');

  constructor(private http: HttpClient) {}

  upload(
    vehicleId: number,
    file: File,
    documentType: ClientDocumentType,
    financingRequestId?: number | null,
  ): Observable<ClientFinancingDocumentDto> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('vehicleId', String(vehicleId));
    fd.append('documentType', documentType);
    if (financingRequestId != null) {
      fd.append('financingRequestId', String(financingRequestId));
    }
    return this.http.post<ClientFinancingDocumentDto>(`${this.API}/upload`, fd);
  }

  byVehicle(vehicleId: number): Observable<ClientFinancingDocumentDto[]> {
    return this.http.get<ClientFinancingDocumentDto[]>(`${this.API}/by-vehicle/${vehicleId}`);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
