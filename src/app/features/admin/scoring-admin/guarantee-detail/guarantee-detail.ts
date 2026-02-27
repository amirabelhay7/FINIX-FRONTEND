import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { GuaranteeApi } from '../../../../models';

@Component({
  selector: 'app-guarantee-detail-admin',
  standalone: false,
  templateUrl: './guarantee-detail.html',
  styleUrl: './guarantee-detail.css',
})
export class GuaranteeDetail implements OnInit {
  readonly backRoute = '/admin/scoring/guarantees';

  loading = true;
  error: string | null = null;
  guarantee: GuaranteeApi | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadGuarantee(+id);
  }

  loadGuarantee(id: number) {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.getGuaranteeById(id).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (g) => { this.guarantee = g; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load guarantee';
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString();
  }

  accepting = false;
  rejecting = false;
  actionError: string | null = null;

  acceptGuarantee() {
    if (!this.guarantee || this.guarantee.isAccepted) return;
    this.accepting = true;
    this.actionError = null;
    this.cdr.detectChanges();
    this.scoreService.acceptGuaranteeAdmin(this.guarantee.id).pipe(
      finalize(() => { this.accepting = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => this.loadGuarantee(this.guarantee!.id),
      error: (err) => {
        this.actionError = err?.error?.message || 'Failed to accept';
        this.cdr.detectChanges();
      }
    });
  }

  rejectGuarantee() {
    if (!this.guarantee || this.guarantee.isAccepted) return;
    if (!confirm('Reject this guarantee? The beneficiary will not receive the points.')) return;
    this.rejecting = true;
    this.actionError = null;
    this.cdr.detectChanges();
    this.scoreService.rejectGuaranteeAdmin(this.guarantee.id).pipe(
      finalize(() => { this.rejecting = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => this.router.navigate(['/admin/scoring/guarantees']),
      error: (err) => {
        this.actionError = err?.error?.message || 'Failed to reject';
        this.cdr.detectChanges();
      }
    });
  }
}
