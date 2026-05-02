import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PenaltyTierConfig, PenaltyTierService, PenaltyTierUpdateDTO } from '../../../../services/repayment/penalty-tier.service';

@Component({
  selector: 'app-penalty-tiers',
  standalone: false,
  templateUrl: './penalty-tiers.html',
  styleUrl: './penalty-tiers.css',
})
export class PenaltyTiers implements OnInit {

  @Output() backClicked = new EventEmitter<void>();

  tiers: PenaltyTierConfig[] = [];
  loading = false;
  editingTier: string | null = null;
  saving = false;
  successTier: string | null = null;
  errorMsg: string | null = null;

  form: PenaltyTierUpdateDTO = {
    label: '', minDays: 0, maxDays: 0,
    rate: 0, relanceFee: 0, active: true, updatedBy: ''
  };

  constructor(private tierService: PenaltyTierService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.errorMsg = null;

    const fallback = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.errorMsg = 'Délai dépassé (10s). Vérifiez que Spring Boot et MySQL sont bien démarrés sur le port 8082.';
      }
    }, 10000);

    this.tierService.getAll().subscribe({
      next: data => {
        clearTimeout(fallback);
        this.tiers = data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        clearTimeout(fallback);
        this.errorMsg = err.status === 0
          ? 'Serveur Spring inaccessible (port 8082). Démarrez le backend.'
          : `Erreur ${err.status} : impossible de charger les paliers.`;
        this.loading = false;
      }
    });
  }

  goBack() {
    this.backClicked.emit();
  }

  startEdit(t: PenaltyTierConfig) {
    this.editingTier = t.tier;
    this.successTier = null;
    this.errorMsg = null;
    this.form = {
      label: t.label,
      minDays: t.minDays,
      maxDays: t.maxDays,
      rate: +(t.rate * 100).toFixed(2),
      relanceFee: t.relanceFee,
      active: t.active,
      updatedBy: ''
    };
  }

  cancelEdit() {
    this.editingTier = null;
    this.errorMsg = null;
  }

  save(tier: string) {
    if (!this.form.updatedBy.trim()) {
      this.errorMsg = 'Veuillez saisir votre identifiant admin.';
      return;
    }
    this.saving = true;
    this.errorMsg = null;

    const dto: PenaltyTierUpdateDTO = {
      ...this.form,
      rate: this.form.rate / 100
    };

    this.editingTier = null;
    this.saving = false;

    this.tierService.update(tier, dto).subscribe({
      next: () => {
        setTimeout(() => {
          this.tierService.getAll().subscribe({
            next: data => {
              this.tiers = [...data];
              this.successTier = tier;
              setTimeout(() => { this.successTier = null; }, 3000);
            }
          });
        }, 0);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMsg = err.status === 0
          ? 'Serveur Spring inaccessible (port 8082).'
          : `Erreur ${err.status} : ${err.error?.message || 'sauvegarde impossible.'}`;
      }
    });
  }

  riskColor(tier: string): string {
    const map: Record<string, string> = {
      TIER_1: 'bg-green-100 text-green-700',
      TIER_2: 'bg-amber-100 text-amber-700',
      TIER_3: 'bg-orange-100 text-orange-700',
      TIER_4: 'bg-red-100 text-red-700',
      TIER_5: 'bg-red-200 text-red-900',
    };
    return map[tier] ?? 'bg-gray-100 text-gray-700';
  }

  badgeStyle(tier: string): { [key: string]: string } {
    const map: Record<string, { background: string; color: string }> = {
      TIER_1: { background: '#dcfce7', color: '#166534' },
      TIER_2: { background: '#fef9c3', color: '#854d0e' },
      TIER_3: { background: '#ffedd5', color: '#9a3412' },
      TIER_4: { background: '#fee2e2', color: '#991b1b' },
      TIER_5: { background: '#fecaca', color: '#7f1d1d' },
    };
    return map[tier] ?? { background: '#f3f4f6', color: '#374151' };
  }
}
