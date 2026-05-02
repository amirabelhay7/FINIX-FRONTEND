import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth/auth.service';
import {
  DelinquencyService,
  DelinquencyCaseDto,
} from '../../../services/delinquency/delinquency.service';

/**
 * Vue client : dossier de délinquance (MVVM).
 * Affiche le dossier du client connecté s'il en a un.
 */
@Component({
  selector: 'app-delinquency',
  standalone: false,
  templateUrl: './delinquency.html',
  styleUrl: './delinquency.css',
})
export class Delinquency implements OnInit {
  readonly pageTitle = 'Délinquance';
  readonly pageSubtitle = 'Suivi de votre situation de remboursement.';
  readonly scheduleRoute = '/repayment/schedule';
  readonly scheduleLabel = "Voir l'échéancier";
  readonly noOverdueTitle = 'Aucun impayé';
  readonly noOverdueText = 'Tous vos remboursements sont à jour.';
  readonly faqTitle = 'Que se passe-t-il si je manque un paiement ?';
  readonly faqText =
    "Nous envoyons des rappels avant et après l'échéance. Les retards peuvent impacter votre score et entraîner des pénalités. Contactez-nous en cas de difficulté.";

  loading = true;
  error = '';

  /** Dossier actif du client (null = aucun dossier = client à jour) */
  activeCase: DelinquencyCaseDto | null = null;

  constructor(
    private authService: AuthService,
    private delinquencyService: DelinquencyService,
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getPayload()?.userId;
    if (!userId) {
      this.loading = false;
      return;
    }

    this.delinquencyService.getCasesByClient(userId).subscribe({
      next: (cases) => {
        this.activeCase =
          cases.find((c) => c.status !== 'CLOSED' && c.status !== 'RECOVERED') ?? null;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les informations de votre dossier.';
        this.loading = false;
      },
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
      LOW: 'Faible',
      MODERATE: 'Modéré',
      HIGH: 'Élevé',
      CRITICAL: 'Critique',
    };
    return map[this.activeCase?.riskLevel ?? ''] ?? '';
  }

  get riskColor(): string {
    const map: Record<string, string> = {
      LOW: '#22c55e',
      MODERATE: '#f59e0b',
      HIGH: '#f97316',
      CRITICAL: '#ef4444',
    };
    return map[this.activeCase?.riskLevel ?? ''] ?? '#6b7280';
  }

  get statusLabel(): string {
    const map: Record<string, string> = {
      NEW: 'Nouveau',
      CONTACTED: 'Contacté',
      IN_PROGRESS: 'En cours',
      PLAN_ACTIVE: 'Plan de paiement actif',
      LEGAL: 'Procédure juridique',
      RECOVERED: 'Régularisé',
      CLOSED: 'Clôturé',
    };
    return map[this.activeCase?.status ?? ''] ?? '';
  }
}
