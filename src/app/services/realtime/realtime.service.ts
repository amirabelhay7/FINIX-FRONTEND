import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, interval } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';

export interface RealTimeTransaction {
  id: string;
  clientName: string;
  amount: number;
  type: 'cash' | 'bank' | 'check';
  status: 'completed' | 'pending' | 'failed';
  time: string;
  timestamp: number;
  agentId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RealTimeService {
  private baseUrl = 'http://localhost:8081/api/realtime';
  private transactionUpdates = new Subject<RealTimeTransaction[]>();
  
  constructor(private http: HttpClient) {
    this.startRealTimeUpdates();
  }

  // Get transaction updates as observable
  getTransactionUpdates(): Observable<RealTimeTransaction[]> {
    return this.transactionUpdates.asObservable();
  }

  // Start real-time polling for transactions
  private startRealTimeUpdates(): void {
    interval(30000) // Poll every 30 seconds
      .pipe(
        startWith(0),
        switchMap(() => this.getLatestTransactions())
      ).subscribe({
        next: (transactions) => {
          this.transactionUpdates.next(transactions);
        },
        error: (error) => {
          console.error('Real-time transaction update error:', error);
        }
      });
  }

  // Get latest transactions from server
  getLatestTransactions(): Observable<RealTimeTransaction[]> {
    return this.http.get<RealTimeTransaction[]>(`${this.baseUrl}/transactions/latest`);
  }

  // Get transactions since a specific timestamp
  getTransactionsSince(timestamp: number): Observable<RealTimeTransaction[]> {
    return this.http.get<RealTimeTransaction[]>(`${this.baseUrl}/transactions/since/${timestamp}`);
  }

  // Subscribe to agent-specific transaction updates
  subscribeToAgentTransactions(agentId: string): Observable<RealTimeTransaction[]> {
    return this.http.get<RealTimeTransaction[]>(`${this.baseUrl}/agent/${agentId}/transactions`);
  }

  // Manual refresh trigger
  refreshTransactions(): void {
    this.getLatestTransactions().subscribe({
      next: (transactions) => {
        this.transactionUpdates.next(transactions);
      }
    });
  }
}
