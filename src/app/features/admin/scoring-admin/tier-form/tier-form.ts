import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { UserTierRequest } from '../../../../models';
import { AdminFilterOption } from '../../../../models';

@Component({
  selector: 'app-tier-form',
  standalone: false,
  templateUrl: './tier-form.html',
  styleUrl: './tier-form.css',
})
export class TierForm implements OnInit {
  readonly pageTitle = 'User Tier';
  readonly pageSubtitle = 'Create or edit a tier (score range, benefits, status).';
  readonly backRoute = '/admin/scoring/tiers';
  readonly labelTierName = 'Tier name';
  readonly labelMinScore = 'Min score';
  readonly labelMaxScore = 'Max score';
  readonly labelTierColor = 'Tier color (CSS)';
  readonly labelBenefits = 'Benefits (text)';
  readonly labelNextTierMin = 'Next tier min score';
  readonly labelProgressionRequired = 'Progression required (text)';
  readonly placeholderTierName = 'e.g. BRONZE, SILVER, GOLD';
  readonly placeholderMinScore = '0';
  readonly placeholderMaxScore = '999';
  readonly placeholderTierColor = 'e.g. #CD7F32';
  readonly placeholderBenefits = 'e.g. Lower rates, priority support';
  readonly placeholderNextTier = 'Score needed for next tier';
  readonly placeholderProgression = 'e.g. Reach 500 points';
  readonly statusOptions: AdminFilterOption[] = [
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'INACTIVE', label: 'INACTIVE' },
  ];
  readonly saveLabel = 'Save';
  readonly cancelLabel = 'Cancel';

  id: number | null = null;
  loading = false;
  error: string | null = null;
  tierName = '';
  minScore: number | null = null;
  maxScore: number | null = null;
  tierColor = '';
  benefits = '';
  nextTierMinScore: number | null = null;
  progressionRequired = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.id = +idParam;
      this.loadTier();
    }
  }

  loadTier() {
    if (this.id == null) return;
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.getTierById(this.id).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (t) => {
        this.tierName = t.tierName ?? '';
        this.minScore = t.minScore ?? null;
        this.maxScore = t.maxScore ?? null;
        this.tierColor = t.tierColor ?? '';
        this.benefits = t.benefits ?? '';
        this.nextTierMinScore = t.nextTierMinScore ?? null;
        this.progressionRequired = t.progressionRequired ?? '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load tier';
        this.cdr.detectChanges();
      }
    });
  }

  buildRequest(): UserTierRequest {
    return {
      tierName: this.tierName.trim(),
      minScore: this.minScore ?? 0,
      maxScore: this.maxScore ?? 999,
      tierColor: this.tierColor.trim() || undefined,
      benefits: this.benefits.trim() || undefined,
      nextTierMinScore: this.nextTierMinScore ?? undefined,
      progressionRequired: this.progressionRequired.trim() || undefined,
    };
  }

  save() {
    if (!this.tierName.trim() || this.minScore == null || this.maxScore == null) {
      this.error = 'Tier name, min score and max score are required.';
      this.cdr.detectChanges();
      return;
    }
    if ((this.minScore ?? 0) > (this.maxScore ?? 0)) {
      this.error = 'Min score must be less than or equal to max score.';
      this.cdr.detectChanges();
      return;
    }
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    const req = this.buildRequest();
    const op = this.id != null
      ? this.scoreService.updateTier(this.id, req)
      : this.scoreService.createTier(req);
    op.pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); })).subscribe({
      next: () => this.router.navigate(['/admin/scoring/tiers']),
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Save failed';
        this.cdr.detectChanges();
      }
    });
  }
}
