import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
}
