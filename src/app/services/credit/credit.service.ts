import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { apiUrl } from '../../core/config/api-url';
import {
  CreateRequestLoanPayload,
  LoanContractDetailsDto,
  LoanContractDto as AdminLoanContractDto,
  LoanDocumentDto,
  PageResponse,
  RequestLoanDecisionPayload,
  RequestLoanDto,
} from '../../models/credit.model';

export interface LoanContractDto {
  id: number;
  numeroContrat: string;
  montantCredit: number;
  tauxInteret: number;
  dureeMois: number;
  montantTotalRembourse: number;
  datePremiereEcheance: string;
  firstPaymentDate: string;
  gracePeriodDays: number;
  penaltyRatePerDay: number;
  monthlyPayment?: number;
}

export interface StripeConfigDto {
  publishableKey: string;
}

export interface StripePaymentIntentRequestDto {
  amount: number;
  currency: string;
  installmentNumber: number;
  userId: number;
  loanContractId: number;
  dueDate: string;
  description: string;
}

export interface StripePaymentIntentResponseDto {
  clientSecret: string;
  paymentIntentId: string;
  publishableKey: string;
}

export interface PaymentRequestDto {
  paymentMethod: string;
  amountPaid: number;
  paymentStatus: string;
  userId: number;
  loanContractId: number;
  installmentNumber: number;
  dueDate: string;
}

export interface PaymentResponseDto {
  id: number;
  paymentMethod: string;
  amountPaid: number;
  paymentDate: string;
  paymentStatus: string;
  username: string;
  loanContractId: number;
  numeroContrat: string;
  installmentNumber: number;
  dueDate: string;
}

export interface PaymentHistoryResponseDto {
  id: number;
  stripePaymentIntentId: string;
  paymentMethod: string;
  amountPaid: number;
  paymentDate: string;
  paymentStatus: string;
  username: string;
  loanContractId: number;
  numeroContrat: string;
  installmentNumber: number;
  dueDate: string;
}

export interface InstallmentDto {
  id: number;
  installmentNumber: number;
  dueDate: string;
  amountDue: number;
  principalPart: number;
  interestPart: number;
  remainingBalance: number;
  status: string;
}

export interface PenaltyDto {
  id: number;
  installmentId: number;
  installmentNumber: number;
  installmentDueDate: string;
  installmentAmountDue: number;
  penaltyTier: string;
  tierLabel: string;
  daysOverdue: number;
  penaltyRate: number;
  penaltyAmount: number;
  relanceFee: number;
  totalPenalty: number;
  cappedAt: number;
  status: string;
  appliedDate: string;
  paidDate: string | null;
  waivedByName: string | null;
  waivedAt: string | null;
  waivedReason: string | null;
}

@Injectable({ providedIn: 'root' })
export class Credit {
  private readonly API = apiUrl('/api/loans');
  private readonly PAY_API = apiUrl('/api/payments');
  private readonly HISTORY_API = apiUrl('/api/payment-history');
  private readonly STRIPE_API = apiUrl('/api/stripe');
  private readonly SCHEDULE_API = apiUrl('/api/schedule-repayment');
  private readonly PENALTY_API = apiUrl('/api/penalties');
  /** Request-loan flow (credit module). */
  private readonly REQUEST_LOANS = apiUrl('/api/credit/request-loans');
  private readonly LOAN_DOCUMENTS = apiUrl('/api/credit/loan-documents');
  private readonly LOAN_CONTRACTS_LIST = apiUrl('/api/credit/loan-contracts');

  constructor(private http: HttpClient) {}

  getMyContract(): Observable<LoanContractDto> {
    return this.http.get<LoanContractDto>(`${this.API}/contract/me`);
  }

  getPaymentsByUser(userId: number): Observable<PaymentResponseDto[]> {
    return this.http.get<PaymentResponseDto[]>(`${this.PAY_API}/by-user/${userId}`);
  }

  getPaymentHistory(userId: number): Observable<PaymentHistoryResponseDto[]> {
    return this.http.get<PaymentHistoryResponseDto[]>(`${this.HISTORY_API}/by-user/${userId}`);
  }

  recordPaymentHistory(body: {
    stripePaymentIntentId: string;
    userId: number;
    loanContractId: number;
    installmentNumber: number;
    dueDate: string;
    amountPaid: number;
  }): Observable<void> {
    return this.http.post<void>(`${this.HISTORY_API}/record`, body);
  }

  createPayment(dto: PaymentRequestDto): Observable<PaymentResponseDto> {
    return this.http.post<PaymentResponseDto>(this.PAY_API, dto);
  }

  getStripeConfig(): Observable<StripeConfigDto> {
    return this.http.get<StripeConfigDto>(`${this.STRIPE_API}/config`);
  }

  createStripePaymentIntent(
    dto: StripePaymentIntentRequestDto,
  ): Observable<StripePaymentIntentResponseDto> {
    return this.http.post<StripePaymentIntentResponseDto>(
      `${this.STRIPE_API}/create-payment-intent`,
      dto,
    );
  }

