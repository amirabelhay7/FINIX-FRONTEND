import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { InsurancePolicy } from '../../../models';
import type { InsurancePolicyDto } from '../../../models/insurance.model';
import { InsuranceService } from '../../../services/insurance/insurance.service';

const ICONS = ['🛡️', '🏥', '🏠', '👤', '🌾'];
const REQ_TIMEOUT_MS = 30000;

function hashPick(s: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

function mapPolicy(p: InsurancePolicyDto): InsurancePolicy & { statusLabel?: string; emoji: string } {
  const hi = hashPick(p.insuranceProductName, ICONS.length);
  const exp = new Date(p.expirationDate);
  const detail = `Jusqu’au ${exp.toLocaleDateString('fr-FR')} · ${p.installmentAmount} ${p.currencyCode} / installment`;
  return {
    id: p.id,
    productName: p.insuranceProductName,
    policyNumber: p.policyNumber,
    detail,
    route: `/client/insurance/policy/${p.id}`,
    icon: ICONS[hi],
    iconBgClass: '',
    iconColorClass: '',
    statusLabel: p.status,
    emoji: ICONS[hi],
  };
}

function isActive(p: InsurancePolicyDto): boolean {
  if (p.status !== 'ACTIVE') return false;
  const exp = new Date(p.expirationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return exp >= today;
}

@Component({
  selector: 'app-my-policies',
  standalone: false,
  templateUrl: './my-policies.html',
  styleUrl: './my-policies.css',
})
export class MyPolicies implements OnInit {
  readonly pageTitle = 'My Policies';
  readonly pageSubtitle = 'Policys actives et historique.';
  readonly activeSectionTitle = 'Policys actives';
  readonly pastSectionTitle = 'Past Policies';

  activePolicies: (InsurancePolicy & { emoji: string })[] = [];
  pastPolicies: (InsurancePolicy & { statusLabel: string; emoji: string })[] = [];
  loading = true;
  loadError: string | null = null;

  private loadGen = 0;

  constructor(
    private readonly insuranceApi: InsuranceService,
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
    this.insuranceApi
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
        const active: InsurancePolicyDto[] = [];
        const past: InsurancePolicyDto[] = [];
        for (const p of list) {
          if (isActive(p)) active.push(p);
          else past.push(p);
        }
        this.activePolicies = active.map((p) => mapPolicy(p) as InsurancePolicy & { emoji: string });
        this.pastPolicies = past.map((p) => {
          const m = mapPolicy(p) as InsurancePolicy & { statusLabel: string; emoji: string };
          m.statusLabel =
            p.status === 'EXPIRED' ? 'Expired' : p.status === 'CANCELLED' ? 'Cancelled' : String(p.status);
          return m;
        });
        this.cdr.markForCheck();
      });
  }
}
