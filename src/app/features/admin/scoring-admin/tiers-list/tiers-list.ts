import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { UserTierApi } from '../../../../models';

@Component({
  selector: 'app-tiers-list',
  standalone: false,
  templateUrl: './tiers-list.html',
  styleUrl: './tiers-list.css',
})
export class TiersList implements OnInit {
  readonly pageTitle = 'User Tiers';
  readonly pageSubtitle = 'Bronze, Silver, Gold, Platinum — score ranges and benefits.';
  readonly addTierLabel = 'Add Tier';
  readonly addTierRoute = '/admin/scoring/tiers/new';
  readonly editLabel = 'Edit';
  readonly activateLabel = 'Activate';
  readonly deactivateLabel = 'Deactivate';
  readonly deleteLabel = 'Delete';

  loading = true;
  error: string | null = null;
  tiers: UserTierApi[] = [];

  constructor(
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTiers();
  }

  loadTiers() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.getTiers().pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (list) => { this.tiers = list ?? []; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load tiers';
        this.cdr.detectChanges();
      }
    });
  }

  get activeTiersCount(): number {
    return (this.tiers ?? []).filter(t => t.isActive).length;
  }

  get rows() {
    return this.tiers.map(t => ({
      id: t.id,
      tierName: t.tierName,
      scoreRange: `${t.minScore} – ${t.maxScore}`,
      status: t.isActive ? 'Active' : 'Inactive',
      statusClass: t.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600',
      editRoute: `/admin/scoring/tiers/edit/${t.id}`,
      isActive: t.isActive,
    }));
  }

  activate(id: number) {
    this.scoreService.activateTier(id).subscribe({
      next: () => this.loadTiers(),
      error: (err) => { this.error = err?.error?.message || 'Activate failed'; this.cdr.detectChanges(); }
    });
  }

  deactivate(id: number) {
    this.scoreService.deactivateTier(id).subscribe({
      next: () => this.loadTiers(),
      error: (err) => { this.error = err?.error?.message || 'Deactivate failed'; this.cdr.detectChanges(); }
    });
  }

  deleteTier(id: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!confirm('Delete this tier?')) return;
    this.scoreService.deleteTier(id).subscribe({
      next: () => this.loadTiers(),
      error: (err) => { this.error = err?.error?.message || 'Delete failed'; this.cdr.detectChanges(); }
    });
  }
}
