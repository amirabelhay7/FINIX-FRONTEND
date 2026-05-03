import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { InsuranceService } from '../../../services/insurance/insurance.service';
import type { ClaimSimulationDto } from '../../../models/insurance.model';

const REQ_TIMEOUT_MS = 25000;

@Component({
  selector: 'app-claim-detail',
  standalone: false,
  templateUrl: './claim-detail.html',
  styleUrl: './claim-detail.css',
})
export class ClaimDetail implements OnInit {
  readonly pageTitle = 'Simulation de claim';
  pageSubtitle = '';
  readonly backRoute = '/client/insurance/my-claims';
  readonly backLabel = 'Back to history';
  readonly policyLabel = 'Policy';
  policyValue = '—';
  readonly amountLabel = 'Estimated Amount';
  amountValue = '—';
  readonly statusLabel = 'Type';
  statusValue = 'Simulation (estimation)';
  readonly statusClass = 'bg-blue-50 text-blue-700';
  readonly submittedLabel = 'Date du claim';
  submittedValue = '—';
  readonly descriptionLabel = 'Explication';
  descriptionText = '';

  loading = true;
  loadError: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly insuranceApi: InsuranceService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loadError = 'Identifiant de simulation manquant';
      this.loading = false;
      return;
    }
    this.fetchSimulation(Number(id));
  }

  retry(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.fetchSimulation(Number(id));
  }

  private fetchSimulation(id: number): void {
    this.loading = true;
    this.loadError = null;
    this.cdr.markForCheck();
    this.insuranceApi
      .getMyClaimSimulationById(id)
      .pipe(
        timeout(REQ_TIMEOUT_MS),
        catchError((err: unknown) => {
          const anyErr = err as { error?: { message?: string } };
          this.loadError = anyErr?.error?.message ?? 'Simulation introuvable.';
          return of(null as ClaimSimulationDto | null);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe((c: ClaimSimulationDto | null) => {
        if (!c) return;
        this.pageSubtitle = `Simulation #${c.id}`;
        this.policyValue = `${c.policyNumber} (${c.coverageCode})`;
        this.amountValue = `${c.estimatedPayoutAmount} TND`;
        this.submittedValue = c.incidentDate;
        this.descriptionText = c.explanation ?? '—';
        this.cdr.markForCheck();
      });
  }
}
