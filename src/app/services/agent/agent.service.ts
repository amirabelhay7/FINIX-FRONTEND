import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AgentStats {
  topUps: number;
  totalAmount: number;
  commission: number;
  clientsServed: number;
  cashBalance: number;
}

export interface DailySummary {
  date: string;
  topUps: number;
  totalAmount: number;
  commission: number;
  clientsServed: number;
}

export interface AgentPerformance {
  today: AgentStats;
  weekly: DailySummary[];
  monthly: DailySummary[];
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private baseUrl = 'http://localhost:8081/api/agent';

  constructor(private http: HttpClient) {}

  getAgentStats(): Observable<AgentStats> {
    return this.http.get<AgentStats>(`${this.baseUrl}/stats`);
  }

  getTodayStats(): Observable<AgentStats> {
    return this.http.get<AgentStats>(`${this.baseUrl}/stats/today`);
  }

  getCashBalance(): Observable<{ balance: number }> {
    return this.http.get<{ balance: number }>(`${this.baseUrl}/cash-balance`);
  }

  getPerformance(period: 'today' | 'week' | 'month'): Observable<AgentPerformance> {
    return this.http.get<AgentPerformance>(`${this.baseUrl}/performance/${period}`);
  }

  getRecentTransactions(limit: number = 10): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/transactions/recent?limit=${limit}`);
  }
}
