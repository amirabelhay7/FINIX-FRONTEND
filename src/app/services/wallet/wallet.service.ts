import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WalletApi {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  accountNumber: string;
  isActive: boolean;
  clientEmail: string;
  clientName: string;
  clientDeleted: boolean;
}

export interface TransactionApi {
  id: number;
  amount: number;
  transactionType: string;
  status: string;
  description: string;
  transactionDate: string;
  referenceNumber: string;
  clientEmail: string;
  walletAccountNumber: string;
}

export interface TransactionRequest {
  amount: number;
  description?: string;
  targetEmail?: string;
}

@Injectable({ providedIn: 'root' })
export class WalletService {
  private base = 'http://localhost:8081/api/wallet';

  constructor(private http: HttpClient) {}

  // ─── Current user ──────────────────────────────────────────────────────────

  getMyWallet(): Observable<WalletApi> {
    return this.http.get<WalletApi>(`${this.base}/me`);
  }

  getMyTransactions(): Observable<TransactionApi[]> {
    return this.http.get<TransactionApi[]>(`${this.base}/me/transactions`);
  }

  getMyTransaction(id: number): Observable<TransactionApi> {
    return this.http.get<TransactionApi>(`${this.base}/me/transactions/${id}`);
  }

  deposit(req: TransactionRequest): Observable<WalletApi> {
    return this.http.post<WalletApi>(`${this.base}/me/deposit`, req);
  }

  withdraw(req: TransactionRequest): Observable<WalletApi> {
    return this.http.post<WalletApi>(`${this.base}/me/withdraw`, req);
  }

  transfer(req: TransactionRequest): Observable<WalletApi> {
    return this.http.post<WalletApi>(`${this.base}/me/transfer`, req);
  }

  // ─── Agent ─────────────────────────────────────────────────────────────────

  agentTopUp(req: TransactionRequest): Observable<WalletApi> {
    return this.http.post<WalletApi>(`${this.base}/agent/top-up`, req);
  }

  // ─── Admin ─────────────────────────────────────────────────────────────────

  getAllWalletsAdmin(): Observable<WalletApi[]> {
    return this.http.get<WalletApi[]>(`${this.base}/admin/wallets`);
  }

  adminGetAllWallets(): Observable<WalletApi[]> {
    return this.http.get<WalletApi[]>(`${this.base}/admin/wallets`);
  }

  adminGetWallet(userId: number): Observable<WalletApi> {
    return this.http.get<WalletApi>(`${this.base}/admin/wallets/${userId}`);
  }

  adminGetUserTransactions(userId: number): Observable<TransactionApi[]> {
    return this.http.get<TransactionApi[]>(`${this.base}/admin/wallets/${userId}/transactions`);
  }

  adminGetAllTransactions(): Observable<TransactionApi[]> {
    return this.http.get<TransactionApi[]>(`${this.base}/admin/transactions`);
  }

  adminCredit(userId: number, req: TransactionRequest): Observable<WalletApi> {
    return this.http.post<WalletApi>(`${this.base}/admin/credit/${userId}`, req);
  }

  adminFreezeAccount(userId: number): Observable<WalletApi> {
    return this.http.post<WalletApi>(`${this.base}/admin/freeze/${userId}`, {});
  }

  adminInvalidateLedger(userId: number): Observable<WalletApi> {
    return this.http.post<WalletApi>(`${this.base}/admin/invalidate-ledger/${userId}`, {});
  }

  getTransactionById(id: number): Observable<TransactionApi> {
    return this.http.get<TransactionApi>(`${this.base}/transactions/${id}`);
  }
}
