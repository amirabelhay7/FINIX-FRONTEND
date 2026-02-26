import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WalletApi, TransactionApi, TransactionRequestApi } from '../../models';
import { AuthService } from '../auth/auth.service';

const API = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
  ) {}

  getMyWallet(): Observable<WalletApi> {
    return this.http.get<WalletApi>(`${API}/wallets/me`);
  }

  getMyTransactions(): Observable<TransactionApi[]> {
    return this.http.get<TransactionApi[]>(`${API}/wallets/me/transactions`);
  }

  getMyTransaction(id: number): Observable<TransactionApi> {
    return this.http.get<TransactionApi>(`${API}/wallets/me/transactions/${id}`);
  }

  deposit(amount: number, description?: string): Observable<WalletApi> {
    return this.http.post<WalletApi>(`${API}/wallets/me/deposit`, {
      amount,
      description: description ?? undefined,
    } as TransactionRequestApi);
  }

  withdraw(amount: number, description?: string): Observable<WalletApi> {
    return this.http.post<WalletApi>(`${API}/wallets/me/withdraw`, {
      amount,
      description: description ?? undefined,
    } as TransactionRequestApi);
  }

  transfer(targetEmail: string, amount: number, description?: string): Observable<WalletApi> {
    return this.http.post<WalletApi>(`${API}/wallets/me/transfer`, {
      amount,
      targetEmail,
      description: description ?? undefined,
    } as TransactionRequestApi);
  }

  /** Agent only: credit a client's wallet. */
  agentTopUp(clientEmail: string, amount: number, description?: string): Observable<WalletApi> {
    return this.http.post<WalletApi>(`${API}/wallets/agent/top-up`, {
      amount,
      targetEmail: clientEmail,
      description: description ?? undefined,
    } as TransactionRequestApi);
  }

  // ---------- Admin ----------

  getAllWalletsAdmin(): Observable<WalletApi[]> {
    return this.http.get<WalletApi[]>(`${API}/wallets/admin/all`);
  }

  getWalletByIdAdmin(walletId: number): Observable<WalletApi> {
    return this.http.get<WalletApi>(`${API}/wallets/admin/${walletId}`);
  }

  getWalletTransactionsAdmin(walletId: number): Observable<TransactionApi[]> {
    return this.http.get<TransactionApi[]>(`${API}/wallets/admin/${walletId}/transactions`);
  }

  updateWalletStatusAdmin(walletId: number, isActive: boolean): Observable<WalletApi> {
    return this.http.put<WalletApi>(`${API}/wallets/admin/${walletId}/status`, null, {
      params: { isActive: String(isActive) },
    });
  }

  deleteWalletAdmin(walletId: number): Observable<void> {
    return this.http.delete<void>(`${API}/wallets/admin/${walletId}`);
  }

  private adminOptions(): { headers?: HttpHeaders } {
    const token = this.auth.getToken();
    if (!token) return {};
    return {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
    };
  }

  /** Admin: fill (deposit) into any wallet. */
  adminDepositWallet(walletId: number, amount: number, description?: string): Observable<WalletApi> {
    return this.http.post<WalletApi>(
      `${API}/wallets/admin/${walletId}/deposit`,
      { amount, description: description ?? undefined } as TransactionRequestApi,
      this.adminOptions()
    );
  }

  /** Admin: deduct (withdraw) from any wallet. */
  adminWithdrawWallet(walletId: number, amount: number, description?: string): Observable<WalletApi> {
    return this.http.post<WalletApi>(
      `${API}/wallets/admin/${walletId}/withdraw`,
      { amount, description: description ?? undefined } as TransactionRequestApi,
      this.adminOptions()
    );
  }

  getAllTransactionsAdmin(): Observable<TransactionApi[]> {
    return this.http.get<TransactionApi[]>(`${API}/wallets/admin/transactions`);
  }

  getTransactionByIdAdmin(transactionId: number): Observable<TransactionApi> {
    return this.http.get<TransactionApi>(`${API}/wallets/transactions/${transactionId}`);
  }
}
