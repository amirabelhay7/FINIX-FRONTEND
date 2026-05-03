import { Component } from '@angular/core';
import {
  MlPredictionRequest,
  MlPredictionResponse,
  RiskScoreResponse,
  RiskScoreService,
} from '../../../../services/risk-score/risk-score.service';

@Component({
  selector: 'app-risk-score',
  standalone: false,
  templateUrl: './risk-score.html',
  styleUrl: './risk-score.css',
})
export class RiskScore {
  readonly pageTitle = 'AI Risk Score';
  readonly pageSubtitle = 'Predict client solvability, grace period and recovery action.';
  readonly backRoute = '/admin/repayments';

  // Onglet actif
  mode: 'auto' | 'manual' = 'manual';

  // Mode AUTO (depuis BDD)
  clientId: number | null = null;
  contractId: number | null = null;

  // Mode MANUAL (saisie features)
  features: MlPredictionRequest = {
    overdueCount: 0,
    maxDaysOverdue: 0,
    nbPenalties: 0,
    penaltyTierMax: 0,
    nbGraceApproved: 0,
    nbGraceRejected: 0,
    hasActiveCase: 0,
    remainingInstallments: 12,
    loanAmount: 10000,
  };

  loading = false;
  error: string | null = null;
  result: MlPredictionResponse | RiskScoreResponse | null = null;

  // Profils de demo
  readonly demoProfiles = [
    {
      name: 'Ahmed (bon payeur)',
      features: {
        overdueCount: 0, maxDaysOverdue: 0, nbPenalties: 0, penaltyTierMax: 0,
        nbGraceApproved: 0, nbGraceRejected: 0, hasActiveCase: 0,
        remainingInstallments: 6, loanAmount: 10000,
      } as MlPredictionRequest,
    },
    {
      name: 'Sarra (moyen)',
      features: {
        overdueCount: 3, maxDaysOverdue: 35, nbPenalties: 2, penaltyTierMax: 2,
        nbGraceApproved: 1, nbGraceRejected: 0, hasActiveCase: 0,
        remainingInstallments: 4, loanAmount: 15000,
      } as MlPredictionRequest,
    },
    {
      name: 'Karim (mauvais payeur)',
      features: {
        overdueCount: 7, maxDaysOverdue: 90, nbPenalties: 4, penaltyTierMax: 4,
        nbGraceApproved: 2, nbGraceRejected: 1, hasActiveCase: 1,
        remainingInstallments: 3, loanAmount: 20000,
      } as MlPredictionRequest,
    },
  ];

  constructor(private riskScoreService: RiskScoreService) {}

  loadProfile(profile: MlPredictionRequest) {
    this.features = { ...profile };
    this.result = null;
    this.error = null;
  }

  predictManual() {
    this.loading = true;
    this.error = null;
    this.result = null;

    this.riskScoreService.predict(this.features).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = this.formatError(err);
        this.loading = false;
      },
    });
  }

  predictAuto() {
    if (!this.clientId || !this.contractId) {
      this.error = 'Saisir clientId et contractId';
      return;
    }
    this.loading = true;
    this.error = null;
    this.result = null;

    this.riskScoreService.evaluate(this.clientId, this.contractId).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        this.error = this.formatError(err);
        this.loading = false;
      },
    });
  }

  private formatError(err: any): string {
    if (err?.status === 0) return 'Backend Spring inaccessible (port 8081). Lance Spring Boot.';
    if (err?.status === 500) return 'Erreur serveur — verifie que l\'API Python tourne sur localhost:8000.';
    return err?.error?.message || err?.message || 'Erreur inconnue';
  }

  // Helpers UI
  riskColorClass(): string {
    if (!this.result) return '';
    switch (this.result.riskLevel) {
      case 'LOW':      return 'bg-green-50 text-green-700 border-green-200';
      case 'MODERATE': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'HIGH':     return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
      default:         return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  solvabilityColorClass(): string {
    if (!this.result) return '';
    return this.result.solvability === 'SOLVABLE'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200';
  }

  graceColorClass(): string {
    if (!this.result) return '';
    return this.result.graceRecommendation === 'APPROVE'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200';
  }
}
