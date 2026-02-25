import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ScoreService } from '../../../core/score/score.service';

@Component({
  selector: 'app-guarantee-create',
  standalone: false,
  templateUrl: './guarantee-create.html',
  styleUrl: './guarantee-create.css',
})
export class GuaranteeCreate {
  readonly pageTitle = 'Create guarantee';
  readonly pageSubtitle = 'Offer score points to another user as guarantor.';
  readonly backRoute = '/score/guarantees';
  readonly backLabel = 'Back to guarantees';
  readonly beneficiaryIdLabel = 'Beneficiary user ID';
  readonly beneficiaryIdPlaceholder = 'User ID of the person you are guaranteeing';
  readonly pointsLabel = 'Points to offer (10–100)';
  readonly reasonLabel = 'Reason';
  readonly reasonPlaceholder = 'e.g. Supporting their first loan application';
  readonly validityLabel = 'Validity (months, 1–12)';
  readonly submitLabel = 'Create guarantee';
  readonly cancelLabel = 'Cancel';

  loading = false;
  error: string | null = null;
  beneficiaryId: number | null = null;
  pointsOffered = 50;
  reason = '';
  validityMonths = 6;

  constructor(
    private router: Router,
    private authService: AuthService,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  submit() {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.error = 'You must be logged in.';
      this.cdr.detectChanges();
      return;
    }
    if (this.beneficiaryId == null || this.beneficiaryId <= 0) {
      this.error = 'Please enter a valid beneficiary user ID.';
      this.cdr.detectChanges();
      return;
    }
    if (this.pointsOffered < 10 || this.pointsOffered > 100) {
      this.error = 'Points must be between 10 and 100.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.reason.trim()) {
      this.error = 'Reason is required.';
      this.cdr.detectChanges();
      return;
    }
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.createGuaranteeMe({
      guarantorId: user.id,
      beneficiaryId: this.beneficiaryId,
      pointsOffered: this.pointsOffered,
      reason: this.reason.trim(),
      validityMonths: this.validityMonths
    }).subscribe({
      next: () => this.router.navigate(['/score/guarantees']),
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Create failed';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
