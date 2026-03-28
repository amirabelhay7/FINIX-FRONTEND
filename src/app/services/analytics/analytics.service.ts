import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:8081/api/wallet/admin/analytics';

  constructor(private http: HttpClient) {}

  // Dashboard Overview
  getDashboardAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  // Treasury Balance Trend
  getTreasuryBalanceTrend(days: number = 30): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/treasury-trend?days=${days}`);
  }

  // Transaction Volume Analytics
  getTransactionVolumeAnalytics(days: number = 30): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transaction-volume?days=${days}`);
  }

  // Wallet Statistics
  getWalletStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/wallet-statistics`);
  }

  // Limit Violations
  getLimitViolations(days: number = 30): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/limit-violations?days=${days}`);
  }
}
