import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import type { InsuranceCreditRequestDto } from '../../../models/insurance.model';
import { InsuranceService } from '../../../services/insurance/insurance.service';

@Component({
  selector: 'app-credit-request-detail',
  standalone: false,
  templateUrl: './credit-request-detail.html',
  styleUrl: './credit-request-detail.css',
})
export class CreditRequestDetail implements OnInit {
  detail: InsuranceCreditRequestDto | null = null;
  loading = true;
  loadError: string | null = null;
  actionError: string | null = null;
  timeoutMs = 30000;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly insuranceApi: InsuranceService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id) || id <= 0) {
      this.loadError = 'Identifiant invalide.';
      this.loading = false;
      return;
    }
    this.loading = true;
    this.actionError = null;
    this.insuranceApi
      .getMyCreditRequestById(id)
      .pipe(
        timeout(this.timeoutMs),
        catchError((err: unknown) => {
          const anyErr = err as { error?: { message?: string }; message?: string };
          this.loadError = anyErr?.error?.message ?? anyErr?.message ?? 'Request not found.';
          return of(null as InsuranceCreditRequestDto | null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe((res) => (this.detail = res));
  }

  cancel(): void {
    if (!this.detail || this.detail.status !== 'PENDING') return;
    this.insuranceApi
      .cancelMyCreditRequest(this.detail.id)
      .pipe(timeout(this.timeoutMs))
      .subscribe({
        next: (res) => {
          this.detail = res;
          this.cdr.markForCheck();
        },
        error: (err: unknown) => {
          const anyErr = err as { error?: { message?: string }; message?: string };
          this.actionError = anyErr?.error?.message ?? anyErr?.message ?? 'Annulation impossible.';
          this.cdr.markForCheck();
        },
      });
  }
}
