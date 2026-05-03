import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, TimeoutError, forkJoin, of } from 'rxjs';
import { catchError, finalize, mergeMap, timeout } from 'rxjs/operators';
import { InsuranceService } from '../../../../services/insurance/insurance.service';
import type {
  CoverageDto,
  CoverageRequestDto,
  CoverageStatisticsDto,
  DashboardAlertDto,
  DashboardKpisDto,
  InsuranceInstallmentDto,
  InsurancePartnerDto,
  InsurancePartnerRequestDto,
  InsurancePartnerStatusDto,
  InsuranceCreditRequestDto,
  InsurancePolicyDto,
  InsuranceProductDto,
  InsuranceProductRequestDto,
  PartnerStatisticsDto,
  PortfolioStatisticsDto,
  ProductCoverageRuleDto,
  ProductCoverageRuleRequestDto,
  ProductPricingRuleDto,
  ProductPricingRuleRequestDto,
  ProductStatusDto,
  ProductStatisticsDto,
  RenewalPolicyRowDto,
  ClaimSimulationDto,
  VehicleTypeDto,
  VehicleTypeStatisticsDto,
} from '../../../../models/insurance.model';

type InsTab =
  | 'dashboard'
  | 'partners'
  | 'products'
  | 'coverages'
  | 'rules'
  | 'pricing'
  | 'creditRequests'
  | 'policies'
  | 'claims'
  | 'statistics'
  | 'alerts'
  | 'renewals';

