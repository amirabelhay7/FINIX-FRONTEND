import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { TutorialRequest } from '../../../../models';
import { AdminFilterOption } from '../../../../models';

@Component({
  selector: 'app-tutorial-form',
  standalone: false,
  templateUrl: './tutorial-form.html',
  styleUrl: './tutorial-form.css',
})
export class TutorialForm {
  readonly backRoute = '/admin/scoring/tutorials';
  readonly cancelRoute = '/admin/scoring/tutorials';
  readonly typeOptions: AdminFilterOption[] = [
    { value: '', label: 'Select type' },
    { value: 'DOCUMENT', label: 'DOCUMENT' },
    { value: 'PROFILE', label: 'PROFILE' },
    { value: 'WALLET', label: 'WALLET' },
    { value: 'GUARANTEE', label: 'GUARANTEE' },
  ];
  readonly difficultyOptions: AdminFilterOption[] = [
    { value: '', label: 'Select difficulty' },
    { value: 'EASY', label: 'EASY' },
    { value: 'MEDIUM', label: 'MEDIUM' },
    { value: 'HARD', label: 'HARD' },
  ];
  readonly saveLabel = 'Create tutorial';
  readonly cancelLabel = 'Cancel';

  loading = false;
  error: string | null = null;
  title = '';
  description = '';
  pointsAwarded: number | null = null;
  tutorialType = '';
  estimatedMinutes: number | null = null;
  difficulty = '';
  tutorialUrl = '';
  iconUrl = '';
  prerequisites = '';

  constructor(
    private router: Router,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  buildRequest(): TutorialRequest {
    return {
      title: this.title.trim(),
      description: this.description.trim() || '',
      pointsAwarded: this.pointsAwarded ?? 0,
      tutorialType: this.tutorialType,
      estimatedMinutes: this.estimatedMinutes ?? 0,
      difficulty: this.difficulty,
      tutorialUrl: this.tutorialUrl.trim() || undefined,
      iconUrl: this.iconUrl.trim() || undefined,
      prerequisites: this.prerequisites.trim() || undefined,
    };
  }

  save() {
    if (!this.title.trim()) {
      this.error = 'Title is required.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.tutorialType) {
      this.error = 'Type is required.';
      this.cdr.detectChanges();
      return;
    }
    if ((this.pointsAwarded ?? 0) < 0) {
      this.error = 'Points must be 0 or more.';
      this.cdr.detectChanges();
      return;
    }
    if ((this.estimatedMinutes ?? 0) < 0) {
      this.error = 'Estimated minutes must be 0 or more.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.difficulty) {
      this.error = 'Difficulty is required.';
      this.cdr.detectChanges();
      return;
    }
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.createTutorial(this.buildRequest()).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => this.router.navigate(['/admin/scoring/tutorials']),
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Create failed';
        this.cdr.detectChanges();
      },
    });
  }
}
