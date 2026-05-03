import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import type { InsuranceCreditRequestDto } from '../../../models/insurance.model';
import { InsuranceService } from '../../../services/insurance/insurance.service';

@Component({
  selector: 'app-credit-requests',
  standalone: false,
  templateUrl: './credit-requests.html',
  styleUrl: './credit-requests.css',
})
export class CreditRequests implements OnInit {
  readonly pageTitle = 'My Insurance Requests';
  readonly timeoutMs = 30000;
  list: InsuranceCreditRequestDto[] = [];
  loading = true;
  loadError: string | null = null;

  constructor(
    private readonly insuranceApi: InsuranceService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = null;
    this.insuranceApi
      .getMyCreditRequests()
      .pipe(
        timeout(this.timeoutMs),
        catchError((err: unknown) => {
          const anyErr = err as { error?: { message?: string }; message?: string };
          this.loadError = anyErr?.error?.message ?? anyErr?.message ?? 'Unable to load les demandes.';
          return of([] as InsuranceCreditRequestDto[]);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe((data) => (this.list = data ?? []));
  }
}
