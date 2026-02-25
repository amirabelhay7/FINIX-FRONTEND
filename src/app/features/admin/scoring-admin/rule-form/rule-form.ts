import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { ScoreConfigRequest } from '../../../../models';
import { AdminFilterOption } from '../../../../models';

@Component({
  selector: 'app-rule-form',
  standalone: false,
  templateUrl: './rule-form.html',
  styleUrl: './rule-form.css',
})
export class RuleForm implements OnInit {
  readonly pageTitle = 'Scoring Rule';
  readonly pageSubtitle = 'Create or edit a scoring rule (ScoreConfig).';
  readonly backRoute = '/admin/scoring/rules';
  readonly labelRuleName = 'Rule name';
  readonly labelRuleType = 'Rule type';
  readonly labelPoints = 'Points';
  readonly labelDescription = 'Description';
  readonly labelDepositThreshold = 'Deposit threshold (optional)';
  readonly labelMaxGuarantees = 'Max guarantees per user (optional)';
  readonly labelGuaranteePoints = 'Guarantee points (optional)';
  readonly placeholderRuleName = 'e.g. CIN verification';
  readonly placeholderType = 'Select type';
  readonly placeholderPoints = 'e.g. 50';
  readonly placeholderDescription = 'Short description of the rule';
  readonly placeholderDeposit = 'For WALLET_DEPOSIT';
  readonly placeholderMaxGuarantees = 'For GUARANTEE_RECEIVED';
  readonly placeholderGuaranteePoints = 'For GUARANTEE_RECEIVED';
  readonly typeOptions: AdminFilterOption[] = [
    { value: '', label: 'Select type' },
    { value: 'DOCUMENT_VERIFICATION', label: 'DOCUMENT_VERIFICATION' },
    { value: 'PROFILE_COMPLETION', label: 'PROFILE_COMPLETION' },
    { value: 'WALLET_DEPOSIT', label: 'WALLET_DEPOSIT' },
    { value: 'GUARANTEE_RECEIVED', label: 'GUARANTEE_RECEIVED' },
  ];
  readonly saveLabel = 'Save';
  readonly cancelLabel = 'Cancel';
  readonly cancelRoute = '/admin/scoring/rules';

  id: number | null = null;
  loading = false;
  error: string | null = null;
  ruleName = '';
  ruleType = '';
  points: number | null = null;
  description = '';
  depositThreshold: number | null = null;
  maxGuaranteesPerUser: number | null = null;
  guaranteePoints: number | null = null;

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
      this.loadRule();
    }
  }

  loadRule() {
    if (this.id == null) return;
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.getRuleById(this.id).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (r) => {
        this.ruleName = r.ruleName ?? '';
        this.ruleType = r.ruleType ?? '';
        this.points = r.points ?? null;
        this.description = r.description ?? '';
        this.depositThreshold = r.depositThreshold ?? null;
        this.maxGuaranteesPerUser = r.maxGuaranteesPerUser ?? null;
        this.guaranteePoints = r.guaranteePoints ?? null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load rule';
        this.cdr.detectChanges();
      }
    });
  }

  buildRequest(): ScoreConfigRequest {
    return {
      ruleName: this.ruleName.trim(),
      ruleType: this.ruleType,
      points: this.points ?? 0,
      description: this.description.trim() || undefined,
      depositThreshold: this.depositThreshold ?? undefined,
      maxGuaranteesPerUser: this.maxGuaranteesPerUser ?? undefined,
      guaranteePoints: this.guaranteePoints ?? undefined,
    };
  }

  save() {
    if (!this.ruleName.trim() || !this.ruleType || (this.points ?? 0) < 1) {
      this.error = 'Rule name, type and points (≥1) are required.';
      this.cdr.detectChanges();
      return;
    }
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    const req = this.buildRequest();
    const op = this.id != null
      ? this.scoreService.updateRule(this.id, req)
      : this.scoreService.createRule(req);
    op.pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); })).subscribe({
      next: () => this.router.navigate(['/admin/scoring/rules']),
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Save failed';
        this.cdr.detectChanges();
      }
    });
  }
}
