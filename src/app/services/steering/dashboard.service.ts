import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MonthlyDefaultDTO {
  month: string;
  total: number;
  enRetard: number;
  tauxDefaut: number;
}

export interface DefaultRateSegmentDTO {
  segment: string;
  total: number;
  enRetard: number;
  tauxDefaut: number;
  recommendation: string;
}

export interface RiskIndicatorDTO {
  month: string;
  avgDelayDays: number;
  totalLoanAmount: number;
  atRiskAmount: number;
  riskPercentage: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  constat: string;
  recommendation: string;
  procedure: string;
}

export interface FinancialSteeringDashboard {
  totalInflow: number;
  totalOutflow: number;
  gainPercentage: number;
  lossPercentage: number;
  rendement: number;
  globalDefaultRate: number;
  defaultAlert: boolean;
  alertMessage: string;
  monthlyEvolution: MonthlyDefaultDTO[];
  riskIndicators: RiskIndicatorDTO[];
  defaultBySalary: DefaultRateSegmentDTO[];
  defaultByRegion: DefaultRateSegmentDTO[];
}
  // ─── Nouvelle interface ────────────────────────────────────────────────────
export interface AdvancedIndicatorsDTO {
  months: string[];
  yieldRates: number[];
  yieldInterpretation: string;
  gainRates: number[];
  gainRateInterpretation: string;
  clientCounts: number[];
  clientGrowthRates: number[];
  clientGrowthInterpretation: string;
  sharpeRatio: number;
  sharpeInterpretation: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private url = `${environment.apiUrl}/api/dashboard`;

  constructor(private http: HttpClient) {}

  getFullDashboard(): Observable<FinancialSteeringDashboard> {
    return this.http.get<FinancialSteeringDashboard>(this.url);
  }

  getDefaultRateBySalary(month: string): Observable<DefaultRateSegmentDTO[]> {
    return this.http.get<DefaultRateSegmentDTO[]>(`${this.url}/default-rate/salary`, {
      params: { month }
    });
  }

  getDefaultRateByRegion(month: string): Observable<DefaultRateSegmentDTO[]> {
    return this.http.get<DefaultRateSegmentDTO[]>(`${this.url}/default-rate/region`, {
      params: { month }
    });
  }

  getRiskIndicators(): Observable<RiskIndicatorDTO[]> {
    return this.http.get<RiskIndicatorDTO[]>(`${this.url}/risk-indicators`);
  }

  getAdvancedIndicators(): Observable<AdvancedIndicatorsDTO> {
    return this.http.get<AdvancedIndicatorsDTO>(`${this.url}/advanced-indicators`);
  }

}
