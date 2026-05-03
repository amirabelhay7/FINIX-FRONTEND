import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError, tap } from 'rxjs';
import {
  CreateRequestLoanPayload,
  LoanContractDetailsDto,
  LoanContractDto,
  LoanDocumentDto,
  PageResponse,
  RequestLoanDecisionPayload,
  RequestLoanDto,
} from '../../models/credit.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Credit {
  private apiUrl = `${environment.apiBaseUrl}${environment.apiEndpoints.credit}`;
  private loanContractsUrl = `${environment.apiBaseUrl}/credit/loan-contracts`;

  constructor(private http: HttpClient) {}

  getRequestLoans(page: number = 0, size: number = 10, userId?: number): Observable<PageResponse<RequestLoanDto>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size);

    if (typeof userId === 'number') {
      params = params.set('userId', userId);
    }

    return this.http.get<PageResponse<RequestLoanDto>>(this.apiUrl, { params }).pipe(
      tap(response => console.log('✅ Fetched request loans:', response)),
      catchError(this.handleError)
    );
  }

  getRequestLoansByUserId(
    userId: number,
    page: number = 0,
    size: number = 20,
  ): Observable<PageResponse<RequestLoanDto>> {
    return this.getRequestLoans(page, size, userId);
  }

  createRequestLoan(payload: CreateRequestLoanPayload): Observable<RequestLoanDto> {
    return this.http.post<RequestLoanDto>(this.apiUrl, payload).pipe(
      tap(response => console.log('✅ Created request loan:', response)),
      catchError(this.handleError)
    );
  }

  updateRequestLoan(idDemande: number, payload: Partial<CreateRequestLoanPayload>): Observable<RequestLoanDto> {
    return this.http.put<RequestLoanDto>(`${this.apiUrl}/${idDemande}`, payload).pipe(
      tap(response => console.log('✅ Updated request loan:', response)),
      catchError(this.handleError)
    );
  }

  deleteRequestLoan(idDemande: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idDemande}`).pipe(
      tap(() => console.log('✅ Deleted request loan:', idDemande)),
      catchError(this.handleError)
    );
  }

  uploadLoanDocument(requestLoanId: number, typeDocument: string, file: File): Observable<LoanDocumentDto> {
    const formData = new FormData();
    formData.append('requestLoanId', String(requestLoanId));
    formData.append('typeDocument', typeDocument);
    formData.append('file', file);
    return this.http.post<LoanDocumentDto>(`${this.apiUrl.replace('/request-loans', '/loan-documents')}/upload`, formData).pipe(
      tap(response => console.log('✅ Uploaded loan document:', response)),
      catchError(this.handleError)
    );
  }

  getLoanDocuments(page: number = 0, size: number = 200): Observable<PageResponse<LoanDocumentDto>> {
    const params = new HttpParams()
      .set('page', page)
      .set('size', size);
    return this.http.get<PageResponse<LoanDocumentDto>>(
      `${this.apiUrl.replace('/request-loans', '/loan-documents')}`,
      { params },
    ).pipe(
      tap(response => console.log('✅ Fetched loan documents:', response)),
      catchError(this.handleError),
    );
  }

  downloadLoanDocument(documentId: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl.replace('/request-loans', '/loan-documents')}/${documentId}/file`,
      { responseType: 'blob' },
    ).pipe(
      tap(() => console.log('✅ Downloaded loan document:', documentId)),
      catchError(this.handleError),
    );
  }

  getLoanContracts(page = 0, size = 20): Observable<PageResponse<LoanContractDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PageResponse<LoanContractDto>>(this.loanContractsUrl, { params }).pipe(
      catchError(this.handleError),
    );
  }

  getLoanContractDetails(idContrat: number): Observable<LoanContractDetailsDto> {
    return this.http.get<LoanContractDetailsDto>(`${this.loanContractsUrl}/${idContrat}/details`).pipe(
      catchError(this.handleError),
    );
  }

  downloadLoanContractPdf(idContrat: number): Observable<Blob> {
    return this.http.get(`${this.loanContractsUrl}/${idContrat}/download`, { responseType: 'blob' }).pipe(
      catchError(this.handleError),
    );
  }

  approveRequestLoan(
    idDemande: number,
    payload?: RequestLoanDecisionPayload,
  ): Observable<RequestLoanDto> {
    const body = this.decisionBody(payload);
    return this.http.post<RequestLoanDto>(`${this.apiUrl}/${idDemande}/approve`, body).pipe(
      tap(response => console.log('✅ Approved request loan:', response)),
      catchError(this.handleError)
    );
  }

  rejectRequestLoan(
    idDemande: number,
    payload?: RequestLoanDecisionPayload,
  ): Observable<RequestLoanDto> {
    const body = this.decisionBody(payload);
    return this.http.post<RequestLoanDto>(`${this.apiUrl}/${idDemande}/reject`, body).pipe(
      tap(response => console.log('✅ Rejected request loan:', response)),
      catchError(this.handleError)
    );
  }

  private decisionBody(payload?: RequestLoanDecisionPayload): RequestLoanDecisionPayload {
    const note = payload?.note?.trim();
    return note ? { note } : {};
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('❌ Client error:', error.error);
    } else {
      console.error('❌ Server error:', {
        status: error.status,
        message: error.message,
        body: error.error
      });
    }

    // Keep original HttpErrorResponse so feature components can read backend messages.
    return throwError(() => error);
  }
}
