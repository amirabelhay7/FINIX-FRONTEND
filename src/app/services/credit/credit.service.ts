import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiUrl } from '../../core/config/api-url';

export interface LoanContractDto {
  id: number;
  numeroContrat: string;
  montantCredit: number;
  tauxInteret: number;
  dureeMois: number;
  montantTotalRembourse: number; // montant total à rembourser (montant du credit+frais de dossier)
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
  amount: number;        // en centimes (mensualite × 100)
  currency: string;      // 'eur'
  installmentNumber: number;
  userId: number;
  loanContractId: number;
  dueDate: string;       // YYYY-MM-DD
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
  dueDate: string; // YYYY-MM-DD
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

@Injectable({ providedIn: 'root' })
export class Credit {
  private readonly API         = apiUrl('/api/loans');
  private readonly PAY_API     = apiUrl('/api/payments');
  private readonly HISTORY_API = apiUrl('/api/payment-history');
  private readonly STRIPE_API  = apiUrl('/api/stripe');

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

  createStripePaymentIntent(dto: StripePaymentIntentRequestDto): Observable<StripePaymentIntentResponseDto> {
    return this.http.post<StripePaymentIntentResponseDto>(`${this.STRIPE_API}/create-payment-intent`, dto);
  }
}
