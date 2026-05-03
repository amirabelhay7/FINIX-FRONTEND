import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EMPTY, forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap, timeout } from 'rxjs/operators';
import { InsuranceService } from '../../../services/insurance/insurance.service';
import type { InsuranceProductDto, ProductCoverageRuleDto, VehicleTypeDto } from '../../../models/insurance.model';

@Component({
  selector: 'app-product-detail',
  standalone: false,
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  pageTitle = 'Product';
  pageSubtitle = '';
  readonly backRoute = '/client/insurance/products';
  readonly premiumLabel = 'Taux de base';
  premiumValue = '—';
  readonly partnerLabel = 'Partner';
  partnerName = '—';
  readonly descriptionLabel = 'Description';
  descriptionText = '';
  readonly eligibilityLabel = 'Eligible Vehicles';
  eligibilityLines: string[] = [];
  readonly getQuoteLabel = 'Devis estimatif';
  readonly getQuoteRoute = '/client/insurance/quote';
  readonly creditRequestLabel = 'Insurance Credit Request';
  readonly creditRequestRoute = '/client/insurance/credit-requests/new';
  readonly backToProductsLabel = 'Back aux offres';
  readonly coveragesTitle = 'Garanties (rules product)';

  productId: number | null = null;
  productRules: ProductCoverageRuleDto[] = [];
  loading = true;
  loadError: string | null = null;

  private readonly destroyRef = inject(DestroyRef);
  private readonly httpTimeoutMs = 20000;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly insuranceApi: InsuranceService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const idStr = params.get('id') ?? this.deepestParamId('id');
          if (!idStr || !/^\d+$/.test(idStr)) {
            this.loading = false;
            this.loadError = 'Identifiant product manquant ou invalide';
            this.productId = null;
            this.cdr.markForCheck();
            return EMPTY;
          }
          const pid = Number(idStr);
          this.productId = pid;
          this.loading = true;
          this.loadError = null;
          this.productRules = [];
          this.cdr.markForCheck();
          return forkJoin({
            product: this.insuranceApi.getProductById(pid).pipe(
              timeout(this.httpTimeoutMs),
              catchError((err) => {
                throw err;
              }),
            ),
            rules: this.insuranceApi.getProductCoverageRules(pid).pipe(
              timeout(this.httpTimeoutMs),
              catchError(() => of([] as ProductCoverageRuleDto[])),
            ),
          }).pipe(
            catchError((err) => {
              this.loading = false;
              this.loadError = err?.error?.message ?? 'Product introuvable ou serveur indisponible';
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
      .subscribe(({ product, rules }) => {
        this.applyProduct(product);
        this.productRules = Array.isArray(rules) ? rules : [];
        this.cdr.markForCheck();
      });
  }

  private deepestParamId(name: string): string | null {
    let last: string | null = null;
    for (const r of this.route.pathFromRoot) {
      const v = r.snapshot.paramMap.get(name);
      if (v != null && v !== '') last = v;
    }
    return last;
  }

  private applyProduct(p: InsuranceProductDto): void {
    this.pageTitle = p.name;
    this.pageSubtitle = p.status === 'ACTIVE' ? 'Product actif' : String(p.status);
    this.premiumValue = `${p.baseRatePct}% (base avant rules vehicle)`;
    this.partnerName = p.partnerCompanyName;
    this.descriptionText = p.description ?? '—';
    this.eligibilityLines = this.buildEligibility(p.allowedVehicleTypes ?? []);
  }

  private buildEligibility(allowed: VehicleTypeDto[]): string[] {
    if (!allowed.length) {
      return ['Tous types de vehicles (voiture, moto, utilitaire) — sauf exclusions dans les rules tarifaires.'];
    }
    const labels: Record<VehicleTypeDto, string> = {
      CAR: 'Voiture',
      MOTORCYCLE: 'Deux-roues / moto',
      TRUCK: 'Camion / utilitaire',
    };
    return allowed.map((v) => labels[v] ?? v);
  }
}
