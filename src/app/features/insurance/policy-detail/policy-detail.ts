import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, forkJoin, of } from 'rxjs';
import { catchError, finalize, map, switchMap, timeout } from 'rxjs/operators';
import { PolicyDetailItem } from '../../../models';
import type { ClaimSimulationDto, InsuranceInstallmentDto, InsurancePolicyDto, ProductCoverageRuleDto } from '../../../models/insurance.model';
import { InsuranceService } from '../../../services/insurance/insurance.service';

@Component({
  selector: 'app-policy-detail',
  standalone: false,
  templateUrl: './policy-detail.html',
  styleUrl: './policy-detail.css',
})
export class PolicyDetail implements OnInit {
  pageTitle = 'Policy';
  pageSubtitle = '';
  readonly backRoute = '/client/insurance/my-policy';
  readonly detailsTitle = 'Informations';
  readonly nextPaymentTitle = 'Installment';
  nextPaymentAmount = '—';
  nextPaymentDue = '';
  readonly payFromWalletLabel = 'Payer depuis le wallet →';
  readonly payFromWalletRoute = '/client/wallet';
  readonly claimsTitle = 'Simulations de claim (estimation)';
  readonly fileClaimLabel = 'Nouvelle simulation';
  readonly fileClaimRoute = '/client/insurance/simulation';
  readonly noClaimsText = 'No simulation pour cette policy.';
  readonly coveragesTitle = 'Coverages linked to product';

  details: PolicyDetailItem[] = [];
  policyClaims: ClaimSimulationDto[] = [];
  coverageRules: ProductCoverageRuleDto[] = [];
  policyId: number | null = null;
  loading = true;
  loadError: string | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly httpTimeoutMs = 25000;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly insuranceApi: InsuranceService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idStr = params.get('id');
          if (!idStr || !/^\d+$/.test(idStr)) {
            this.loading = false;
            this.loadError = 'Missing or invalid policy id.';
            this.policyId = null;
            this.cdr.markForCheck();
            return EMPTY;
          }
          const pid = Number(idStr);
          this.policyId = pid;
          this.loading = true;
          this.loadError = null;
          this.policyClaims = [];
          this.coverageRules = [];
          this.cdr.markForCheck();

          return this.insuranceApi.getMyPolicyById(pid).pipe(
            timeout(this.httpTimeoutMs),
            switchMap((pol: InsurancePolicyDto) =>
              forkJoin({
                claims: this.insuranceApi.getMyClaimSimulations(pid).pipe(
                  timeout(this.httpTimeoutMs),
                  catchError(() => of([] as ClaimSimulationDto[])),
                ),
                rules: this.insuranceApi.getProductCoverageRules(pol.insuranceProductId).pipe(
                  timeout(this.httpTimeoutMs),
                  catchError(() => of([] as ProductCoverageRuleDto[])),
                ),
                installments: this.insuranceApi.getPolicyInstallments(pid).pipe(
                  timeout(this.httpTimeoutMs),
                  catchError(() => of([] as InsuranceInstallmentDto[])),
                ),
              }).pipe(
                map((x) => ({
                  pol,
                  claims: x.claims,
                  rules: x.rules,
                  installments: x.installments,
                })),
              ),
            ),
            catchError((err: unknown) => {
              this.loadError =
                (err as { error?: { message?: string } })?.error?.message ??
                'Policy not found or server unavailable.';
              this.cdr.markForCheck();
              return EMPTY;
            }),
            finalize(() => {
              this.loading = false;
              this.cdr.markForCheck();
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((bundle) => {
        if (!bundle) return;
        this.applyPolicy(bundle.pol, bundle.installments);
        this.policyClaims = Array.isArray(bundle.claims) ? bundle.claims : [];
        this.coverageRules = Array.isArray(bundle.rules) ? bundle.rules : [];
        this.loadError = null;
        this.cdr.markForCheck();
      });
  }

  private applyPolicy(p: InsurancePolicyDto, installments: InsuranceInstallmentDto[]): void {
    this.pageTitle = p.policyNumber;
    this.pageSubtitle = `${p.insuranceProductName} · ${p.partnerCompanyName}`;
    const next = this.selectNextUnpaidInstallment(installments);
    this.nextPaymentAmount = `${p.installmentAmount} ${p.currencyCode}`;
    this.nextPaymentDue = next
      ? `Next Installment : ${this.formatDateFr(this.parseIsoDate(next.dueDate) ?? new Date(`${next.dueDate}T00:00:00`))}`
      : 'No installment restante';

    this.details = [
      { label: 'Product', value: p.insuranceProductName },
      { label: 'Partner', value: p.partnerCompanyName },
      { label: 'Total Premium', value: `${p.premiumTotal} ${p.currencyCode}` },
      { label: 'Installment (montant)', value: `${p.installmentAmount} ${p.currencyCode}` },
      { label: 'Frequency', value: this.freqLabel(p.paymentFrequency) },
      { label: 'Effet', value: p.effectiveDate ?? '—' },
      { label: 'End Date du contrat', value: p.expirationDate ?? '—' },
      { label: 'Next Installment', value: next ? next.dueDate : 'Contract Ended' },
      { label: 'Status', value: p.status },
      { label: 'Cancellation Until', value: p.cancellationAllowedUntil ?? '—' },
      { label: 'Days Remaining', value: p.daysRemaining != null ? String(p.daysRemaining) : '—' },
    ];
  }

  private freqLabel(f: InsurancePolicyDto['paymentFrequency'] | null | undefined): string {
    if (!f) return '—';
    if (f === 'WEEKLY') return 'Hebdomadaire';
    if (f === 'BIWEEKLY') return 'Bimensuel';
    if (f === 'MONTHLY') return 'Mensuel';
    return String(f);
  }

  private parseIsoDate(s: string | null | undefined): Date | null {
    if (!s) return null;
    // Expect YYYY-MM-DD (backend), keep at local midnight to avoid timezone drift in UI.
    const d = new Date(`${s}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private startOfDay(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }

  private formatDateFr(d: Date): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  }

  // Next payment is driven by InsuranceInstallment.dueDate (schedule),
  // not derived from expirationDate anymore.

  private selectNextUnpaidInstallment(list: InsuranceInstallmentDto[]): InsuranceInstallmentDto | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unpaid = (list ?? []).filter((x) => x.status !== 'PAID');
    if (!unpaid.length) return null;
    // Prefer overdue first, else next due >= today
    const overdue = unpaid
      .map((x) => ({ x, t: new Date(`${x.dueDate}T00:00:00`).getTime() }))
      .filter((r) => Number.isFinite(r.t))
      .filter((r) => r.t < today.getTime())
      .sort((a, b) => a.t - b.t);
    if (overdue.length) return overdue[0].x;
    const upcoming = unpaid
      .map((x) => ({ x, t: new Date(`${x.dueDate}T00:00:00`).getTime() }))
      .filter((r) => Number.isFinite(r.t))
      .filter((r) => r.t >= today.getTime())
      .sort((a, b) => a.t - b.t);
    return upcoming.length ? upcoming[0].x : null;
  }
}
