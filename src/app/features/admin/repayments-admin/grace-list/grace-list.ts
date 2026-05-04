import { Component, OnInit } from '@angular/core';
import {
  GracePeriodRequestResponseDto,
  GracePeriodRequestService,
} from '../../../../services/grace-period-request/grace-period-request.service';
import {
  MlPredictionResponse,
  RiskScoreResponse,
  RiskScoreService,
} from '../../../../services/risk-score/risk-score.service';

@Component({
  selector: 'app-grace-list',
  standalone: false,
  templateUrl: './grace-list.html',
  styleUrl: './grace-list.css',
})
export class GraceList implements OnInit {
  readonly pageTitle = 'Grace Period Requests';
  readonly pageSubtitle = 'Review pending requests with AI-powered recommendations.';
  readonly backRoute = '/admin/repayments';

  requests: GracePeriodRequestResponseDto[] = [];
  loadingList = false;

  // Modal state
  modalOpen = false;
  selectedRequest: GracePeriodRequestResponseDto | null = null;
  mlLoading = false;
  mlResult: RiskScoreResponse | MlPredictionResponse | null = null;
  mlError: string | null = null;

  // Decision state
  decisionLoading = false;
  decisionError: string | null = null;
  rejectionReason = '';

  constructor(
    private graceService: GracePeriodRequestService,
    private riskService: RiskScoreService,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loadingList = true;
    this.graceService.getAll().subscribe({
      next: (data) => {
        this.requests = data;
        this.loadingList = false;
      },
      error: () => {
        this.requests = [];
        this.loadingList = false;
      },
    });
  }

  // ── MODAL ──
  openDecisionModal(request: GracePeriodRequestResponseDto): void {
    this.selectedRequest = request;
    this.modalOpen = true;
    this.mlResult = null;
    this.mlError = null;
    this.decisionError = null;
    this.rejectionReason = '';

    this.fetchMlPrediction(request);
  }

  closeModal(): void {
    this.modalOpen = false;
    this.selectedRequest = null;
    this.mlResult = null;
    this.mlError = null;
  }

  fetchMlPrediction(request: GracePeriodRequestResponseDto): void {
    this.mlLoading = true;
    this.riskService.evaluate(request.clientId, request.loanContractId).subscribe({
      next: (res) => {
        this.mlResult = res;
        this.mlLoading = false;
      },
      error: (err) => {
        this.mlError = this.formatError(err);
        this.mlLoading = false;
      },
    });
  }

  // ── DECISION ──
  approve(): void {
    if (!this.selectedRequest) return;
    const reviewedById = this.getCurrentUserId();
    if (!reviewedById) {
      this.decisionError = 'User not authenticated';
      return;
    }

    this.decisionLoading = true;
    this.decisionError = null;
    this.graceService.approve(this.selectedRequest.id, { reviewedById }).subscribe({
      next: () => {
        this.decisionLoading = false;
        this.closeModal();
        this.loadRequests();
      },
      error: (err) => {
        this.decisionError = this.formatError(err);
        this.decisionLoading = false;
      },
    });
  }

  reject(): void {
    if (!this.selectedRequest) return;
    if (!this.rejectionReason.trim()) {
      this.decisionError = 'Rejection reason is required';
      return;
    }
    const reviewedById = this.getCurrentUserId();
    if (!reviewedById) {
      this.decisionError = 'User not authenticated';
      return;
    }

    this.decisionLoading = true;
    this.decisionError = null;
    this.graceService.reject(this.selectedRequest.id, {
      reviewedById,
      rejectionReason: this.rejectionReason,
    }).subscribe({
      next: () => {
        this.decisionLoading = false;
        this.closeModal();
        this.loadRequests();
      },
      error: (err) => {
        this.decisionError = this.formatError(err);
        this.decisionLoading = false;
      },
    });
  }

  // ── HELPERS ──
  private getCurrentUserId(): number | null {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    try {
      const user = JSON.parse(raw);
      return user.userId ?? null;
    } catch {
      return null;
    }
  }

  private formatError(err: any): string {
    if (err?.status === 0) return 'Backend Spring inaccessible (port 8081).';
    if (err?.status === 500) return 'Server error — verify Python ML API is running on port 8000.';
    return err?.error?.message || err?.message || 'Unknown error';
  }

  statusClass(status: string): string {
    switch (status) {
      case 'PENDING':  return 'bg-yellow-50 text-yellow-700';
      case 'APPROVED': return 'bg-green-50 text-green-700';
      case 'REJECTED': return 'bg-red-50 text-red-700';
      default:         return 'bg-gray-50 text-gray-700';
    }
  }

  riskColorClass(): string {
    if (!this.mlResult) return '';
    switch (this.mlResult.riskLevel) {
      case 'LOW':      return 'bg-green-50 text-green-700 border-green-200';
      case 'MODERATE': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'HIGH':     return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CRITICAL': return 'bg-red-50 text-red-700 border-red-200';
      default:         return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  solvabilityColorClass(): string {
    if (!this.mlResult) return '';
    return this.mlResult.solvability === 'SOLVABLE'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200';
  }

  graceColorClass(): string {
    if (!this.mlResult) return '';
    return this.mlResult.graceRecommendation === 'APPROVE'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200';
  }
}
