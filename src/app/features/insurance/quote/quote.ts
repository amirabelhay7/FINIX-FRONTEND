import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of, TimeoutError } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { InsuranceOption } from '../../../models';
import type {
  InsuranceProductDto,
  PaymentFrequencyDto,
  UsageTypeDto,
  VehicleTypeDto,
} from '../../../models/insurance.model';
import { InsuranceService } from '../../../services/insurance/insurance.service';

function parseAmount(raw: unknown): number {
  if (raw === null || raw === undefined || raw === '') return NaN;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : NaN;
  const s = String(raw).trim().replace(/\s/g, '').replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
}

function insuredValueValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const n = parseAmount(control.value);
    if (!Number.isFinite(n)) return { required: true };
    if (n < 0.01) return { min: { min: 0.01, actual: n } };
    return null;
  };
}

@Component({
  selector: 'app-quote',
  standalone: false,
  templateUrl: './quote.html',
  styleUrl: './quote.css',
})
export class Quote implements OnInit {
  readonly pageTitle = 'Estimated Quote';
  readonly pageSubtitle = 'Enter your vehicle details and get an indicative premium (no commitment).';
  readonly backRoute = '/client/insurance/home';
  readonly calculateLabel = 'Calculate Quote';
  readonly estimatedLabel = 'Estimated Premium';
  estimatedAmount = '—';
  estimatedUnit = 'total';
  estimatedNote = 'Fill in the form to view details and installments.';
  pricingExplanation: string | null = null;

  readonly vehicleTypeOptions: { value: VehicleTypeDto; label: string }[] = [
    { value: 'CAR', label: 'Car' },
    { value: 'MOTORCYCLE', label: 'Motorcycle' },
    { value: 'TRUCK', label: 'Truck' },
  ];

  readonly usageOptions: { value: UsageTypeDto; label: string }[] = [
    { value: 'PRIVATE', label: 'Private' },
    { value: 'COMMERCIAL', label: 'Commercial' },
  ];

