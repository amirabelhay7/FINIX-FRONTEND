import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../core/score/score.service';
import { UserScoreApi, UserTierApi, ScoreHistoryEntryApi } from '../../../models';

const MAX_SCORE = 850;

@Component({
  selector: 'app-scoring-dashboard',
  standalone: false,
  templateUrl: './scoring-dashboard.html',
  styleUrl: './scoring-dashboard.css',
})
export class ScoringDashboard implements OnInit {
  loading = true;
  error: string | null = null;

  currentScore = 0;
  maxScore = MAX_SCORE;
  scorePercentage = 0;
  userTier = '';
  pointsToNextTier: number | null = null;
  isEligibleForLoan = false;

  scoreBreakdown = {
    documents: 0,
    profile: 0,
    wallet: 0,
    guarantees: 0
  };

  recentChanges: Array<{ description: string; points: number; time: string; icon: string; color: string }> = [];

  constructor(
    private router: Router,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadScore();
  }

  loadScore() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    forkJoin({
      score: this.scoreService.getMyScore(),
      tier: this.scoreService.getMyTier(),
      history: this.scoreService.getMyScoreHistory()
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: ({ score, tier, history }) => {
        this.applyScore(score);
        this.applyTier(tier);
        this.applyRecentChanges(history);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load score';
        this.cdr.detectChanges();
      }
    });
  }

  private applyScore(s: UserScoreApi) {
    this.currentScore = s.totalScore ?? 0;
    this.scorePercentage = this.maxScore > 0 ? Math.round((this.currentScore / this.maxScore) * 100) : 0;
    this.isEligibleForLoan = s.isEligibleForLoan ?? false;
    this.scoreBreakdown = {
      documents: s.documentScore ?? 0,
      profile: s.profileScore ?? 0,
      wallet: s.walletScore ?? 0,
      guarantees: s.guaranteeScore ?? 0
    };
  }

  private applyTier(t: UserTierApi) {
    this.userTier = t?.tierName ?? 'Beginner';
    const nextMin = t?.nextTierMinScore;
    if (nextMin != null && nextMin > this.currentScore) {
      this.pointsToNextTier = nextMin - this.currentScore;
    } else {
      this.pointsToNextTier = null;
    }
  }

  private applyRecentChanges(history: ScoreHistoryEntryApi[]) {
    const toDisplay = (history || []).slice(0, 5).map(h => ({
      description: h.reason || 'Score change',
      points: h.scoreChange ?? 0,
      time: this.formatTime(h.changedAt),
      icon: this.changeTypeIcon(h.changeType),
      color: this.changeTypeColor(h.changeType)
    }));
    this.recentChanges = toDisplay.length ? toDisplay : [
      { description: 'No changes yet', points: 0, time: '—', icon: 'info', color: 'gray' }
    ];
  }

  private formatTime(iso: string): string {
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

  private changeTypeIcon(changeType: string): string {
    switch (changeType) {
      case 'INCREASE': return 'trending_up';
      case 'DECREASE': return 'trending_down';
      case 'BONUS': return 'workspace_premium';
      case 'PENALTY': return 'warning';
      default: return 'change_history';
    }
  }

  private changeTypeColor(changeType: string): string {
    switch (changeType) {
      case 'INCREASE': return 'green';
      case 'DECREASE': return 'red';
      case 'BONUS': return 'purple';
      case 'PENALTY': return 'orange';
      default: return 'gray';
    }
  }

  refreshScore() {
    this.loadScore();
  }

  navigateToAchievements() {
    this.router.navigate(['/score/achievements']);
  }

  navigateToTutorials() {
    this.router.navigate(['/score/tutorials']);
  }

  navigateToGuarantees() {
    this.router.navigate(['/score/guarantees']);
  }
}
