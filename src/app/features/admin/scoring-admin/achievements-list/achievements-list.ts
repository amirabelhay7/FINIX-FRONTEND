import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { AchievementApi } from '../../../../models';
import { AdminFilterOption } from '../../../../models';

@Component({
  selector: 'app-achievements-list',
  standalone: false,
  templateUrl: './achievements-list.html',
  styleUrl: './achievements-list.css',
})
export class AchievementsList implements OnInit {
  readonly pageTitle = 'Achievements';
  readonly pageSubtitle = 'Manage achievements (DOCUMENT, PROFILE, WALLET, GUARANTEE, LOAN).';
  readonly addAchievementLabel = 'Add Achievement';
  readonly searchPlaceholder = 'Search achievements...';
  readonly typeFilterOptions: AdminFilterOption[] = [
    { value: '', label: 'All types' },
    { value: 'DOCUMENT', label: 'DOCUMENT' },
    { value: 'PROFILE', label: 'PROFILE' },
    { value: 'WALLET', label: 'WALLET' },
    { value: 'GUARANTEE', label: 'GUARANTEE' },
    { value: 'LOAN', label: 'LOAN' },
  ];
  readonly editLabel = 'Edit';
  readonly deleteLabel = 'Delete';

  loading = true;
  error: string | null = null;
  achievements: AchievementApi[] = [];
  searchText = '';
  typeFilter = '';

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
    this.scoreService.getAchievements().pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (list) => { this.achievements = list ?? []; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load achievements';
        this.cdr.detectChanges();
      }
    });
  }

  get filteredRows() {
    let list = this.achievements;
    if (this.searchText.trim()) {
      const q = this.searchText.trim().toLowerCase();
      list = list.filter(a =>
        (a.title || '').toLowerCase().includes(q) ||
        (a.achievementType || '').toLowerCase().includes(q)
      );
    }
    if (this.typeFilter) list = list.filter(a => a.achievementType === this.typeFilter);
    return list.map(a => ({
      id: a.id,
      title: a.title,
      type: a.achievementType || '',
      points: String(a.pointsAwarded ?? 0),
      status: a.status || 'ACTIVE',
      statusClass: (a.status === 'ACTIVE' || !a.status) ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600',
      editRoute: `/admin/scoring/achievements/${a.id}`,
    }));
  }

  deleteAchievement(id: number) {
    if (!confirm('Delete this achievement?')) return;
    this.scoreService.deleteAchievement(id).subscribe({
      next: () => this.loadAchievements(),
      error: (err) => { this.error = err?.error?.message || 'Delete failed'; this.cdr.detectChanges(); }
    });
  }
}
