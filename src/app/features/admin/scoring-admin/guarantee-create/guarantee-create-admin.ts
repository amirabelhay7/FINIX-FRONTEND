import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AdminUserService } from '../../../../core/user/admin-user.service';
import { ScoreService } from '../../../../core/score/score.service';
import { AdminUserApi } from '../../../../models';
import { GuaranteeRequest } from '../../../../models';

@Component({
  selector: 'app-guarantee-create-admin',
  standalone: false,
  templateUrl: './guarantee-create-admin.html',
  styleUrl: './guarantee-create-admin.css',
})
export class GuaranteeCreateAdmin implements OnInit {
  readonly pageTitle = 'Create guarantee';
  readonly pageSubtitle = 'Create a guarantee between two clients (customers only).';
  readonly backRoute = '/admin/scoring/guarantees';

  loading = false;
  loadingClients = true;
  error: string | null = null;
  clients: AdminUserApi[] = [];
  guarantorId: number | null = null;
  beneficiaryId: number | null = null;
  pointsOffered = 50;
  reason = '';
  validityMonths = 6;

  constructor(
    private router: Router,
    private adminUserService: AdminUserService,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.adminUserService.getAll(false).subscribe({
      next: (users) => {
        this.clients = (users ?? []).filter(u => u.role === 'CLIENT' && !u.deletedAt);
        this.loadingClients = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingClients = false;
        this.error = 'Failed to load clients.';
        this.cdr.detectChanges();
      }
    });
  }

  clientLabel(u: AdminUserApi): string {
    return `${u.firstName} ${u.lastName} (${u.email})`;
  }

  submit() {
    const guarantorId = Number(this.guarantorId);
    const beneficiaryId = Number(this.beneficiaryId);
    if (!Number.isInteger(guarantorId) || guarantorId <= 0) {
      this.error = 'Please select a guarantor (client).';
      this.cdr.detectChanges();
      return;
    }
    if (!Number.isInteger(beneficiaryId) || beneficiaryId <= 0) {
      this.error = 'Please select a beneficiary (client).';
      this.cdr.detectChanges();
      return;
    }
    if (guarantorId === beneficiaryId) {
      this.error = 'Guarantor and beneficiary must be different clients.';
      this.cdr.detectChanges();
      return;
    }
    const pointsOffered = Number(this.pointsOffered);
    if (pointsOffered < 10 || pointsOffered > 100) {
      this.error = 'Points must be between 10 and 100.';
      this.cdr.detectChanges();
      return;
    }
    const reason = this.reason.trim();
    if (reason.length < 5) {
      this.error = 'Reason must be at least 5 characters.';
      this.cdr.detectChanges();
      return;
    }
    if (reason.length > 500) {
      this.error = 'Reason cannot exceed 500 characters.';
      this.cdr.detectChanges();
      return;
    }
    const validityMonths = Math.min(12, Math.max(1, Number(this.validityMonths) || 6));

    const request: GuaranteeRequest = {
      guarantorId,
      beneficiaryId,
      pointsOffered,
      reason,
      validityMonths
    };
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.createGuaranteeAdmin(request).subscribe({
      next: () => this.router.navigate(['/admin/scoring/guarantees']),
      error: (err) => {
        this.error = err?.error?.message || 'Create failed.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
