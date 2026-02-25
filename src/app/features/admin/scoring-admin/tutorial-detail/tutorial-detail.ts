import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { TutorialApi } from '../../../../models';

@Component({
  selector: 'app-tutorial-detail-admin',
  standalone: false,
  templateUrl: './tutorial-detail.html',
  styleUrl: './tutorial-detail.css',
})
export class TutorialDetail implements OnInit {
  readonly backRoute = '/admin/scoring/tutorials';

  loading = true;
  error: string | null = null;
  tutorial: TutorialApi | null = null;

  constructor(
    private route: ActivatedRoute,
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
      next: (t) => { this.tutorial = t; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load tutorial';
        this.cdr.detectChanges();
      }
    });
  }
}
