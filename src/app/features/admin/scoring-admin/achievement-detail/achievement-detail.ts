import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { AchievementApi } from '../../../../models';

@Component({
  selector: 'app-achievement-detail-admin',
  standalone: false,
  templateUrl: './achievement-detail.html',
  styleUrl: './achievement-detail.css',
})
export class AchievementDetail implements OnInit {
  readonly backRoute = '/admin/scoring/achievements';

  loading = true;
  error: string | null = null;
  achievement: AchievementApi | null = null;

  constructor(
    private route: ActivatedRoute,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadAchievement(+id);
  }

  loadAchievement(id: number) {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.getAchievementById(id).pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (a) => { this.achievement = a; this.cdr.detectChanges(); },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load achievement';
        this.cdr.detectChanges();
      }
    });
  }
}
