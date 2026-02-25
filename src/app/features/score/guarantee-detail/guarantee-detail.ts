import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import { ScoreService } from '../../../core/score/score.service';
import { GuaranteeApi } from '../../../models';

@Component({
  selector: 'app-guarantee-detail',
  standalone: false,
  templateUrl: './guarantee-detail.html',
  styleUrl: './guarantee-detail.css',
})
export class GuaranteeDetail implements OnInit {
  readonly backRoute = '/score/guarantees';
  readonly backLabel = 'Back';
  readonly guarantorLabel = 'Guarantor';
  readonly pointsLabel = 'Points offered';
  readonly statusLabel = 'Status';
  readonly expiresLabel = 'Expires';
  readonly reasonLabel = 'Reason';
  readonly acceptLabel = 'Accept';
  readonly rejectLabel = 'Reject';

  loading = true;
  error: string | null = null;
  guarantee: GuaranteeApi | null = null;
  canAcceptReject = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
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
      next: (g) => {
        this.guarantee = g;
        const user = this.authService.getCurrentUser();
        this.canAcceptReject = !!user && g.beneficiaryId === user.id && !g.isAccepted;
        this.cdr.detectChanges();
      },
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

  accept() {
    if (!this.guarantee) return;
    this.scoreService.acceptGuaranteeMe(this.guarantee.id).subscribe({
      next: () => this.loadGuarantee(this.guarantee!.id),
      error: (err) => { this.error = err?.error?.message || 'Accept failed'; this.cdr.detectChanges(); }
    });
  }

  reject() {
    if (!this.guarantee || !confirm('Reject this guarantee?')) return;
    this.scoreService.rejectGuaranteeMe(this.guarantee.id).subscribe({
      next: () => this.router.navigate(['/score/guarantees']),
      error: (err) => { this.error = err?.error?.message || 'Reject failed'; this.cdr.detectChanges(); }
    });
  }
}
