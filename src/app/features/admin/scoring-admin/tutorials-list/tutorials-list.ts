import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { TutorialApi } from '../../../../models';
import { AdminFilterOption } from '../../../../models';

@Component({
  selector: 'app-tutorials-list',
  standalone: false,
  templateUrl: './tutorials-list.html',
  styleUrl: './tutorials-list.css',
})
export class TutorialsList implements OnInit {
  readonly pageTitle = 'Tutorials';
  readonly pageSubtitle = 'Manage tutorials for document, profile, wallet, guarantee.';
  readonly addTutorialLabel = 'Add Tutorial';
  readonly searchPlaceholder = 'Search tutorials...';
  readonly typeFilterOptions: AdminFilterOption[] = [
    { value: '', label: 'All types' },
    { value: 'DOCUMENT', label: 'DOCUMENT' },
    { value: 'PROFILE', label: 'PROFILE' },
    { value: 'WALLET', label: 'WALLET' },
    { value: 'GUARANTEE', label: 'GUARANTEE' },
  ];
  readonly editLabel = 'Edit';
  readonly deleteLabel = 'Delete';

  loading = true;
  error: string | null = null;
  tutorials: TutorialApi[] = [];
  searchText = '';
  typeFilter = '';

  constructor(
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadTutorials();
  }

  loadTutorials() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.getTutorials().pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (list) => { this.tutorials = list ?? []; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load tutorials';
        this.cdr.detectChanges();
      }
    });
  }

  get filteredRows() {
    let list = this.tutorials;
    if (this.searchText.trim()) {
      const q = this.searchText.trim().toLowerCase();
      list = list.filter(t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.tutorialType || '').toLowerCase().includes(q)
      );
    }
    if (this.typeFilter) list = list.filter(t => t.tutorialType === this.typeFilter);
    return list.map(t => ({
      id: t.id,
      title: t.title,
      type: t.tutorialType || '',
      points: String(t.pointsAwarded ?? 0),
      difficulty: t.difficulty || 'N/A',
      difficultyClass: t.difficulty === 'EASY' ? 'bg-green-50 text-green-700' : t.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700',
      estMin: t.estimatedMinutes ?? 0,
      editRoute: `/admin/scoring/tutorials/${t.id}`,
    }));
  }

  deleteTutorial(id: number) {
    if (!confirm('Delete this tutorial?')) return;
    this.scoreService.deleteTutorial(id).subscribe({
      next: () => this.loadTutorials(),
      error: (err) => { this.error = err?.error?.message || 'Delete failed'; this.cdr.detectChanges(); }
    });
  }
}
