import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import type {
  InsuranceProductDto,
  InsuranceCreditRequestCreateRequestDto,
  PaymentFrequencyDto,
  VehicleTypeDto,
} from '../../../models/insurance.model';
import { InsuranceService } from '../../../services/insurance/insurance.service';

@Component({
  selector: 'app-credit-request-form',
  standalone: false,
  templateUrl: './credit-request-form.html',
  styleUrl: './credit-request-form.css',
})
export class CreditRequestForm implements OnInit {
  readonly pageTitle = 'Insurance Credit Request';
  readonly pageSubtitle = 'Submit your request. It will be processed by backoffice.';
  readonly backRoute = '/client/insurance/products';
  readonly timeoutMs = 30000;

  form: FormGroup;
  loading = false;
  submitting = false;
  loadError: string | null = null;
  apiError: string | null = null;
  successMessage: string | null = null;
  product: InsuranceProductDto | null = null;
  estimatedPremiumTotal = 0;
  estimatedInstallmentAmount = 0;

  readonly vehicleTypes: { value: VehicleTypeDto; label: string }[] = [
    { value: 'CAR', label: 'Voiture' },
    { value: 'MOTORCYCLE', label: 'Moto' },
    { value: 'TRUCK', label: 'Camion / utilitaire' },
  ];

  readonly frequencies: { value: PaymentFrequencyDto; label: string }[] = [
    { value: 'WEEKLY', label: 'Hebdomadaire' },
    { value: 'BIWEEKLY', label: 'Bimensuel' },
    { value: 'MONTHLY', label: 'Mensuel' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly insuranceApi: InsuranceService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      insuranceProductId: [null, Validators.required],
      vehicleType: ['CAR', Validators.required],
      insuredValue: [10000, [Validators.required, Validators.min(100)]],
      vehicleAgeYears: [0, [Validators.required, Validators.min(0)]],
      durationMonths: [12, [Validators.required, Validators.min(1)]],
      paymentFrequency: ['MONTHLY', Validators.required],
    });
  }

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.queryParamMap.get('productId'));
    if (Number.isFinite(productId) && productId > 0) {
      this.loadProduct(productId);
    }
    this.form.valueChanges.subscribe(() => this.computeEstimate());
    this.computeEstimate();
  }

  private loadProduct(productId: number): void {
    this.loading = true;
    this.loadError = null;
    this.insuranceApi
      .getProductById(productId)
      .pipe(
        timeout(this.timeoutMs),
        catchError((err: unknown) => {
          const anyErr = err as { error?: { message?: string }; message?: string };
          this.loadError = anyErr?.error?.message ?? anyErr?.message ?? 'Product not found.';
          return of(null as InsuranceProductDto | null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe((p) => {
        if (!p) return;
        this.product = p;
        this.form.patchValue({ insuranceProductId: p.id }, { emitEvent: true });
      });
  }

  private computeEstimate(): void {
    const v = this.form.getRawValue();
    const insuredValue = Number(v.insuredValue) || 0;
    const durationMonths = Number(v.durationMonths) || 1;
    const frequency = v.paymentFrequency as PaymentFrequencyDto;
    const baseRate = Number(this.product?.baseRatePct ?? 0);
    const premium = (insuredValue * baseRate) / 100;
    const installmentCount = frequency === 'MONTHLY' ? durationMonths : frequency === 'BIWEEKLY' ? durationMonths * 2 : durationMonths * 4;
    this.estimatedPremiumTotal = Number.isFinite(premium) ? Number(premium.toFixed(3)) : 0;
    this.estimatedInstallmentAmount = installmentCount > 0 ? Number((premium / installmentCount).toFixed(3)) : 0;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.apiError = null;
    this.successMessage = null;
    this.submitting = true;
    const v = this.form.getRawValue();
    const payload: InsuranceCreditRequestCreateRequestDto = {
      insuranceProductId: Number(v.insuranceProductId),
      vehicleType: v.vehicleType as VehicleTypeDto,
      insuredValue: Number(v.insuredValue),
      vehicleAgeYears: Number(v.vehicleAgeYears),
      durationMonths: Number(v.durationMonths),
      paymentFrequency: v.paymentFrequency as PaymentFrequencyDto,
      currencyCode: 'TND',
    };
    this.insuranceApi
      .createMyCreditRequest(payload)
      .pipe(
        timeout(this.timeoutMs),
        finalize(() => {
          this.submitting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (res) => {
          this.successMessage = `Request #${res.id} sent successfully (status: ${res.status}).`;
          void this.router.navigate(['/client/insurance/credit-requests', res.id]);
        },
        error: (err: unknown) => {
          const anyErr = err as { error?: { message?: string }; message?: string };
          this.apiError = anyErr?.error?.message ?? anyErr?.message ?? 'Failed to create the request.';
        },
      });
  }
}
