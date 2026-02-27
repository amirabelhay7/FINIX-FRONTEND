import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../core/score/score.service';
import { GuaranteeApi } from '../../../models';

@Component({
  selector: 'app-guarantees',
  standalone: false,
  templateUrl: './guarantees.html',
  styleUrl: './guarantees.css',
})
export class Guarantees implements OnInit {
  selectedTab = 'received';
  loading = true;
  error: string | null = null;
  receivedGuarantees: GuaranteeApi[] = [];
  givenGuarantees: GuaranteeApi[] = [];

  constructor(
    private router: Router,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadGuarantees();
  }

  loadGuarantees() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    forkJoin({
      received: this.scoreService.getMyGuaranteesReceived(),
      given: this.scoreService.getMyGuaranteesGiven(),
    }).pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); })).subscribe({
      next: ({ received, given }) => {
        this.receivedGuarantees = received ?? [];
        this.givenGuarantees = given ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load guarantees';
        this.cdr.detectChanges();
      }
    });
  }

  /** For "Created" / "Accepted" (past dates): e.g. "Today", "3 days ago". */
  formatDate(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 0 && diffDays < 7) return `${diffDays} days ago`;
    if (diffDays > 0 && diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString();
  }

  /** For "Expires": future = "in X days" / date; past = "expired X days ago". */
  formatExpires(iso: string | undefined): string {
    if (!iso) return '—';
    const d = new Date(iso);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays > 0) {
      if (diffDays === 1) return 'tomorrow';
      if (diffDays < 30) return `in ${diffDays} days`;
      return `on ${d.toLocaleDateString()}`;
    }
    if (diffDays === 0) return 'today';
    const ago = Math.abs(diffDays);
    if (ago === 1) return 'expired yesterday';
    if (ago < 30) return `expired ${ago} days ago`;
    return `expired on ${d.toLocaleDateString()}`;
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  createGuarantee() {
    this.router.navigate(['/score/guarantees/create']);
  }

  viewGuaranteeDetail(guarantee: GuaranteeApi) {
    this.router.navigate(['/score/guarantees', guarantee.id]);
  }

  acceptGuarantee(guarantee: GuaranteeApi, event: Event) {
    event.stopPropagation();
    if (guarantee.isAccepted) return;
    this.scoreService.acceptGuaranteeMe(guarantee.id).subscribe({
      next: () => this.loadGuarantees(),
      error: (err) => { this.error = err?.error?.message || 'Accept failed'; this.cdr.detectChanges(); }
    });
  }

  rejectGuarantee(guarantee: GuaranteeApi, event: Event) {
    event.stopPropagation();
    if (guarantee.isAccepted) return;
    if (!confirm('Reject this guarantee?')) return;
    this.scoreService.rejectGuaranteeMe(guarantee.id).subscribe({
      next: () => this.loadGuarantees(),
      error: (err) => { this.error = err?.error?.message || 'Reject failed'; this.cdr.detectChanges(); }
    });
  }

  getTotalReceivedPoints() {
    return this.receivedGuarantees.filter(g => g.isAccepted).reduce((sum, g) => sum + (g.pointsOffered ?? 0), 0);
  }

  getTotalGivenPoints() {
    return this.givenGuarantees.filter(g => g.isAccepted).reduce((sum, g) => sum + (g.pointsOffered ?? 0), 0);
  }
}
