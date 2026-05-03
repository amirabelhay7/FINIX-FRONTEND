import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { InsuranceProduct } from '../../../models';
import type { InsuranceProductDto, VehicleTypeDto } from '../../../models/insurance.model';
import { InsuranceService } from '../../../services/insurance/insurance.service';

const EMOJIS = ['🛡️', '🏥', '🏠', '👤', '🌾', '🚗'];
const FETCH_TIMEOUT_MS = 30000;

function vehicleBadges(p: InsuranceProductDto): NonNullable<InsuranceProduct['badges']> {
  const allowed = p.allowedVehicleTypes ?? [];
  const out: NonNullable<InsuranceProduct['badges']> = [];
  if (!allowed.length) {
    out.push({ label: 'All Vehicles', class: 'b-g500' });
    return out;
  }
  for (const vt of allowed) {
    if (vt === 'CAR') out.push({ label: 'Best for Cars', class: 'b-blue' });
    else if (vt === 'MOTORCYCLE') out.push({ label: 'Best for Motorcycles', class: 'b-review' });
    else if (vt === 'TRUCK') out.push({ label: 'Pro / Truck', class: 'b-insured' });
  }
  return out;
}

function mapApiToCard(p: InsuranceProductDto, index: number): InsuranceProduct {
  const badges: InsuranceProduct['badges'] = [];
  if (p.popular) badges.push({ label: 'Popular', class: 'b-insured' });
  if (p.recommended) badges.push({ label: 'Recommended', class: 'b-review' });
  badges.push(...vehicleBadges(p));
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    priceNote: `Base rate ${p.baseRatePct}% - ${p.partnerCompanyName}`,
    route: `/client/insurance/products/${p.id}`,
    accentColor: '',
    icon: EMOJIS[index % EMOJIS.length],
    iconBgClass: '',
    iconColorClass: '',
    badges: badges.length ? badges : undefined,
  };
}

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  readonly pageTitle = 'Insurance Offers';
  readonly pageSubtitle = 'Filter by vehicle type and compare partner products.';
  readonly whyMicroCopy =
    'Affordable premiums, clear terms, and trusted partners. Final pricing depends on your profile and backoffice rules.';

  readonly vehicleFilterOptions: { value: VehicleTypeDto | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Vehicles' },
    { value: 'CAR', label: 'Car' },
    { value: 'MOTORCYCLE', label: 'Motorcycle' },
    { value: 'TRUCK', label: 'Truck' },
  ];

  vehicleFilter: VehicleTypeDto | 'ALL' = 'ALL';

  private fetchGen = 0;

  products: InsuranceProduct[] = [];
  loading = true;
  loadError: string | null = null;

  constructor(
    private readonly insuranceApi: InsuranceService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  onVehicleFilterChange(): void {
    this.fetchProducts();
  }

  /** Retry button */
  retryProducts(): void {
    this.fetchProducts();
  }

  private fetchProducts(): void {
    const g = ++this.fetchGen;
    this.loading = true;
    this.loadError = null;
    const vt = this.vehicleFilter === 'ALL' ? undefined : this.vehicleFilter;
    this.insuranceApi
      .getProducts(vt ? { vehicleType: vt } : undefined)
      .pipe(
        timeout(FETCH_TIMEOUT_MS),
        catchError((err: unknown) => {
          if (g !== this.fetchGen) return of([] as InsuranceProductDto[]);
          const anyErr = err as { error?: { message?: string }; message?: string };
          this.loadError =
            anyErr?.error?.message ??
            anyErr?.message ??
            'Unable to load products. Is backend running (port 8081)?';
          return of([] as InsuranceProductDto[]);
        }),
        finalize(() => {
          if (g === this.fetchGen) {
            this.loading = false;
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe((list) => {
        if (g !== this.fetchGen) return;
        this.products = list.map((p, idx) => mapApiToCard(p, idx));
        this.cdr.markForCheck();
      });
  }

  openProduct(route: string): void {
    void this.router.navigateByUrl(route);
  }

  openCreditRequest(productId: number, event: Event): void {
    event.stopPropagation();
    void this.router.navigate(['/client/insurance/credit-requests/new'], { queryParams: { productId } });
  }
}
