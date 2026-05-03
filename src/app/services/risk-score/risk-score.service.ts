import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MlPredictionRequest {
  overdueCount: number;
  maxDaysOverdue: number;
  nbPenalties: number;
  penaltyTierMax: number;
  nbGraceApproved: number;
  nbGraceRejected: number;
  hasActiveCase: number;
  remainingInstallments: number;
  loanAmount: number;
}

export interface MlPredictionResponse {
  solvability: 'SOLVABLE' | 'NON_SOLVABLE';
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  graceRecommendation: 'APPROVE' | 'REJECT';
  recoveryAction: string;
  confidence: number;
  reasons: string[];
}

export interface RiskScoreResponse extends MlPredictionResponse {
  clientId: number;
  loanContractId: number;
  features: MlPredictionRequest;
}

@Injectable({ providedIn: 'root' })
export class RiskScoreService {

  private readonly API = 'http://localhost:8081/api/risk';

  constructor(private http: HttpClient) {}

  evaluate(clientId: number, contractId: number): Observable<RiskScoreResponse> {
    return this.http.get<RiskScoreResponse>(
      `${this.API}/evaluate/client/${clientId}/contract/${contractId}`
    );
  }

  predict(features: MlPredictionRequest): Observable<MlPredictionResponse> {
    return this.http.post<MlPredictionResponse>(`${this.API}/predict`, features);
  }
}
