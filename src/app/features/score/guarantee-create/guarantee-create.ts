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
    const beneficiaryId = Number(this.beneficiaryId);
    if (!Number.isInteger(beneficiaryId) || beneficiaryId <= 0) {
      this.error = 'Please enter a valid beneficiary user ID.';
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
    if (!reason) {
      this.error = 'Reason is required.';
      this.cdr.detectChanges();
      return;
    }
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
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    const body = {
      guarantorId: Number(user.id),
      beneficiaryId,
      pointsOffered,
      reason,
      validityMonths
    };
    this.scoreService.createGuaranteeMe(body).subscribe({
      next: () => this.router.navigate(['/score/guarantees']),
      error: (err) => {
        this.error = err?.error?.message || 'Create failed. Check: beneficiary user ID exists, reason 5–500 characters, points 10–100. You cannot guarantee yourself and you can have at most 3 active guarantees.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