@Component({
  selector: 'app-insurance-admin',
  standalone: false,
  templateUrl: './insurance-admin.component.html',
  styleUrl: './insurance-admin.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class InsuranceAdminComponent implements OnInit {
  /** Default to CRUD tab so the shell is usable even if dashboard endpoints are missing or slow. */
  tab: InsTab = 'partners';

  /** Per-tab CRUD: each tab loads independently (no global forkJoin). */
  partnersLoading = false;
  productsLoading = false;
  coveragesLoading = false;
  rulesLoading = false;
  pricingLoading = false;

  partnersError = '';
  productsError = '';
  coveragesError = '';
  rulesError = '';
  pricingError = '';

  /** Avoid refetch when revisiting a tab unless forced or “Actualiser”. */
  partnersLoaded = false;
  productsLoaded = false;
  coveragesLoaded = false;
  rulesLoaded = false;
  pricingLoaded = false;

  /** Per-section loading so one failing/hanging request never blocks the whole page. */
  dashboardLoading = false;
  renewalsLoading = false;
  alertsLoading = false;
  statisticsLoading = false;
  policiesLoading = false;
  claimsLoading = false;
  creditRequestsLoading = false;

  dashboardError = '';
  renewalsError = '';
  alertsError = '';
  statisticsError = '';
  policiesError = '';
  claimsError = '';
  creditRequestsError = '';

  errorMsg = '';

  /** If any HTTP call hangs, stop waiting and show a recoverable error state. */
  private readonly httpTimeoutMs = 15000;

  private partnersLoadGen = 0;
  private productsLoadGen = 0;
  private coveragesLoadGen = 0;
  private rulesTabLoadGen = 0;
  private pricingTabLoadGen = 0;
  /** Product dropdown changes must not reuse the same generation as the full tab load (stale overwrites). */
  private pricingRulesSelectGen = 0;

  /** Ignore stale responses when the user switches tabs quickly and triggers overlapping loads. */
  private dashboardLoadGen = 0;
  private paymentLoadGen = 0;
  private renewalsLoadGen = 0;
  private alertsLoadGen = 0;
  private statisticsLoadGen = 0;
  private policiesLoadGen = 0;
  private claimsLoadGen = 0;
  private creditRequestsLoadGen = 0;

  partners: InsurancePartnerDto[] = [];
  products: InsuranceProductDto[] = [];
  coverages: CoverageDto[] = [];
  rules: ProductCoverageRuleDto[] = [];

  /* advanced views */
  dashboardKpis: DashboardKpisDto | null = null;
  dueSoon7: InsuranceInstallmentDto[] = [];
  dueSoon30: InsuranceInstallmentDto[] = [];
  overdueInstallments: InsuranceInstallmentDto[] = [];
  renewals7: RenewalPolicyRowDto[] = [];
  renewals30: RenewalPolicyRowDto[] = [];
  alerts: DashboardAlertDto[] = [];
  partnerStats: PartnerStatisticsDto[] = [];
  productStats: ProductStatisticsDto[] = [];
  coverageStats: CoverageStatisticsDto[] = [];
  portfolioStats: PortfolioStatisticsDto | null = null;
  vehicleTypeStats: VehicleTypeStatisticsDto[] = [];
  policies: InsurancePolicyDto[] = [];
  topExpensiveClaims: ClaimSimulationDto[] = [];
  creditRequests: InsuranceCreditRequestDto[] = [];
  pricingRules: ProductPricingRuleDto[] = [];
  pricingProductId: number | null = null;

  /* modals */
  showPartnerModal = false;
  showProductModal = false;
  showCoverageModal = false;
  showRuleModal = false;
  showPricingRuleModal = false;

  /* simple save locks to avoid double-submit creating duplicates */
  savingPartner = false;
  savingProduct = false;
  savingCoverage = false;
  savingRule = false;
  savingPricingRule = false;

  editingPartnerId: number | null = null;
  editingProductId: number | null = null;
  editingCoverageId: number | null = null;
  editingRuleId: number | null = null;
  editingPricingRuleId: number | null = null;

  partnerForm: InsurancePartnerRequestDto = this.emptyPartner();
  productForm: InsuranceProductRequestDto = this.emptyProduct();
  coverageForm: CoverageRequestDto = { code: '', name: '', description: '', status: 'ACTIVE' };
  ruleForm: ProductCoverageRuleRequestDto = {
    insuranceProductId: 0,
    coverageId: 0,
    coveragePct: 80,
    deductibleAmount: 0,
    limitAmount: null,
    ruleCode: '',
    ruleDescription: '',
  };

  pricingRuleForm: ProductPricingRuleRequestDto = {
    insuranceProductId: 0,
    vehicleType: 'CAR',
    minVehicleAge: null,
    maxVehicleAge: null,
    minVehicleValue: null,
    maxVehicleValue: null,
    rateMultiplier: 1,
    fixedSurcharge: 0,
    eligible: true,
    description: '',
  };

  constructor(
    private readonly api: InsuranceService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadPartners();
  }

  setTab(t: InsTab): void {
    this.tab = t;
    this.errorMsg = '';
    switch (t) {
      case 'dashboard':
        this.loadDashboard();
        this.loadPaymentMonitoring();
        break;
      case 'renewals':
        this.loadRenewals();
        break;
      case 'alerts':
        this.loadAlerts();
        break;
      case 'statistics':
        this.loadStatistics();
        break;
      case 'policies':
        this.loadPolicies();
        break;
      case 'creditRequests':
        this.loadCreditRequests();
        break;
      case 'claims':
        this.loadTopExpensiveClaims();
        break;
      case 'partners':
        this.loadPartners();
        break;
      case 'products':
        this.loadProducts();
        break;
      case 'coverages':
        this.loadCoverages();
        break;
      case 'rules':
        this.loadRulesTab();
        break;
      case 'pricing':
        this.loadPricingTab();
        break;
    }
  }

  /** Reloads data for the active tab only (force). */
  refreshCurrentTab(): void {
    this.errorMsg = '';
    switch (this.tab) {
      case 'partners':
        this.loadPartners(true);
        break;
      case 'products':
        this.loadProducts(true);
        break;
      case 'coverages':
        this.loadCoverages(true);
        break;
      case 'rules':
        this.loadRulesTab(true);
        break;
      case 'pricing':
        this.loadPricingTab(true);
        break;
      case 'dashboard':
        this.loadDashboard();
        this.loadPaymentMonitoring();
        break;
      case 'renewals':
        this.loadRenewals();
        break;
      case 'alerts':
        this.loadAlerts();
        break;
      case 'statistics':
        this.loadStatistics();
        break;
      case 'policies':
        this.loadPolicies();
        break;
      case 'creditRequests':
        this.loadCreditRequests();
        break;
      case 'claims':
        this.loadTopExpensiveClaims();
        break;
    }
  }

  /** True while the active tab’s primary request is in flight. */
  isCurrentTabLoading(): boolean {
    switch (this.tab) {
      case 'partners':
        return this.partnersLoading;
      case 'products':
        return this.productsLoading;
      case 'coverages':
        return this.coveragesLoading;
      case 'rules':
        return this.rulesLoading;
      case 'pricing':
        return this.pricingLoading;
      case 'dashboard':
        return this.dashboardLoading;
      case 'renewals':
        return this.renewalsLoading;
      case 'alerts':
        return this.alertsLoading;
      case 'statistics':
        return this.statisticsLoading;
      case 'policies':
        return this.policiesLoading;
      case 'claims':
        return this.claimsLoading;
      case 'creditRequests':
        return this.creditRequestsLoading;
      default:
        return false;
    }
  }

  loadPartners(force = false): void {
    if (!force && this.partnersLoaded) return;
    const gen = ++this.partnersLoadGen;
    this.partnersLoading = true;
    this.partnersError = '';
    this.api
      .getPartners()
      .pipe(
        timeout(this.httpTimeoutMs),
        catchError((e: unknown) => {
          console.error('[InsuranceAdmin] GET partners failed or timed out', e);
          if (gen === this.partnersLoadGen) {
            this.partners = [];
            this.partnersError = this.userFacingHttpError(e);
            this.partnersLoaded = true;
          }
          return EMPTY;
        }),
        finalize(() => {
          if (gen === this.partnersLoadGen) this.partnersLoading = false;
        }),
      )
      .subscribe({
        next: (rows) => {
          if (gen !== this.partnersLoadGen) return;
          this.partners = rows;
          this.partnersError = '';
          this.partnersLoaded = true;
        },
      });
  }

  loadProducts(force = false): void {
    if (!force && this.productsLoaded) return;
    const gen = ++this.productsLoadGen;
    this.productsLoading = true;
    this.productsError = '';
    this.api
      .getProducts()
      .pipe(
        timeout(this.httpTimeoutMs),
        catchError((e: unknown) => {
          console.error('[InsuranceAdmin] GET products failed or timed out', e);
          if (gen === this.productsLoadGen) {
            this.products = [];
            this.productsError = this.userFacingHttpError(e);
            this.productsLoaded = true;
          }
          return EMPTY;
        }),
        finalize(() => {
          if (gen === this.productsLoadGen) this.productsLoading = false;
        }),
      )
      .subscribe({
        next: (rows) => {
          if (gen !== this.productsLoadGen) return;
          this.products = rows;
          this.productsError = '';
          this.productsLoaded = true;
        },
      });
  }

  loadCoverages(force = false): void {
    if (!force && this.coveragesLoaded) return;
    const gen = ++this.coveragesLoadGen;
    this.coveragesLoading = true;
    this.coveragesError = '';
    this.api
      .getCoverages()
      .pipe(
        timeout(this.httpTimeoutMs),
        catchError((e: unknown) => {
          console.error('[InsuranceAdmin] GET coverages failed or timed out', e);
          if (gen === this.coveragesLoadGen) {
            this.coverages = [];
            this.coveragesError = this.userFacingHttpError(e);
            this.coveragesLoaded = true;
          }
          return EMPTY;
        }),
        finalize(() => {
          if (gen === this.coveragesLoadGen) this.coveragesLoading = false;
        }),
      )
      .subscribe({
        next: (rows) => {
          if (gen !== this.coveragesLoadGen) return;
          this.coverages = rows;
          this.coveragesError = '';
          this.coveragesLoaded = true;
        },
      });
  }

  /**
   * Rules tab needs rules + products + coverages (table + modals).
   * Single forkJoin here is scoped to this tab only (not whole page).
   */
  loadRulesTab(force = false): void {
    if (!force && this.rulesLoaded) return;
    const gen = ++this.rulesTabLoadGen;
    this.rulesLoading = true;
    this.rulesError = '';
    forkJoin({
      rules: this.safeList$(this.api.getProductCoverageRules(), 'GET product-coverage-rules'),
      products: this.safeList$(this.api.getProducts(), 'GET products (rules tab)'),
      coverages: this.safeList$(this.api.getCoverages(), 'GET coverages (rules tab)'),
    })
      .pipe(
        finalize(() => {
          if (gen === this.rulesTabLoadGen) this.rulesLoading = false;
        }),
      )
      .subscribe({
        next: (res) => {
          if (gen !== this.rulesTabLoadGen) return;
          this.rules = res.rules;
          this.products = res.products;
          this.coverages = res.coverages;
          this.rulesLoaded = true;
          this.productsLoaded = true;
          this.coveragesLoaded = true;
          this.rulesError = '';
          this.productsError = '';
          this.coveragesError = '';
        },
        error: (e: unknown) => {
          console.error('[InsuranceAdmin] rules tab forkJoin unexpected error', e);
          if (gen === this.rulesTabLoadGen) {
            this.rulesError = this.httpErrorMessage(e);
          }
        },
      });
  }

  loadDashboard(): void {
    const gen = ++this.dashboardLoadGen;
    this.dashboardLoading = true;
    this.dashboardError = '';
    this.api
      .getDashboardKpis()
      .pipe(
        timeout(this.httpTimeoutMs),
        catchError((e: unknown) => {
          console.error('[InsuranceAdmin] GET /dashboard/kpis failed or timed out', e);
          if (gen === this.dashboardLoadGen) {
            this.dashboardKpis = null;
            this.dashboardError = this.userFacingHttpError(e);
          }
          return of(null as DashboardKpisDto | null);
        }),
        finalize(() => {
          if (gen === this.dashboardLoadGen) {
            this.dashboardLoading = false;
            this.cdr.detectChanges();
          }
        }),
      )
      .subscribe({
        next: (k) => {
          if (gen !== this.dashboardLoadGen) return;
          this.dashboardKpis = this.normalizeDashboardKpis(k);
          if (!this.dashboardKpis && !this.dashboardError) {
            this.dashboardError = 'No KPI data received from backend.';
          }
          this.cdr.detectChanges();
        },
      });
  }

  loadPaymentMonitoring(): void {
    const gen = ++this.paymentLoadGen;
    // keep dashboardLoading as-is (avoid blocking KPI render if lists fail)
    forkJoin({
      due7: this.safeList$(this.api.getInstallmentsDueSoon(7), 'GET installments due-soon 7d'),
      due30: this.safeList$(this.api.getInstallmentsDueSoon(30), 'GET installments due-soon 30d'),
      overdue: this.safeList$(this.api.getOverdueInstallments(), 'GET installments overdue'),
    }).subscribe((res) => {
      if (gen !== this.dashboardLoadGen) return;
      this.dueSoon7 = res.due7;
      this.dueSoon30 = res.due30;
      this.overdueInstallments = res.overdue;
      this.cdr.detectChanges();
    });
  }

  markInstallmentPaid(row: InsuranceInstallmentDto): void {
    this.api.markInstallmentPaid(row.id).pipe(timeout(this.httpTimeoutMs)).subscribe({
      next: () => {
        this.loadDashboard();
        this.loadPaymentMonitoring();
      },
      error: (e) => {
        this.errorMsg = this.userFacingHttpError(e);
        this.cdr.detectChanges();
      },
    });
  }

  markInstallmentMissed(row: InsuranceInstallmentDto): void {
    this.api.markInstallmentMissed(row.id).pipe(timeout(this.httpTimeoutMs)).subscribe({
      next: () => {
        this.loadDashboard();
        this.loadPaymentMonitoring();
      },
      error: (e) => {
        this.errorMsg = this.userFacingHttpError(e);
        this.cdr.detectChanges();
      },
    });
  }

  daysLate(row: InsuranceInstallmentDto): number | null {
    if (!row?.dueDate) return null;
    const d = new Date(`${row.dueDate}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ms = today.getTime() - d.getTime();
    if (ms <= 0) return 0;
    return Math.floor(ms / (24 * 60 * 60 * 1000));
  }

  loadRenewals(): void {
    const gen = ++this.renewalsLoadGen;
    this.renewalsLoading = true;
    this.renewalsError = '';
    forkJoin({
      r7: this.safeList$(this.api.getRenewals(7), 'GET renewals days=7'),
      r30: this.safeList$(this.api.getRenewals(30), 'GET renewals days=30'),
    })
      .pipe(
        finalize(() => {
          if (gen === this.renewalsLoadGen) {
            this.renewalsLoading = false;
            this.cdr.detectChanges();
          }
        }),
      )
      .subscribe({
        next: (res) => {
          if (gen !== this.renewalsLoadGen) return;
          this.renewals7 = Array.isArray(res.r7) ? res.r7 : [];
          this.renewals30 = Array.isArray(res.r30) ? res.r30 : [];
          this.cdr.detectChanges();
        },
        error: (e: unknown) => {
          console.error('[InsuranceAdmin] renewals forkJoin unexpected error', e);
          if (gen === this.renewalsLoadGen) {
            this.renewals7 = [];
            this.renewals30 = [];
            this.renewalsError = this.httpErrorMessage(e);
            this.cdr.detectChanges();
          }
        },
      });
  }

  loadAlerts(): void {
    const gen = ++this.alertsLoadGen;
    this.alertsLoading = true;
    this.alertsError = '';
    this.api
      .getDashboardAlerts()
      .pipe(
        timeout(this.httpTimeoutMs),
        catchError((e: unknown) => {
          console.error('[InsuranceAdmin] GET /dashboard/alerts failed or timed out', e);
          if (gen === this.alertsLoadGen) {
            this.alerts = [];
            this.alertsError = this.userFacingHttpError(e);
          }
          return EMPTY;
        }),
        finalize(() => {
          if (gen === this.alertsLoadGen) {
            this.alertsLoading = false;
            this.cdr.detectChanges();
          }
        }),
      )
      .subscribe({
        next: (a) => {
          if (gen !== this.alertsLoadGen) return;
          this.alerts = Array.isArray(a) ? a : [];
          this.cdr.detectChanges();
        },
      });
  }

  loadStatistics(): void {
    const gen = ++this.statisticsLoadGen;
    this.statisticsLoading = true;
    this.statisticsError = '';
    forkJoin({
      portfolio: this.safeValue$(this.api.getPortfolioStatistics(), 'GET statistics/portfolio', null as PortfolioStatisticsDto | null),
      partners: this.safeList$(this.api.getPartnerStatistics(), 'GET statistics/partners'),
      products: this.safeList$(this.api.getProductStatistics(), 'GET statistics/products'),
      coverages: this.safeList$(this.api.getCoverageStatistics(), 'GET statistics/coverages'),
      vehicleTypes: this.safeList$(this.api.getVehicleTypeStatistics(), 'GET statistics/by-vehicle-type'),
    })
      .pipe(
        finalize(() => {
          if (gen === this.statisticsLoadGen) {
            this.statisticsLoading = false;
            this.cdr.detectChanges();
          }
        }),
      )
      .subscribe({
        next: (res) => {
          if (gen !== this.statisticsLoadGen) return;
          this.portfolioStats = res.portfolio;
          this.partnerStats = Array.isArray(res.partners) ? res.partners : [];
          this.productStats = Array.isArray(res.products) ? res.products : [];
          this.coverageStats = Array.isArray(res.coverages) ? res.coverages : [];
          this.vehicleTypeStats = Array.isArray(res.vehicleTypes) ? res.vehicleTypes : [];
          this.cdr.detectChanges();
        },
        error: (e: unknown) => {
          console.error('[InsuranceAdmin] statistics forkJoin unexpected error', e);
          if (gen === this.statisticsLoadGen) {
            this.portfolioStats = null;
            this.partnerStats = [];
            this.productStats = [];
            this.coverageStats = [];
            this.vehicleTypeStats = [];
            this.statisticsError = this.httpErrorMessage(e);
            this.cdr.detectChanges();
          }
        },
      });
  }

  loadPolicies(): void {
    const gen = ++this.policiesLoadGen;
    this.policiesLoading = true;
    this.policiesError = '';
    this.api
      .getPolicies()
      .pipe(
        timeout(this.httpTimeoutMs),
        catchError((e: unknown) => {
          console.error('[InsuranceAdmin] GET /policies failed or timed out', e);
          if (gen === this.policiesLoadGen) {
            this.policies = [];
            this.policiesError = this.userFacingHttpError(e);
          }
          return EMPTY;
        }),
        finalize(() => {
          if (gen === this.policiesLoadGen) {
            this.policiesLoading = false;
            this.cdr.detectChanges();
          }
        }),
      )
      .subscribe({
        next: (p) => {
          if (gen !== this.policiesLoadGen) return;
          this.policies = Array.isArray(p) ? p : [];
          this.cdr.detectChanges();
        },
      });
  }

  loadTopExpensiveClaims(): void {
    const gen = ++this.claimsLoadGen;
    this.claimsLoading = true;
    this.claimsError = '';
    this.api
      .getClaimSimulations()
      .pipe(
        timeout(this.httpTimeoutMs),
        catchError((e: unknown) => {
          console.error('[InsuranceAdmin] GET /claim-simulations failed or timed out', e);
          if (gen === this.claimsLoadGen) {
            this.topExpensiveClaims = [];
            this.claimsError = this.userFacingHttpError(e);
          }
          return of([] as ClaimSimulationDto[]);
        }),
        finalize(() => {
          if (gen === this.claimsLoadGen) {
            this.claimsLoading = false;
            this.cdr.detectChanges();
          }
        }),
      )
      .subscribe({
        next: (c) => {
          if (gen !== this.claimsLoadGen) return;
          this.topExpensiveClaims = Array.isArray(c) ? c : [];
          this.cdr.detectChanges();
        },
      });
  }

  loadCreditRequests(): void {
    const gen = ++this.creditRequestsLoadGen;
    this.creditRequestsLoading = true;
    this.creditRequestsError = '';
    this.api
      .getCreditRequests()
      .pipe(
        timeout(this.httpTimeoutMs),
        catchError((e: unknown) => {
          console.error('[InsuranceAdmin] GET /credit-requests failed or timed out', e);
          if (gen === this.creditRequestsLoadGen) {
            this.creditRequests = [];
            this.creditRequestsError = this.userFacingHttpError(e);
          }
          return of([] as InsuranceCreditRequestDto[]);
        }),
        finalize(() => {
          if (gen === this.creditRequestsLoadGen) {
            this.creditRequestsLoading = false;
            this.cdr.detectChanges();
          }
        }),
      )
      .subscribe({
        next: (rows) => {
          if (gen !== this.creditRequestsLoadGen) return;
          this.creditRequests = Array.isArray(rows) ? rows : [];
          this.cdr.detectChanges();
        },
      });
  }

  private normalizeDashboardKpis(raw: DashboardKpisDto | null | undefined): DashboardKpisDto | null {
    if (!raw || typeof raw !== 'object') return null;
    const src = raw as unknown as Record<string, unknown>;
    const num = (value: unknown, fallback = 0): number => {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
      return fallback;
    };
    return {
      totalPolicies: num(src['totalPolicies']),
      activePolicies: num(src['activePolicies']),
      suspendedPolicies: num(src['suspendedPolicies']),
      cancelledPolicies: num(src['cancelledPolicies']),
      expiredPolicies: num(src['expiredPolicies']),
      expiringIn7Days: num(src['expiringIn7Days']),
      expiringIn30Days: num(src['expiringIn30Days']),
      dueIn7DaysCount: num(src['dueIn7DaysCount']),
      dueIn30DaysCount: num(src['dueIn30DaysCount']),
      overdueCount: num(src['overdueCount']),
      dueIn7DaysAmount: num(src['dueIn7DaysAmount']),
      dueIn30DaysAmount: num(src['dueIn30DaysAmount']),
      overdueAmount: num(src['overdueAmount']),
      totalPremiumAmount: num(src['totalPremiumAmount'] ?? src['totalPremium']),
      averagePremiumPerPolicy: num(src['averagePremiumPerPolicy']),
      totalQuoteCount: num(src['totalQuoteCount']),
      totalSubscriptionsCount: num(src['totalSubscriptionsCount']),
      conversionRateQuotesToSubscriptionsPct: num(src['conversionRateQuotesToSubscriptionsPct']),
      conversionRateSubscriptionsToActivePoliciesPct: num(src['conversionRateSubscriptionsToActivePoliciesPct']),
      totalClaimSimulations: num(src['totalClaimSimulations'] ?? src['claimSimulations']),
      totalEstimatedPayoutAmount: num(src['totalEstimatedPayoutAmount']),
      averageEstimatedPayout: num(src['averageEstimatedPayout']),
      payoutRatio: num(src['payoutRatio']),
    };
  }

  approveCreditRequest(row: InsuranceCreditRequestDto): void {
    if (!this.isPendingCreditRequest(row)) return;
    this.api
      .approveCreditRequest(row.id)
      .pipe(timeout(this.httpTimeoutMs))
      .subscribe({
        next: () => this.loadCreditRequests(),
        error: (e) => {
          this.errorMsg = this.userFacingHttpError(e);
          this.cdr.detectChanges();
        },
      });
  }

  rejectCreditRequest(row: InsuranceCreditRequestDto): void {
    if (!this.isPendingCreditRequest(row)) return;
    const rejectionReason = window.prompt('Motif de rejet');
    if (!rejectionReason || !rejectionReason.trim()) return;
    const adminNote = window.prompt('Note admin (optionnel)') ?? '';
    this.api
      .rejectCreditRequest(row.id, { rejectionReason: rejectionReason.trim(), adminNote: adminNote.trim() || null })
      .pipe(timeout(this.httpTimeoutMs))
      .subscribe({
        next: () => this.loadCreditRequests(),
        error: (e) => {
          this.errorMsg = this.userFacingHttpError(e);
          this.cdr.detectChanges();
        },
      });
  }

  getCreditRequestClientName(row: InsuranceCreditRequestDto): string {
    const name = row.clientFullName?.trim();
    if (name) return name;
    const email = row.clientEmail?.trim();
    if (email) return email;
    const id = row.clientId ?? row.userId ?? null;
    if (id != null) return `Client #${id}`;
    return 'Unknown Client';
  }

  getCreditRequestClientSecondary(row: InsuranceCreditRequestDto): string | null {
    const email = row.clientEmail?.trim();
    if (email) return email;
    const phone = row.clientPhone?.trim();
    if (phone) return phone;
    return null;
  }

  getCreditRequestStatus(row: InsuranceCreditRequestDto): string {
    const s = (row.status ?? '').toString().trim().toUpperCase();
    return s || 'UNKNOWN';
  }

  isPendingCreditRequest(row: InsuranceCreditRequestDto): boolean {
    return this.getCreditRequestStatus(row) === 'PENDING';
  }

  getCreditRequestActionText(row: InsuranceCreditRequestDto): string {
    const st = this.getCreditRequestStatus(row);
    if (st === 'APPROVED') return 'Already Approved';
    if (st === 'REJECTED') return 'Rejected';
    if (st === 'CANCELLED') return 'Cancelled';
    return 'No Action';
  }

  getCreditRequestAiReasonPreview(row: InsuranceCreditRequestDto, maxLen = 90): string {
    const reason = (row.aiReason ?? '').trim();
    if (!reason) return '—';
    if (reason.length <= maxLen) return reason;
    return `${reason.slice(0, maxLen - 1).trimEnd()}…`;
  }

  formatCreditRequestDate(row: InsuranceCreditRequestDto): string {
    const raw = row.createdAt ?? ((row as unknown as { created_at?: string | null }).created_at ?? null);
    if (!raw) return '—';
    const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
    const dt = new Date(normalized);
    if (Number.isNaN(dt.getTime())) return '—';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dt);
  }

  /** Ensures forkJoin always completes: timeout + empty list on failure (logged). */
  private safeList$<T>(obs: Observable<T[]>, label: string): Observable<T[]> {
    return obs.pipe(
      timeout(this.httpTimeoutMs),
      catchError((e: unknown) => {
        console.error(`[InsuranceAdmin] ${label} failed or timed out`, e);
        return of([] as T[]);
      }),
    );
  }

  private safeValue$<T>(obs: Observable<T>, label: string, fallback: T): Observable<T> {
    return obs.pipe(
      timeout(this.httpTimeoutMs),
      catchError((e: unknown) => {
        console.error(`[InsuranceAdmin] ${label} failed or timed out`, e);
        return of(fallback);
      }),
    );
  }

  private userFacingHttpError(e: unknown): string {
    if (e instanceof TimeoutError) {
      return `Request timeout (${Math.round(this.httpTimeoutMs / 1000)}s) - server is not responding.`;
    }
    return this.httpErrorMessage(e);
  }

  private httpErrorMessage(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      const body = e.error;
      if (body && typeof body === 'object' && 'message' in body && typeof (body as { message: unknown }).message === 'string') {
        return (body as { message: string }).message;
      }
      if (e.status === 0) {
        return 'Network unavailable - verify backend is running (e.g. http://localhost:8081).';
      }
      return e.message || `Error HTTP ${e.status}`;
    }
    return 'Error API insurance';
  }

  private emptyPartner(): InsurancePartnerRequestDto {
    return {
      companyName: '',
      commissionPct: 5,
      rating: 4.5,
      totalPoliciesSold: 0,
      contactPhone: '',
      contactEmail: '',
      logoUrl: '',
      status: 'ACTIVE',
    };
  }

  private emptyProduct(): InsuranceProductRequestDto {
    const pid = this.partners[0]?.id ?? 0;
    return {
      name: '',
      description: '',
      conditionsPdfUrl: '',
      status: 'ACTIVE',
      popular: false,
      recommended: false,
      baseRatePct: 2.5,
      partnerId: pid,
      allowedVehicleTypes: ['CAR', 'MOTORCYCLE', 'TRUCK'],
    };
  }

  hasVehicleType(list: VehicleTypeDto[] | null | undefined, v: VehicleTypeDto): boolean {
    return (list ?? []).includes(v);
  }

  toggleVehicleType(v: VehicleTypeDto, checked: boolean): void {
    const cur = [...(this.productForm.allowedVehicleTypes ?? [])];
    const i = cur.indexOf(v);
    if (checked && i === -1) cur.push(v);
    if (!checked && i !== -1) cur.splice(i, 1);
    this.productForm.allowedVehicleTypes = cur.length ? cur : null;
  }

  /**
   * Pricing Rules — un seul flux (produits puis règles) pour éviter que finalize() du GET produits
   * ne remette loading à false pendant que le GET règles est encore en cours.
   */
  loadPricingTab(force = false): void {
    if (!force && this.pricingLoaded) return;
    const tabGen = ++this.pricingTabLoadGen;
    this.pricingLoading = true;
    this.pricingError = '';
    this.cdr.markForCheck();
    this.api
      .getProducts()
      .pipe(
        timeout(this.httpTimeoutMs),
        mergeMap((rows) => {
          if (tabGen !== this.pricingTabLoadGen) return EMPTY;
          this.products = Array.isArray(rows) ? rows : [];
          this.productsLoaded = true;
          if (this.pricingProductId == null && this.products.length) {
            this.pricingProductId = this.products[0].id;
          }
          const pid = this.pricingProductId;
          if (pid == null) {
            this.pricingRules = [];
            this.pricingLoaded = true;
            return of([] as ProductPricingRuleDto[]);
          }
          this.pricingError = '';
          return this.api.getProductPricingRules(pid).pipe(
            timeout(this.httpTimeoutMs),
            catchError((e: unknown) => {
              console.error('[InsuranceAdmin] GET product-pricing-rules failed', e);
              if (tabGen === this.pricingTabLoadGen) {
                this.pricingRules = [];
                this.pricingError = this.userFacingHttpError(e);
                this.pricingLoaded = true;
              }
              return of([] as ProductPricingRuleDto[]);
            }),
          );
        }),
        catchError((e: unknown) => {
          console.error('[InsuranceAdmin] GET products (pricing tab) failed', e);
          if (tabGen === this.pricingTabLoadGen) {
            this.products = [];
            this.pricingRules = [];
            this.pricingError = this.userFacingHttpError(e);
            this.pricingLoaded = true;
          }
          return of([] as ProductPricingRuleDto[]);
        }),
        finalize(() => {
          if (tabGen === this.pricingTabLoadGen) {
            this.pricingLoading = false;
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe((rules) => {
        if (tabGen !== this.pricingTabLoadGen) return;
        this.pricingRules = Array.isArray(rules) ? rules : [];
        this.pricingLoaded = true;
        this.cdr.markForCheck();
      });
  }

  onPricingProductChange(): void {
    if (this.pricingProductId == null) return;
    const tabGen = this.pricingTabLoadGen;
    const selGen = ++this.pricingRulesSelectGen;
    this.pricingLoading = true;
    this.pricingError = '';
    this.cdr.markForCheck();
    this.api
      .getProductPricingRules(this.pricingProductId)
      .pipe(
        timeout(this.httpTimeoutMs),
        catchError((e: unknown) => {
          console.error('[InsuranceAdmin] GET product-pricing-rules (select) failed', e);
          if (selGen === this.pricingRulesSelectGen && tabGen === this.pricingTabLoadGen) {
            this.pricingRules = [];
            this.pricingError = this.userFacingHttpError(e);
          }
          return of([] as ProductPricingRuleDto[]);
        }),
        finalize(() => {
          if (selGen === this.pricingRulesSelectGen) {
            this.pricingLoading = false;
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe((rules) => {
        if (selGen !== this.pricingRulesSelectGen || tabGen !== this.pricingTabLoadGen) return;
        this.pricingRules = Array.isArray(rules) ? rules : [];
        if (!this.pricingError) this.pricingError = '';
        this.cdr.markForCheck();
      });
  }

  /** Normalise les champs number du formulaire (évite "" / NaN → JSON invalide pour le backend). */
  private buildPricingRulePayload(): ProductPricingRuleRequestDto {
    const f = this.pricingRuleForm;
    const intOrNull = (v: unknown): number | null => {
      if (v === '' || v === undefined || v === null) return null;
      const n = typeof v === 'number' ? v : parseInt(String(v), 10);
      return Number.isFinite(n) ? n : null;
    };
    const decOrNull = (v: unknown): number | null => {
      if (v === '' || v === undefined || v === null) return null;
      const n = typeof v === 'number' ? v : parseFloat(String(v).replace(',', '.'));
      return Number.isFinite(n) ? n : null;
    };
    const rate = typeof f.rateMultiplier === 'number' ? f.rateMultiplier : parseFloat(String(f.rateMultiplier));
    const rawSurcharge = f.fixedSurcharge as unknown;
    const surcharge =
      rawSurcharge === '' || rawSurcharge === undefined || rawSurcharge === null
        ? 0
        : typeof rawSurcharge === 'number'
          ? rawSurcharge
          : parseFloat(String(rawSurcharge).replace(',', '.'));
    const pid = Number(f.insuranceProductId) || Number(this.pricingProductId);
    return {
      insuranceProductId: pid,
      vehicleType: f.vehicleType,
      minVehicleAge: intOrNull(f.minVehicleAge),
      maxVehicleAge: intOrNull(f.maxVehicleAge),
      minVehicleValue: decOrNull(f.minVehicleValue),
      maxVehicleValue: decOrNull(f.maxVehicleValue),
      rateMultiplier: Number.isFinite(rate) ? rate : NaN,
      fixedSurcharge: Number.isFinite(surcharge) ? surcharge : 0,
      eligible: Boolean(f.eligible),
      description: f.description?.trim() ? f.description.trim() : null,
    };
  }

  private validatePricingRuleFormClient(body: ProductPricingRuleRequestDto): string | null {
    if (!body.insuranceProductId || body.insuranceProductId < 1) {
      return 'Choisissez un produit.';
    }
    if (!body.vehicleType) return 'Vehicle type is required.';
    if (!Number.isFinite(body.rateMultiplier) || body.rateMultiplier < 0.0001) {
      return 'Multiplier must be a number >= 0.0001.';
    }
    if (!Number.isFinite(body.fixedSurcharge) || body.fixedSurcharge < 0) {
      return 'Fixed surcharge cannot be negative.';
    }
    if (
      body.minVehicleAge != null &&
      body.maxVehicleAge != null &&
      body.minVehicleAge > body.maxVehicleAge
    ) {
      return 'Minimum age cannot exceed maximum age.';
    }
    if (
      body.minVehicleValue != null &&
      body.maxVehicleValue != null &&
      body.minVehicleValue > body.maxVehicleValue
    ) {
      return 'Minimum value cannot exceed maximum value.';
    }
    return null;
  }

  openNewPricingRule(): void {
    if (this.pricingProductId == null) {
      this.errorMsg = 'Select a product.';
      return;
    }
    this.errorMsg = '';
    this.editingPricingRuleId = null;
    this.pricingRuleForm = {
      insuranceProductId: this.pricingProductId,
      vehicleType: 'CAR',
      minVehicleAge: null,
      maxVehicleAge: null,
      minVehicleValue: null,
      maxVehicleValue: null,
      rateMultiplier: 1,
      fixedSurcharge: 0,
      eligible: true,
      description: '',
    };
    this.showPricingRuleModal = true;
  }

  openEditPricingRule(r: ProductPricingRuleDto): void {
    this.errorMsg = '';
    this.editingPricingRuleId = r.id;
    this.pricingRuleForm = {
      insuranceProductId: r.insuranceProductId,
      vehicleType: r.vehicleType,
      minVehicleAge: r.minVehicleAge,
      maxVehicleAge: r.maxVehicleAge,
      minVehicleValue: r.minVehicleValue,
      maxVehicleValue: r.maxVehicleValue,
      rateMultiplier: Number(r.rateMultiplier),
      fixedSurcharge: Number(r.fixedSurcharge),
      eligible: r.eligible,
      description: r.description ?? '',
    };
    this.showPricingRuleModal = true;
  }

  savePricingRule(): void {
    if (this.savingPricingRule) return;
    const body = this.buildPricingRulePayload();
    const clientErr = this.validatePricingRuleFormClient(body);
    if (clientErr) {
      this.errorMsg = clientErr;
      this.cdr.markForCheck();
      return;
    }
    this.errorMsg = '';
    this.savingPricingRule = true;
    this.cdr.markForCheck();
    const obs =
      this.editingPricingRuleId == null
        ? this.api.createProductPricingRule(body)
        : this.api.updateProductPricingRule(this.editingPricingRuleId, body);
    obs.pipe(finalize(() => (this.savingPricingRule = false))).subscribe({
      next: () => {
        this.showPricingRuleModal = false;
        this.loadPricingTab(true);
        this.cdr.markForCheck();
      },
      error: (e: unknown) => {
        this.errorMsg = this.apiErrorDetail(e);
        this.cdr.markForCheck();
      },
    });
  }

  private apiErrorDetail(e: unknown): string {
    if (e instanceof HttpErrorResponse) {
      const b = e.error;
      if (b && typeof b === 'object' && 'message' in b && typeof (b as { message: unknown }).message === 'string') {
        return (b as { message: string }).message;
      }
      return e.message || `Error HTTP ${e.status}`;
    }
    return 'Network or server error';
  }

  deletePricingRule(r: ProductPricingRuleDto): void {
    if (!confirm('Delete this pricing rule?')) return;
    this.api.deleteProductPricingRule(r.id).subscribe({
      next: () => this.loadPricingTab(true),
      error: (e) => (this.errorMsg = e?.error?.message ?? 'Error'),
    });
  }

  openNewPartner(): void {
    this.editingPartnerId = null;
    this.partnerForm = this.emptyPartner();
    this.showPartnerModal = true;
  }

  openEditPartner(p: InsurancePartnerDto): void {
    this.editingPartnerId = p.id;
    this.partnerForm = {
      companyName: p.companyName,
      commissionPct: Number(p.commissionPct),
      rating: p.rating != null ? Number(p.rating) : null,
      totalPoliciesSold: p.totalPoliciesSold ?? 0,
      contactPhone: p.contactPhone ?? '',
      contactEmail: p.contactEmail ?? '',
      logoUrl: p.logoUrl ?? '',
      status: p.status,
    };
    this.showPartnerModal = true;
  }

  savePartner(): void {
    if (this.savingPartner) return;
    if (!this.partnerForm.companyName?.trim()) {
      this.errorMsg = 'Company name is required';
      return;
    }
    this.errorMsg = '';
    this.savingPartner = true;
    const req = this.partnerForm;
    const obs =
      this.editingPartnerId == null
        ? this.api.createPartner(req)
        : this.api.updatePartner(this.editingPartnerId, req);
    obs.subscribe({
      next: () => {
        this.showPartnerModal = false;
        this.savingPartner = false;
        this.productsLoaded = false;
        this.rulesLoaded = false;
        this.loadPartners(true);
      },
      error: (e) => {
        this.savingPartner = false;
        this.errorMsg = e?.error?.message ?? 'Error';
      },
    });
  }

  deletePartner(p: InsurancePartnerDto): void {
    if (!confirm(`Supprimer le partenaire « ${p.companyName} » ?`)) return;
    this.api.deletePartner(p.id).subscribe({
      next: () => {
        this.productsLoaded = false;
        this.rulesLoaded = false;
        this.loadPartners(true);
      },
      error: (e) => (this.errorMsg = e?.error?.message ?? 'Error'),
    });
  }

  openNewProduct(): void {
    if (!this.partnersLoaded) {
      this.errorMsg = 'Loading partners...';
      this.loadPartners(true);
      return;
    }
    if (!this.partners.length) {
      this.errorMsg = 'Create a partner first.';
      return;
    }
    this.editingProductId = null;
    this.productForm = this.emptyProduct();
    this.showProductModal = true;
  }

  openEditProduct(p: InsuranceProductDto): void {
    this.editingProductId = p.id;
    const av = p.allowedVehicleTypes?.length ? [...p.allowedVehicleTypes] : (['CAR', 'MOTORCYCLE', 'TRUCK'] as VehicleTypeDto[]);
    this.productForm = {
      name: p.name,
      description: p.description ?? '',
      conditionsPdfUrl: p.conditionsPdfUrl ?? '',
      status: p.status as ProductStatusDto,
      popular: p.popular,
      recommended: p.recommended,
      baseRatePct: Number(p.baseRatePct),
      partnerId: p.partnerId,
      allowedVehicleTypes: av,
    };
    this.showProductModal = true;
  }

  saveProduct(): void {
    if (this.savingProduct) return;
    if (!this.productForm.name?.trim() || !this.productForm.partnerId) {
      this.errorMsg = 'Name et partenaire requis';
      return;
    }
    this.errorMsg = '';
    this.savingProduct = true;
    const obs =
      this.editingProductId == null
        ? this.api.createProduct(this.productForm)
        : this.api.updateProduct(this.editingProductId, this.productForm);
    obs.subscribe({
      next: () => {
        this.showProductModal = false;
        this.savingProduct = false;
        this.rulesLoaded = false;
        this.pricingLoaded = false;
        this.loadProducts(true);
      },
      error: (e) => {
        this.savingProduct = false;
        this.errorMsg = e?.error?.message ?? 'Error';
      },
    });
  }

  deleteProduct(p: InsuranceProductDto): void {
    if (!confirm(`Supprimer le produit « ${p.name} » ?`)) return;
    this.api.deleteProduct(p.id).subscribe({
      next: () => {
        this.rulesLoaded = false;
        this.loadProducts(true);
      },
      error: (e) => (this.errorMsg = e?.error?.message ?? 'Error'),
    });
  }

  openNewCoverage(): void {
    this.editingCoverageId = null;
    this.coverageForm = { code: '', name: '', description: '', status: 'ACTIVE' };
    this.showCoverageModal = true;
  }

  openEditCoverage(c: CoverageDto): void {
    this.editingCoverageId = c.id;
    this.coverageForm = {
      code: c.code,
      name: c.name,
      description: c.description ?? '',
      status: c.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    };
    this.showCoverageModal = true;
  }

  saveCoverage(): void {
    if (this.savingCoverage) return;
    if (!this.coverageForm.code?.trim() || !this.coverageForm.name?.trim()) {
      this.errorMsg = 'Code et nom requis';
      return;
    }
    this.errorMsg = '';
    this.savingCoverage = true;
    const obs =
      this.editingCoverageId == null
        ? this.api.createCoverage(this.coverageForm)
        : this.api.updateCoverage(this.editingCoverageId, this.coverageForm);
    obs.subscribe({
      next: () => {
        this.showCoverageModal = false;
        this.savingCoverage = false;
        this.rulesLoaded = false;
        this.loadCoverages(true);
      },
      error: (e) => {
        this.savingCoverage = false;
        this.errorMsg = e?.error?.message ?? 'Error';
      },
    });
  }

  deleteCoverage(c: CoverageDto): void {
    if (!confirm(`Supprimer la couverture « ${c.code} » ?`)) return;
    this.api.deleteCoverage(c.id).subscribe({
      next: () => {
        this.rulesLoaded = false;
        this.loadCoverages(true);
      },
      error: (e) => (this.errorMsg = e?.error?.message ?? 'Error'),
    });
  }

  openNewRule(): void {
    if (this.rulesLoading) {
      this.errorMsg = 'Loading in progress...';
      return;
    }
    if (!this.products.length || !this.coverages.length) {
      this.errorMsg = 'Ajoutez au moins un produit et une couverture.';
      return;
    }
    this.editingRuleId = null;
    this.ruleForm = {
      insuranceProductId: this.products[0].id,
      coverageId: this.coverages[0].id,
      coveragePct: 80,
      deductibleAmount: 0,
      limitAmount: null,
      ruleCode: 'RULE-1',
      ruleDescription: '',
    };
    this.showRuleModal = true;
  }

  openEditRule(r: ProductCoverageRuleDto): void {
    this.editingRuleId = r.id;
    this.ruleForm = {
      insuranceProductId: r.insuranceProductId,
      coverageId: r.coverageId,
      coveragePct: Number(r.coveragePct),
      deductibleAmount: r.deductibleAmount != null ? Number(r.deductibleAmount) : 0,
      limitAmount: r.limitAmount != null ? Number(r.limitAmount) : null,
      ruleCode: r.ruleCode ?? '',
      ruleDescription: r.ruleDescription ?? '',
    };
    this.showRuleModal = true;
  }

  saveRule(): void {
    if (this.savingRule) return;
    if (!this.ruleForm.insuranceProductId || !this.ruleForm.coverageId) {
      this.errorMsg = 'Product and coverage are required';
      return;
    }
    this.errorMsg = '';
    this.savingRule = true;
    const obs =
      this.editingRuleId == null
        ? this.api.createProductCoverageRule(this.ruleForm)
        : this.api.updateProductCoverageRule(this.editingRuleId, this.ruleForm);
    obs.subscribe({
      next: () => {
        this.showRuleModal = false;
        this.savingRule = false;
        this.loadRulesTab(true);
      },
      error: (e) => {
        this.savingRule = false;
        this.errorMsg = e?.error?.message ?? 'Error';
      },
    });
  }

  deleteRule(r: ProductCoverageRuleDto): void {
    if (!confirm('Delete this rule?')) return;
    this.api.deleteProductCoverageRule(r.id).subscribe({
      next: () => this.loadRulesTab(true),
      error: (e) => (this.errorMsg = e?.error?.message ?? 'Error'),
    });
  }

  closeModals(): void {
    this.showPartnerModal = false;
    this.showProductModal = false;
    this.showCoverageModal = false;
    this.showRuleModal = false;
    this.showPricingRuleModal = false;
    this.savingPartner = false;
    this.savingProduct = false;
    this.savingCoverage = false;
    this.savingRule = false;
    this.savingPricingRule = false;
  }

  partnerStatusOptions: InsurancePartnerStatusDto[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
  productStatusOptions: ProductStatusDto[] = ['ACTIVE', 'AVAILABLE', 'PENDING_APPROVAL'];
  vehicleTypeOptions: VehicleTypeDto[] = ['CAR', 'MOTORCYCLE', 'TRUCK'];
}
