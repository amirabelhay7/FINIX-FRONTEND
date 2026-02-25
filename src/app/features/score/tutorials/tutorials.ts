import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../core/score/score.service';
import { TutorialApi } from '../../../models';

@Component({
  selector: 'app-tutorials',
  standalone: false,
  templateUrl: './tutorials.html',
  styleUrl: './tutorials.css',
})
export class Tutorials implements OnInit {
  selectedCategory = 'All';
  selectedDifficulty = 'All';
  loading = true;
  error: string | null = null;
  tutorials: Array<TutorialApi & { status: string; color: string; icon: string; progress?: number }> = [];
  categories = ['All', 'DOCUMENT', 'PROFILE', 'WALLET', 'GUARANTEE'];
  difficulties = ['All', 'EASY', 'MEDIUM', 'HARD'];
  showNotFoundMessage = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['notFound'] === '1') {
        this.showNotFoundMessage = true;
        this.router.navigate([], { relativeTo: this.route, queryParams: {}, queryParamsHandling: '' });
      }
      this.cdr.detectChanges();
    });
    this.loadTutorials();
  }

  loadTutorials() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    forkJoin({
      all: this.scoreService.getTutorials(),
      completed: this.scoreService.getMyCompletedTutorials(),
    }).pipe(finalize(() => { this.loading = false; this.cdr.detectChanges(); })).subscribe({
      next: ({ all: allList, completed }) => {
        const completedIds = new Set((completed ?? []).map(t => t.id));
        this.tutorials = (allList ?? []).map(t => this.toDisplay(t, completedIds.has(t.id)));
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load tutorials';
        this.cdr.detectChanges();
      }
    });
  }

  private toDisplay(t: TutorialApi, isCompleted: boolean): TutorialApi & { status: string; color: string; icon: string; progress?: number } {
    const status = isCompleted ? 'COMPLETED' : (t.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'NOT_STARTED');
    const typeMap: Record<string, string> = { DOCUMENT: 'description', PROFILE: 'person', WALLET: 'account_balance_wallet', GUARANTEE: 'handshake' };
    const colorMap: Record<string, string> = { DOCUMENT: 'blue', PROFILE: 'green', WALLET: 'purple', GUARANTEE: 'orange' };
    return {
      ...t,
      status,
      color: colorMap[t.tutorialType || ''] || 'gray',
      icon: typeMap[t.tutorialType || ''] || 'school',
      progress: status === 'IN_PROGRESS' ? 60 : undefined,
    };
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
  }

  selectDifficulty(difficulty: string) {
    this.selectedDifficulty = difficulty;
  }

  startTutorial(tutorial: TutorialApi & { status: string }) {
    if (tutorial.status === 'COMPLETED') return;
    this.scoreService.startTutorialMe(tutorial.id).subscribe({
      next: (updated) => {
        this.loadTutorials();
        this.router.navigate(['/score/tutorials', updated.id]);
      },
      error: (err) => { this.error = err?.error?.message || 'Failed to start'; this.cdr.detectChanges(); }
    });
  }

  completeTutorial(tutorial: TutorialApi & { status: string }, event: Event) {
    event.stopPropagation();
    if (tutorial.status === 'COMPLETED') return;
    this.scoreService.completeTutorialMe(tutorial.id).subscribe({
      next: () => this.loadTutorials(),
      error: (err) => { this.error = err?.error?.message || 'Failed to complete'; this.cdr.detectChanges(); }
    });
  }

  viewTutorialDetail(tutorial: TutorialApi) {
    this.router.navigate(['/score/tutorials', tutorial.id]);
  }

  getFilteredTutorials() {
    let list = this.tutorials;
    if (this.selectedCategory !== 'All') {
      list = list.filter(t => (t.tutorialType || '') === this.selectedCategory);
    }
    if (this.selectedDifficulty !== 'All') {
      list = list.filter(t => (t.difficulty || '') === this.selectedDifficulty);
    }
    return list;
  }
}
