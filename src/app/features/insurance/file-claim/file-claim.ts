import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { TimeoutError } from 'rxjs';
import { InsuranceOption } from '../../../models';
import type { ClaimSimulationDto, CoverageDto, InsurancePolicyDto } from '../../../models/insurance.model';
import { InsuranceService } from '../../../services/insurance/insurance.service';

/**
 * Simulation de claim (estimation) — `/api/insurance/claim-simulations`.
 */
@Component({
  selector: 'app-file-claim',
  standalone: false,
  templateUrl: './file-claim.html',
  styleUrl: './file-claim.css',
})
export class FileClaim implements OnInit {
  readonly pageTitle = 'Simulation de remboursement';
  readonly pageSubtitle =
    'Estimate an indicative amount based on your policy and coverage. This is not a claim declaration.';
  readonly backRoute = '/client/insurance/my-policy';
  readonly policyLabel = 'Policy';
  readonly coverageLabel = 'Garantie';
  readonly incidentLabel = 'Date du claim';
  readonly amountLabel = 'Estimated Damage Amount (TND)';
  readonly descriptionLabel = 'Notes (facultatif)';
  readonly descriptionPlaceholder = 'Pour votre suivi interne…';
  readonly submitLabel = 'Lancer la simulation';
  readonly warningText =
    'This is estimate-only. Final reimbursement depends on actual claim validation.';

  policies: InsuranceOption[] = [];
  coverageOptions: InsuranceOption[] = [];

  policiesLoading = false;
  coveragesLoading = false;
  historyLoading = false;
  /** Error au chargement initial (policies + coverages). */
  initLoadError: string | null = null;

  history: ClaimSimulationDto[] = [];
  lastResult: ClaimSimulationDto | null = null;

  form: FormGroup;

  submitting = false;
  apiError: string | null = null;
  validationHint: string | null = null;

  private readonly httpTimeoutMs = 25000;
  private readonly forkJoinTimeoutMs = 35000;
  private initGen = 0;
  private historyGen = 0;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly insuranceApi: InsuranceService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      insurancePolicyId: ['', Validators.required],
      coverageId: ['', Validators.required],
      incidentDate: ['', Validators.required],
      estimatedDamageAmount: [0, [Validators.required, Validators.min(0.01)]],
      notes: [''],
    });
  }

  ngOnInit(): void {
    const pq = this.route.snapshot.queryParamMap.get('policyId');
    this.loadBootstrap(pq);
    const today = new Date().toISOString().slice(0, 10);
    this.form.patchValue({ incidentDate: today });
    this.refreshHistory();
  }

  retryBootstrap(): void {
    const pq = this.route.snapshot.queryParamMap.get('policyId');
    this.loadBootstrap(pq);
  }

  private loadBootstrap(pq: string | null): void {
    const g = ++this.initGen;
    this.initLoadError = null;
    this.policiesLoading = true;
    this.coveragesLoading = true;
    this.cdr.markForCheck();

    forkJoin({
      policies: this.insuranceApi.getMyPolicies().pipe(
        timeout(this.httpTimeoutMs),
        catchError(() => of([] as InsurancePolicyDto[])),
      ),
      coverages: this.insuranceApi.getCoverages().pipe(
        timeout(this.httpTimeoutMs),
        catchError(() => of([] as CoverageDto[])),
      ),
    })
      .pipe(
        timeout(this.forkJoinTimeoutMs),
        catchError(() => {
          if (g === this.initGen) {
            this.initLoadError =
              'Unable to load policies or coverages (timeout or network). Retry.';
          }
          return of({ policies: [] as InsurancePolicyDto[], coverages: [] as CoverageDto[] });
        }),
        finalize(() => {
          if (g === this.initGen) {
            this.policiesLoading = false;
            this.coveragesLoading = false;
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe({
        next: ({ policies, coverages }) => {
          if (g !== this.initGen) return;
          this.policies = policies.map((p) => ({
            value: String(p.id),
            label: `${p.policyNumber} · ${p.insuranceProductName}`,
          }));
          if (pq) this.form.patchValue({ insurancePolicyId: pq });
          else if (policies.length) this.form.patchValue({ insurancePolicyId: String(policies[0].id) });
          this.coverageOptions = coverages.map((c) => ({
            value: String(c.id),
            label: `${c.code} — ${c.name}`,
          }));
          if (coverages.length) this.form.patchValue({ coverageId: String(coverages[0].id) });
          this.cdr.markForCheck();
        },
      });
  }

  refreshHistory(): void {
    const g = ++this.historyGen;
    this.historyLoading = true;
    this.insuranceApi
      .getMyClaimSimulations()
      .pipe(
        timeout(this.httpTimeoutMs),
        catchError(() => of([] as ClaimSimulationDto[])),
        finalize(() => {
          if (g === this.historyGen) {
            this.historyLoading = false;
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe((list) => {
        if (g !== this.historyGen) return;
        this.history = Array.isArray(list) ? [...list].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)) : [];
        this.cdr.markForCheck();
      });
  }

  submit(): void {
    this.apiError = null;
    this.validationHint = null;
    this.lastResult = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.validationHint = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    const v = this.form.getRawValue();
    this.submitting = true;
    this.insuranceApi
      .createMyClaimSimulation({
        insurancePolicyId: Number(v.insurancePolicyId),
        coverageId: Number(v.coverageId),
        incidentDate: v.incidentDate!,
        estimatedDamageAmount: v.estimatedDamageAmount!,
      })
      .pipe(
        timeout(45000),
        finalize(() => {
          this.submitting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (sim) => {
          this.lastResult = sim;
          this.refreshHistory();
        },
        error: (err: unknown) => {
          if (err instanceof TimeoutError) {
            this.apiError = 'Request timeout - retry.';
            return;
          }
          const anyErr = err as { error?: { message?: string } };
          this.apiError = anyErr?.error?.message ?? 'Simulation rejected';
        },
      });
  }

  goDetail(id: number): void {
    void this.router.navigate(['/client/insurance/claims', id]);
  }
}