  durationOptions: { months: number; label: string }[] = [
    { months: 6, label: '6 months' },
    { months: 12, label: '12 months' },
    { months: 24, label: '24 months' },
  ];
  readonly frequencyOptions: InsuranceOption[] = [
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'BIWEEKLY', label: 'Biweekly' },
    { value: 'MONTHLY', label: 'Monthly' },
  ];

  form: FormGroup;
  productOptions: { id: number; label: string }[] = [];
  productsLoading = false;
  private productsFetchGen = 0;

  submitting = false;
  apiError: string | null = null;
  /** Error only for product loading (separate from submit message). */
  productsLoadError: string | null = null;
  fieldErrors: string[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly insuranceApi: InsuranceService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      insuranceProductId: [null as number | null, [Validators.required, Validators.min(1)]],
      vehicleType: ['CAR' as VehicleTypeDto, Validators.required],
      vehiclePrice: [20000, [Validators.required, insuredValueValidator()]],
      estimatedVehicleValue: [20000, [Validators.required, insuredValueValidator()]],
      vehicleAgeYears: [5, [Validators.required, Validators.min(0), Validators.max(99)]],
      durationMonths: [12, [Validators.required, Validators.min(1), Validators.max(120)]],
      paymentFrequency: ['MONTHLY' as PaymentFrequencyDto, Validators.required],
      usageType: [null as UsageTypeDto | null],
    });
  }

  retryLoadProducts(): void {
    this.productsLoadError = null;
    const g = ++this.productsFetchGen;
    this.productsLoading = true;
    this.insuranceApi
      .getProducts()
      .pipe(
        timeout(30000),
        catchError(() => {
          if (g === this.productsFetchGen) {
            this.productsLoadError = 'Unable to load products.';
          }
          return of([] as InsuranceProductDto[]);
        }),
        finalize(() => {
          if (g === this.productsFetchGen) {
            this.productsLoading = false;
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe((list: InsuranceProductDto[]) => {
        if (g !== this.productsFetchGen) return;
        if (list.length) this.productsLoadError = null;
        this.productOptions = list.map((p) => ({ id: p.id, label: p.name }));
        const q = this.route.snapshot.queryParamMap.get('productId');
        const qNum = q != null && q !== '' ? Number(q) : NaN;
        if (Number.isFinite(qNum) && qNum >= 1) {
          this.form.patchValue({ insuranceProductId: qNum });
        } else if (list.length) {
          this.form.patchValue({ insuranceProductId: list[0].id });
        }
        this.cdr.markForCheck();
      });
  }

  ngOnInit(): void {
    this.retryLoadProducts();
  }

  submit(): void {
    this.apiError = null;
    this.fieldErrors = [];
    this.pricingExplanation = null;

    const priceRaw = this.form.get('vehiclePrice')?.value;
    const evRaw = this.form.get('estimatedVehicleValue')?.value;
    const coercedPrice = parseAmount(priceRaw);
    const coercedEv = parseAmount(evRaw);
    if (Number.isFinite(coercedPrice) && coercedPrice >= 0.01) {
      this.form.get('vehiclePrice')?.setValue(coercedPrice, { emitEvent: false });
    }
    if (Number.isFinite(coercedEv) && coercedEv >= 0.01) {
      this.form.get('estimatedVehicleValue')?.setValue(coercedEv, { emitEvent: false });
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.collectFieldErrors();
      return;
    }

    const v = this.form.getRawValue() as {
      insuranceProductId: number;
      vehicleType: VehicleTypeDto;
      vehiclePrice: number;
      estimatedVehicleValue: number;
      vehicleAgeYears: number;
      durationMonths: number;
      paymentFrequency: PaymentFrequencyDto;
      usageType: UsageTypeDto | null;
    };

    const vehiclePrice = parseAmount(v.vehiclePrice);
    const estimatedVehicleValue = parseAmount(v.estimatedVehicleValue);
    const durationMonths = Math.trunc(Number(v.durationMonths));
    const vehicleAgeYears = Math.trunc(Number(v.vehicleAgeYears));
    const insuranceProductId = Math.trunc(Number(v.insuranceProductId));

    if (!Number.isFinite(vehiclePrice) || vehiclePrice < 0.01) {
      this.fieldErrors.push('Invalid insured value.');
      return;
    }
    if (!Number.isFinite(estimatedVehicleValue) || estimatedVehicleValue < 0.01) {
      this.fieldErrors.push('Invalid estimated vehicle value.');
      return;
    }
    if (!Number.isFinite(durationMonths) || durationMonths < 1) {
      this.fieldErrors.push('Choose a duration.');
      return;
    }
    if (!Number.isFinite(insuranceProductId) || insuranceProductId < 1) {
      this.fieldErrors.push('Choose a product.');
      return;
    }

    this.submitting = true;
    this.cdr.markForCheck();

    this.insuranceApi
      .createCoverageSimulation({
        insuranceProductId,
        vehicleType: v.vehicleType,
        vehiclePrice,
        estimatedVehicleValue,
        vehicleAgeYears,
        durationMonths,
        paymentFrequency: v.paymentFrequency,
        usageType: v.usageType ?? undefined,
        currencyCode: 'TND',
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
          this.estimatedAmount = `${sim.estimatedPremiumTotal} ${sim.currencyCode}`;
          this.estimatedUnit = 'estimated total premium';
          this.pricingExplanation = sim.pricingExplanation ?? null;
          this.estimatedNote = `${sim.estimatedInstallmentAmount} ${sim.currencyCode} per installment (${sim.paymentFrequency}) - ${sim.insuranceProductName} - ${sim.durationMonths} months.`;
        },
        error: (err: unknown) => {
          this.apiError = this.formatApiError(err);
        },
      });
  }

  private collectFieldErrors(): void {
    const msgs: string[] = [];
    if (this.form.get('vehiclePrice')?.invalid || this.form.get('estimatedVehicleValue')?.invalid) {
      msgs.push('Enter valid amounts (>= 0.01 TND).');
    }
    if (this.form.get('insuranceProductId')?.invalid) {
      msgs.push('Choose a product.');
    }
    if (this.form.get('durationMonths')?.invalid) {
      msgs.push('Choose a duration.');
    }
    if (this.form.get('vehicleAgeYears')?.invalid) {
      msgs.push('Vehicle age: 0 to 99 years.');
    }
    if (this.form.get('vehicleType')?.invalid) {
      msgs.push('Vehicle type is required.');
    }
    this.fieldErrors = msgs.length ? msgs : ['Please correct the highlighted fields.'];
  }

  private formatApiError(err: unknown): string {
    if (err instanceof TimeoutError) {
      return 'Request timeout - server response is too slow.';
    }
    if (err instanceof HttpErrorResponse) {
      const body = err.error;
      if (body && typeof body === 'object' && 'message' in body && typeof (body as { message: unknown }).message === 'string') {
        return (body as { message: string }).message;
      }
      if (err.status === 0) {
        return 'Network unavailable - is backend running on port 8081?';
      }
      return err.message || `Error (${err.status})`;
    }
    return 'Calculation failed';
  }
}
