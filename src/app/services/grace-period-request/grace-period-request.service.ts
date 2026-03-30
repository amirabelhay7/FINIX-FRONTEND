import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GracePeriodRequestCreateDto {
  requestedGraceDays: number;
  reason: string;
  clientId: number;
  loanContractId: number;
  installmentNumber: number;
  numberOfAffectedInstallments: number;
}

export interface GracePeriodRequestActionDto {
  reviewedById: number;
  rejectionReason?: string;
}

export interface GracePeriodDocumentDto {
  id: number;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface GracePeriodRequestResponseDto {
  id: number;
  requestedGraceDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  numberOfAffectedInstallments: number;
  createdAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  clientId: number;
  clientFirstName: string;
  clientLastName: string;
  clientCin: string;
  reviewedById: number | null;
  reviewerFirstName: string | null;
  reviewerLastName: string | null;
  loanContractId: number;
  numeroContrat: string;
  installmentId: number;
  installmentNumber: number;
  installmentDueDate: string;
  installmentStatus: string;
  documents: GracePeriodDocumentDto[];
  gracePeriodCaseId: number | null;
}

@Injectable({ providedIn: 'root' })
export class GracePeriodRequestService {

  private readonly API = 'http://localhost:8081/api/grace-period-requests';

  constructor(private http: HttpClient) {}

  create(dto: GracePeriodRequestCreateDto, files?: File[]): Observable<GracePeriodRequestResponseDto> {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (files) {
      files.forEach(f => formData.append('documents', f));
    }
    return this.http.post<GracePeriodRequestResponseDto>(this.API, formData);
  }

  approve(requestId: number, dto: GracePeriodRequestActionDto): Observable<GracePeriodRequestResponseDto> {
    return this.http.put<GracePeriodRequestResponseDto>(`${this.API}/${requestId}/approve`, dto);
  }

  reject(requestId: number, dto: GracePeriodRequestActionDto): Observable<GracePeriodRequestResponseDto> {
    return this.http.put<GracePeriodRequestResponseDto>(`${this.API}/${requestId}/reject`, dto);
  }

  getAll(): Observable<GracePeriodRequestResponseDto[]> {
    return this.http.get<GracePeriodRequestResponseDto[]>(this.API);
  }

  getByStatus(status: string): Observable<GracePeriodRequestResponseDto[]> {
    return this.http.get<GracePeriodRequestResponseDto[]>(`${this.API}/status/${status}`);
  }

  getByClientId(clientId: number): Observable<GracePeriodRequestResponseDto[]> {
    return this.http.get<GracePeriodRequestResponseDto[]>(`${this.API}/client/${clientId}`);
  }

  getById(id: number): Observable<GracePeriodRequestResponseDto> {
    return this.http.get<GracePeriodRequestResponseDto>(`${this.API}/${id}`);
  }
}
