import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../core/score/score.service';
import { ScoreHistoryEntryApi } from '../../../models';

@Component({
  selector: 'app-score-history',
  standalone: false,
  templateUrl: './score-history.html',
  styleUrl: './score-history.css',
})
export class ScoreHistory implements OnInit {
  readonly Math = Math;

  loading = true;
  error: string | null = null;
  scoreHistory: ScoreHistoryEntryApi[] = [];

  selectedFilter = 'all';
  filters = ['all', 'increase', 'decrease', 'bonus', 'penalty'];

  constructor(
    private router: Router,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.scoreService.getMyScoreHistory().pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (list) => {
        this.scoreHistory = list ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load score history';
        this.cdr.detectChanges();
      }
    });
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
  }

  getFilteredHistory(): ScoreHistoryEntryApi[] {
    if (this.selectedFilter === 'all') {
      return this.scoreHistory;
    }
    return this.scoreHistory.filter(change => {
      switch (this.selectedFilter) {
        case 'increase':
          return change.changeType === 'INCREASE';
        case 'decrease':
          return change.changeType === 'DECREASE';
        case 'bonus':
          return change.changeType === 'BONUS';
        case 'penalty':
          return change.changeType === 'PENALTY';
        default:
          return true;
      }
    });
  }

  formatChangedAt(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  }

  getChangeTypeIcon(changeType: string) {
    switch (changeType) {
      case 'INCREASE':
        return 'trending_up';
      case 'DECREASE':
        return 'trending_down';
      case 'BONUS':
        return 'workspace_premium';
      case 'PENALTY':
        return 'warning';
      default:
        return 'change_history';
    }
  }

  getChangeTypeColor(changeType: string) {
    switch (changeType) {
      case 'INCREASE':
        return 'green';
      case 'DECREASE':
        return 'red';
      case 'BONUS':
        return 'purple';
      case 'PENALTY':
        return 'orange';
      default:
        return 'gray';
    }
  }
}
