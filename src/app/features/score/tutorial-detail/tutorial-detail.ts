import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../core/score/score.service';
import { TutorialApi } from '../../../models';

export type TutorialStep =
  | { type: 'text'; content: string }
  | { type: 'quiz'; question: string; options: { letter: string; text: string }[]; correct: string }
  | { type: 'check'; message: string };

@Component({
  selector: 'app-tutorial-detail',
  standalone: false,
  templateUrl: './tutorial-detail.html',
  styleUrl: './tutorial-detail.css',
})
export class TutorialDetail implements OnInit {
  readonly backRoute = '/score/tutorials';
  readonly backLabel = 'Back to tutorials';
  readonly startLabel = 'Start tutorial';
  readonly nextLabel = 'Next step';
  readonly prevLabel = 'Previous';
  readonly markCompleteLabel = 'Mark complete';
  readonly completedLabel = 'Completed';
  readonly checkContinueLabel = 'Continue';
  readonly quizCorrectLabel = 'Correct!';
  readonly quizWrongLabel = 'Not quite. Try again!';

  loading = true;
  error: string | null = null;
  tutorial: TutorialApi | null = null;
  completed = false;
  steps: TutorialStep[] = [];
  currentStep = 0;
  stepDirection: 'next' | 'prev' = 'next';
  /** For quiz steps: true after user answered, true if correct. */
  quizAnswered = false;
  quizCorrect = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadTutorial(+id);
  }

  loadTutorial(id: number) {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.getTutorialById(id).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (t) => {
        this.tutorial = t;
        this.completed = !!t.isCompleted;
        this.steps = this.parseSteps(t.description);
        this.currentStep = 0;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err?.status === 404) {
          this.router.navigate(['/score/tutorials'], { queryParams: { notFound: '1' } });
          return;
        }
        this.error = err?.error?.message || err?.message || 'Failed to load tutorial';
        this.cdr.detectChanges();
      }
    });
  }

  private parseSteps(description: string | undefined): TutorialStep[] {
    if (!description || !description.trim()) return [];
    const lines = description.split(/\n/).map(s => s.trim()).filter(s => s.length > 0);
    const out: TutorialStep[] = [];
    for (const line of lines) {
      if (line.startsWith('QUIZ:')) {
        const rest = line.slice(5).trim();
        const parts = rest.split('|');
        const question = parts[0]?.trim() || '';
        const options: { letter: string; text: string }[] = [];
        let correct = '';
        for (let i = 1; i < parts.length; i++) {
          const p = parts[i].trim();
          if (p.startsWith('CORRECT:')) {
            correct = p.slice(8).trim().toUpperCase();
            break;
          }
          const colon = p.indexOf(':');
          if (colon > 0) {
            options.push({ letter: p.slice(0, colon).trim().toUpperCase(), text: p.slice(colon + 1).trim() });
          }
        }
        if (question && options.length && correct) out.push({ type: 'quiz', question, options, correct });
      } else if (line.startsWith('CHECK:')) {
        out.push({ type: 'check', message: line.slice(6).trim() });
      } else {
        out.push({ type: 'text', content: line });
      }
    }
    return out;
  }

  getCurrentStep(): TutorialStep | null {
    return this.steps.length && this.currentStep >= 0 && this.currentStep < this.steps.length
      ? this.steps[this.currentStep]
      : null;
  }

  isQuizStep(step: TutorialStep | null): step is { type: 'quiz'; question: string; options: { letter: string; text: string }[]; correct: string } {
    return step !== null && step.type === 'quiz';
  }

  isCheckStep(step: TutorialStep | null): step is { type: 'check'; message: string } {
    return step !== null && step.type === 'check';
  }

  selectQuizOption(letter: string) {
    const step = this.getCurrentStep();
    if (!step || step.type !== 'quiz' || this.quizAnswered) return;
    this.quizAnswered = true;
    this.quizCorrect = step.correct === letter.toUpperCase();
    this.cdr.detectChanges();
  }

  advanceAfterQuiz() {
    this.quizAnswered = false;
    this.quizCorrect = false;
    this.stepDirection = 'next';
    if (this.currentStep < this.steps.length - 1) this.currentStep++;
    else this.markComplete();
    this.cdr.detectChanges();
  }

  get started(): boolean {
    return !!this.tutorial?.userId;
  }

  start() {
    if (!this.tutorial) return;
    this.scoreService.startTutorialMe(this.tutorial.id).subscribe({
      next: (updated) => {
        if (updated.id !== this.tutorial!.id) {
          this.router.navigate(['/score/tutorials', updated.id], { replaceUrl: true });
          return;
        }
        this.tutorial = updated;
        this.steps = this.parseSteps(updated.description);
        this.currentStep = 0;
        this.cdr.detectChanges();
      },
      error: (err) => { this.error = err?.error?.message || 'Start failed'; this.cdr.detectChanges(); }
    });
  }

  next() {
    this.quizAnswered = false;
    this.quizCorrect = false;
    this.stepDirection = 'next';
    if (this.currentStep < this.steps.length - 1) this.currentStep++;
    this.cdr.detectChanges();
  }

  prev() {
    this.quizAnswered = false;
    this.quizCorrect = false;
    this.stepDirection = 'prev';
    if (this.currentStep > 0) this.currentStep--;
    this.cdr.detectChanges();
  }

  markComplete() {
    if (!this.tutorial) return;
    this.scoreService.completeTutorialMe(this.tutorial.id).subscribe({
      next: () => { this.completed = true; this.cdr.detectChanges(); },
      error: (err) => { this.error = err?.error?.message || 'Complete failed'; this.cdr.detectChanges(); }
    });
  }
}