  getInstallments(loanContractId: number): Observable<InstallmentDto[]> {
    return this.http.get<InstallmentDto[]>(`${this.SCHEDULE_API}/installments/${loanContractId}`);
  }

  getPenaltiesByContract(loanContractId: number): Observable<PenaltyDto[]> {
    return this.http.get<PenaltyDto[]>(`${this.PENALTY_API}/by-contract/${loanContractId}`);
  }

  applyPenaltiesForContract(loanContractId: number): Observable<PenaltyDto[]> {
    return this.http.post<PenaltyDto[]>(`${this.PENALTY_API}/apply-by-contract/${loanContractId}`, {});
  }

  applyAllPenalties(): Observable<string> {
    return this.http.post(`${this.PENALTY_API}/apply-all`, {}, { responseType: 'text' });
  }

  // --- Request loans & documents (client credit module) ---

  getRequestLoans(page = 0, size = 10, userId?: number): Observable<PageResponse<RequestLoanDto>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (typeof userId === 'number') {
      params = params.set('userId', userId);
    }
    return this.http
      .get<PageResponse<RequestLoanDto>>(this.REQUEST_LOANS, { params })
      .pipe(catchError(this.handleRequestLoanError));
  }

  getRequestLoansByUserId(
    userId: number,
    page = 0,
    size = 20,
  ): Observable<PageResponse<RequestLoanDto>> {
    return this.getRequestLoans(page, size, userId);
  }

  createRequestLoan(payload: CreateRequestLoanPayload): Observable<RequestLoanDto> {
    return this.http
      .post<RequestLoanDto>(this.REQUEST_LOANS, payload)
      .pipe(catchError(this.handleRequestLoanError));
  }

  updateRequestLoan(
    idDemande: number,
    payload: Partial<CreateRequestLoanPayload>,
  ): Observable<RequestLoanDto> {
    return this.http
      .put<RequestLoanDto>(`${this.REQUEST_LOANS}/${idDemande}`, payload)
      .pipe(catchError(this.handleRequestLoanError));
  }

  deleteRequestLoan(idDemande: number): Observable<void> {
    return this.http
      .delete<void>(`${this.REQUEST_LOANS}/${idDemande}`)
      .pipe(catchError(this.handleRequestLoanError));
  }

  uploadLoanDocument(requestLoanId: number, typeDocument: string, file: File): Observable<LoanDocumentDto> {
    const formData = new FormData();
    formData.append('requestLoanId', String(requestLoanId));
    formData.append('typeDocument', typeDocument);
    formData.append('file', file);
    return this.http
      .post<LoanDocumentDto>(`${this.LOAN_DOCUMENTS}/upload`, formData)
      .pipe(catchError(this.handleRequestLoanError));
  }

  getLoanDocuments(page = 0, size = 200): Observable<PageResponse<LoanDocumentDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<PageResponse<LoanDocumentDto>>(this.LOAN_DOCUMENTS, { params })
      .pipe(catchError(this.handleRequestLoanError));
  }

  downloadLoanDocument(documentId: number): Observable<Blob> {
    return this.http
      .get(`${this.LOAN_DOCUMENTS}/${documentId}/file`, { responseType: 'blob' })
      .pipe(catchError(this.handleRequestLoanError));
  }

  getLoanContracts(page = 0, size = 20): Observable<PageResponse<AdminLoanContractDto>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<PageResponse<AdminLoanContractDto>>(this.LOAN_CONTRACTS_LIST, { params })
      .pipe(catchError(this.handleRequestLoanError));
  }

  getLoanContractDetails(idContrat: number): Observable<LoanContractDetailsDto> {
    return this.http
      .get<LoanContractDetailsDto>(`${this.LOAN_CONTRACTS_LIST}/${idContrat}/details`)
      .pipe(catchError(this.handleRequestLoanError));
  }

  downloadLoanContractPdf(idContrat: number): Observable<Blob> {
    return this.http
      .get(`${this.LOAN_CONTRACTS_LIST}/${idContrat}/download`, { responseType: 'blob' })
      .pipe(catchError(this.handleRequestLoanError));
  }

  approveRequestLoan(
    idDemande: number,
    payload?: RequestLoanDecisionPayload,
  ): Observable<RequestLoanDto> {
    const body = this.decisionBody(payload);
    return this.http
      .post<RequestLoanDto>(`${this.REQUEST_LOANS}/${idDemande}/approve`, body)
      .pipe(catchError(this.handleRequestLoanError));
  }

  rejectRequestLoan(
    idDemande: number,
    payload?: RequestLoanDecisionPayload,
  ): Observable<RequestLoanDto> {
    const body = this.decisionBody(payload);
    return this.http
      .post<RequestLoanDto>(`${this.REQUEST_LOANS}/${idDemande}/reject`, body)
      .pipe(catchError(this.handleRequestLoanError));
  }

  private decisionBody(payload?: RequestLoanDecisionPayload): RequestLoanDecisionPayload {
    const note = payload?.note?.trim();
    return note ? { note } : {};
  }

  private handleRequestLoanError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('Client error:', error.error);
    } else {
      console.error('Server error:', { status: error.status, message: error.message, body: error.error });
    }
    return throwError(() => error);
  }
}
