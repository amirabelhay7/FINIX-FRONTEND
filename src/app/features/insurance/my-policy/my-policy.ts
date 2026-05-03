import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import type {
  InsurancePolicyDto,
  PaymentFrequencyDto,
  PolicyStatusDto,
} from '../../../models/insurance.model';
import { InsuranceService } from '../../../services/insurance/insurance.service';

const REQ_TIMEOUT_MS = 30000;

@Component({
  selector: 'app-my-policy',
  standalone: false,
  templateUrl: './my-policy.html',
  styleUrl: './my-policy.css',
})
export class MyPolicy implements OnInit {
  readonly pageTitle = 'My Subscription';
  readonly pageSubtitle =
    'Track your contracts: status, installments, cancellation, and simulation access (estimate).';

  policies: InsurancePolicyDto[] = [];
  loading = true;
  loadError: string | null = null;

  private loadGen = 0;

  constructor(
    private readonly api: InsuranceService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    const g = ++this.loadGen;
    this.loading = true;
    this.loadError = null;
    this.cdr.markForCheck();
    this.api
      .getMyPolicies()
      .pipe(
        timeout(REQ_TIMEOUT_MS),
        catchError((err: unknown) => {
          if (g !== this.loadGen) return of([] as InsurancePolicyDto[]);
          const anyErr = err as { error?: { message?: string }; message?: string };
          this.loadError =
            anyErr?.error?.message ??
            anyErr?.message ??
            'Unable to load your policies. Check network or backend (port 8081).';
          return of([] as InsurancePolicyDto[]);
        }),
        finalize(() => {
          if (g === this.loadGen) {
            this.loading = false;
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe((list) => {
        if (g !== this.loadGen) return;
        this.policies = Array.isArray(list) ? list : [];
        this.cdr.markForCheck();
      });
  }

  paymentFreqLabel(f: PaymentFrequencyDto | null | undefined): string {
    if (!f) return '—';
    const m: Record<PaymentFrequencyDto, string> = {
      WEEKLY: 'Hebdomadaire',
      BIWEEKLY: 'Bimensuel',
      MONTHLY: 'Mensuel',
    };
    return m[f] ?? f;
  }

  badgeForPolicy(p: InsurancePolicyDto): { label: string; css: string }[] {
    const out: { label: string; css: string }[] = [];
    const st = p.status as PolicyStatusDto;
    if (st === 'ACTIVE') {
      out.push({ label: 'Actif', css: 'b-actif' });
    } else if (st === 'SUSPENDED') {
      out.push({ label: 'Suspendu', css: 'b-review' });
    } else if (st === 'EXPIRED') {
      out.push({ label: 'Expired', css: 'b-danger' });
    } else if (st === 'CANCELLED') {
      out.push({ label: 'Cancelled', css: 'b-g500' });
    }
    const days = p.daysRemaining;
    if (st === 'ACTIVE' && days != null && days <= 30 && days > 0) {
      out.push({ label: 'Expiring Soon', css: 'b-review' });
    }
    if (st === 'ACTIVE' && days != null && days <= 14 && days > 0) {
      out.push({ label: 'Renewal Required', css: 'b-danger' });
    }
    if (p.paymentFrequency === 'MONTHLY') {
      out.push({ label: 'Monthly Payment', css: 'b-blue' });
    }
    if (st === 'ACTIVE' && p.cancellationAllowedUntil) {
      out.push({ label: 'Cancellation Window', css: 'b-g500' });
    }
    return out;
  }

  goDetail(id: number): void {
    void this.router.navigate(['/client/insurance/policy', id]);
  }

  goSimForPolicy(policyId: number, ev: Event): void {
    ev.stopPropagation();
    void this.router.navigate(['/client/insurance/simulation'], { queryParams: { policyId } });
  }

  vehicleTypeLabel(v: string | null | undefined): string {
    if (!v) return '—';
    if (v === 'CAR') return 'Voiture';
    if (v === 'MOTORCYCLE') return 'Moto';
    if (v === 'TRUCK') return 'Utilitaire';
    return v;
  }
}
