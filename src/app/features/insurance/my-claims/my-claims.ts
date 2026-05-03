import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { ClaimRow } from '../../../models';
import { InsuranceService } from '../../../services/insurance/insurance.service';
import type { ClaimSimulationDto } from '../../../models/insurance.model';

const REQ_TIMEOUT_MS = 30000;

@Component({
  selector: 'app-my-claims',
  standalone: false,
  templateUrl: './my-claims.html',
  styleUrl: './my-claims.css',
})
export class MyClaims implements OnInit {
  readonly pageTitle = 'Historique des simulations';
  readonly pageSubtitle = 'Reimbursement estimates (not filed claims).';
  readonly fileClaimLabel = 'Nouvelle simulation';
  readonly fileClaimRoute = '/client/insurance/simulation';

  claims: ClaimRow[] = [];
  loading = true;
  loadError: string | null = null;

  private loadGen = 0;

  constructor(
    private readonly insuranceApi: InsuranceService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadClaims();
  }

  loadClaims(): void {
    const g = ++this.loadGen;
    this.loading = true;
    this.loadError = null;
    this.cdr.markForCheck();
    this.insuranceApi
      .getMyClaimSimulations()
      .pipe(
        timeout(REQ_TIMEOUT_MS),
        catchError((err: unknown) => {
          if (g !== this.loadGen) return of([] as ClaimSimulationDto[]);
          const anyErr = err as { error?: { message?: string }; message?: string };
          this.loadError =
            anyErr?.error?.message ??
            anyErr?.message ??
            'Unable to load simulations. Check network or backend (port 8082).';
          return of([] as ClaimSimulationDto[]);
        }),
        finalize(() => {
          if (g === this.loadGen) {
            this.loading = false;
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe((list: ClaimSimulationDto[]) => {
        if (g !== this.loadGen) return;
        this.claims = list.map((c) => ({
          id: c.id,
          policy: `${c.policyNumber} · ${c.coverageCode}`,
          amount: `${c.estimatedPayoutAmount} TND (est.)`,
          status: 'Simulation',
          statusClass: 'bg-blue-50 text-blue-700',
          date: c.incidentDate,
          viewRoute: `/client/insurance/claims/${c.id}`,
        }));
        this.cdr.markForCheck();
      });
  }
}
