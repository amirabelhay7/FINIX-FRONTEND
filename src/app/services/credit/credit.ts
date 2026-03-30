/*import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Credit {

}*/

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateRequestLoanPayload,
  PageResponse,
  RequestLoanDecisionPayload,
  RequestLoanDto,
} from '../../models/credit.model';

@Injectable({
  providedIn: 'root',
})
export class Credit {

  private apiUrl = 'http://localhost:8081/api/credit/request-loans';

  constructor(private http: HttpClient) {}

  getRequestLoans(page: number = 0, size: number = 10, userId?: number): Observable<PageResponse<RequestLoanDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (typeof userId === 'number') {
      params = params.set('userId', userId);
    }

    return this.http.get<PageResponse<RequestLoanDto>>(this.apiUrl, { params });
  }

  getRequestLoansByUserId(userId: number, page: number = 0, size: number = 20): Observable<PageResponse<RequestLoanDto>> {
    return this.getRequestLoans(page, size, userId);
  }

  createRequestLoan(payload: CreateRequestLoanPayload): Observable<RequestLoanDto> {
    return this.http.post<RequestLoanDto>(this.apiUrl, payload);
  }

  updateRequestLoan(idDemande: number, payload: Partial<CreateRequestLoanPayload>): Observable<RequestLoanDto> {
    return this.http.put<RequestLoanDto>(`${this.apiUrl}/${idDemande}`, payload);
  }

  deleteRequestLoan(idDemande: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idDemande}`);
  }

  approveRequestLoan(
    idDemande: number,
    payload?: RequestLoanDecisionPayload,
  ): Observable<RequestLoanDto> {
    const body = this.decisionBody(payload);
    return this.http.post<RequestLoanDto>(`${this.apiUrl}/${idDemande}/approve`, body);
  }

  rejectRequestLoan(
    idDemande: number,
    payload?: RequestLoanDecisionPayload,
  ): Observable<RequestLoanDto> {
    const body = this.decisionBody(payload);
    return this.http.post<RequestLoanDto>(`${this.apiUrl}/${idDemande}/reject`, body);
  }

  private decisionBody(payload?: RequestLoanDecisionPayload): RequestLoanDecisionPayload {
    const note = payload?.note?.trim();
    return note ? { note } : {};
  }
}
