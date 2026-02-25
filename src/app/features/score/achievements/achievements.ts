import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../core/score/score.service';
import { AchievementApi } from '../../../models';

@Component({
  selector: 'app-achievements',
  standalone: false,
  templateUrl: './achievements.html',
  styleUrl: './achievements.css',
})
export class Achievements implements OnInit {
  selectedCategory = 'All';
  loading = true;
  error: string | null = null;
  unlockedAchievements: Array<AchievementApi & { icon: string; color: string; unlockedAt: string }> = [];
  lockedAchievements: Array<AchievementApi & { icon: string; color: string }> = [];
  totalUnlocked = 0;
  totalPoints = 0;

  private readonly typeToLabel: Record<string, string> = {
    DOCUMENT: 'Documents', PROFILE: 'Profile', WALLET: 'Wallet',
    GUARANTEE: 'Guarantees', LOAN: 'Loans', TIER: 'Tier'
  };
  private readonly iconMap: Record<string, string> = {
    DOCUMENT: 'verified', PROFILE: 'person', WALLET: 'account_balance_wallet',
    GUARANTEE: 'handshake', LOAN: 'payments', TIER: 'workspace_premium'
  };
  private readonly colorMap: Record<string, string> = {
    DOCUMENT: 'green', PROFILE: 'blue', WALLET: 'purple',
    GUARANTEE: 'orange', LOAN: 'red', TIER: 'yellow'
  };

  constructor(
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAchievements();
  }

  loadAchievements() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    forkJoin({
      completed: this.scoreService.getMyCompletedAchievements(),
      available: this.scoreService.getMyAvailableAchievements(),
    }).pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); })).subscribe({
      next: ({ completed, available }) => {
        const completedList = completed ?? [];
        const availableList = available ?? [];
        const completedIds = new Set(completedList.map(a => a.id));
        this.unlockedAchievements = completedList.map(a => ({
          ...a,
          icon: this.iconMap[a.achievementType || ''] || 'emoji_events',
          color: this.colorMap[a.achievementType || ''] || 'green',
          unlockedAt: a.unlockedAt ? this.formatTime(a.unlockedAt) : '—',
        }));
        this.lockedAchievements = availableList.filter(a => !completedIds.has(a.id)).map(a => ({
          ...a,
          icon: a.isSecret ? 'help' : (this.iconMap[a.achievementType || ''] || 'lock'),
          color: 'gray',
        }));
        this.totalUnlocked = this.unlockedAchievements.length;
        this.totalPoints = this.unlockedAchievements.reduce((s, a) => s + (a.pointsAwarded ?? 0), 0);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load achievements';
        this.cdr.detectChanges();
      }
    });
  }

  private formatTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString();
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  getFilteredUnlocked() {
    if (this.selectedCategory === 'All') return this.unlockedAchievements;
    const label = this.typeToLabel[this.selectedCategory] || this.selectedCategory;
    return this.unlockedAchievements.filter(a => this.typeToLabel[a.achievementType || ''] === label || a.achievementType === this.selectedCategory);
  }

  getFilteredLocked() {
    if (this.selectedCategory === 'All') return this.lockedAchievements;
    const label = this.typeToLabel[this.selectedCategory] || this.selectedCategory;
    return this.lockedAchievements.filter(a => this.typeToLabel[a.achievementType || ''] === label || a.achievementType === this.selectedCategory);
  }

  unlockAchievement(achievementType: string) {
    this.scoreService.unlockAchievementMe(achievementType).subscribe({
      next: () => this.loadAchievements(),
      error: (err) => { this.error = err?.error?.message || 'Unlock failed'; this.cdr.detectChanges(); }
    });
  }

  viewAchievementDetail(achievement: AchievementApi) {
    // Could navigate to detail or show modal
  }
}
