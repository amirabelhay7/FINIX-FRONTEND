import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import {
  DelinquencyService,
  DelinquencyCaseDto,
} from '../../../services/delinquency/delinquency.service';

@Component({
  selector: 'app-delinquency',
  standalone: false,
  templateUrl: './delinquency.html',
  styleUrl: './delinquency.css',
})
export class Delinquency implements OnInit {
  readonly scheduleRoute = '/repayment/schedule';

  loading = true;
  error = '';

  /** Dossier actif du client (null = aucun dossier = client à jour) */
  activeCase: DelinquencyCaseDto | null = null;

  paying = false;
  payError = '';

  constructor(
    private authService: AuthService,
    private delinquencyService: DelinquencyService,
  ) {}

  ngOnInit(): void {
    this.loadCase();
  }

  private loadCase(): void {
    const userId = this.authService.getPayload()?.userId;
    if (!userId) { this.loading = false; return; }

    this.delinquencyService.getCasesByClient(userId).subscribe({
      next: (cases) => {
        // Show any non-CLOSED case, including RECOVERED (situation réglée)
        this.activeCase = cases.find(c => c.status !== 'CLOSED') ?? null;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les informations de votre dossier.';
        this.loading = false;
      }
    });
  }

  get isRecovered(): boolean {
    return this.activeCase?.status === 'RECOVERED';
  }

  payNow(): void {
    if (!this.activeCase || this.paying) return;
    this.paying = true;
    this.payError = '';

    this.delinquencyService.payOverdue(this.activeCase.id).subscribe({
      next: (updated) => {
        this.activeCase = updated;
        this.paying = false;
      },
      error: () => {
        this.payError = 'Le paiement a échoué. Veuillez réessayer.';
        this.paying = false;
      }
    });
  }

  get categoryLabel(): string {
    const map: Record<string, string> = {
      FRIENDLY: 'Phase amiable',
      PRE_LEGAL: 'Phase pré-légale',
      LEGAL: 'Phase juridique',
      WRITTEN_OFF: 'Passé en pertes',
    };
    return map[this.activeCase?.category ?? ''] ?? this.activeCase?.category ?? '';
  }

  get riskLabel(): string {
    const map: Record<string, string> = {
      LOW: 'Faible', MODERATE: 'Modéré', HIGH: 'Élevé', CRITICAL: 'Critique',
    };
    return map[this.activeCase?.riskLevel ?? ''] ?? '';
  }

  get riskColor(): string {
    const map: Record<string, string> = {
      LOW: '#22c55e', MODERATE: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444',
    };
    return map[this.activeCase?.riskLevel ?? ''] ?? '#6b7280';
  }

  get statusLabel(): string {
    const map: Record<string, string> = {
      NEW: 'Nouveau', CONTACTED: 'Contacté', IN_PROGRESS: 'En cours',
      PLAN_ACTIVE: 'Plan de paiement actif', LEGAL: 'Procédure juridique',
      RECOVERED: 'Situation réglée', CLOSED: 'Clôturé',
    };
    return map[this.activeCase?.status ?? ''] ?? '';
  }
}
