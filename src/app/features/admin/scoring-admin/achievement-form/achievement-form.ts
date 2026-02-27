import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ScoreService } from '../../../../core/score/score.service';
import { AchievementRequest } from '../../../../models';
import { AdminFilterOption } from '../../../../models';

@Component({
  selector: 'app-achievement-form',
  standalone: false,
  templateUrl: './achievement-form.html',
  styleUrl: './achievement-form.css',
})
export class AchievementForm implements OnInit {
  readonly backRoute = '/admin/scoring/achievements';
  readonly cancelRoute = '/admin/scoring/achievements';
  readonly typeOptions: AdminFilterOption[] = [
    { value: '', label: 'Select type' },
    { value: 'DOCUMENT', label: 'DOCUMENT' },
    { value: 'PROFILE', label: 'PROFILE' },
    { value: 'WALLET', label: 'WALLET' },
    { value: 'GUARANTEE', label: 'GUARANTEE' },
    { value: 'LOAN', label: 'LOAN' },
    { value: 'TIER_UPGRADE', label: 'TIER_UPGRADE' },
  ];
  readonly cancelLabel = 'Cancel';

  loading = false;
  loadingData = false;
  error: string | null = null;
  title = '';
  description = '';
  pointsAwarded: number | null = 25;
  achievementType = '';
  tierRequired: number | null = null;
  badgeColor = '';
  isSecret = false;
  iconUrl = '';
  tutorialUrl = '';

  /** Set when route has edit/:id; form submits as update. */
  editId: number | null = null;
  get saveLabel(): string {
    return this.editId != null ? 'Update achievement' : 'Create achievement';
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private scoreService: ScoreService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      if (!isNaN(id)) {
        this.editId = id;
        this.loadAchievement(id);
      }
    }
  }

  loadAchievement(id: number): void {
    this.loadingData = true;
    this.error = null;
    this.cdr.detectChanges();
    this.scoreService.getAchievementById(id).pipe(
      finalize(() => { this.loadingData = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (a) => {
        this.title = a.title ?? '';
        this.description = a.description ?? '';
        this.pointsAwarded = a.pointsAwarded ?? 25;
        this.achievementType = a.achievementType ?? '';
        this.tierRequired = a.tierRequired ?? null;
        this.badgeColor = a.badgeColor ?? '';
        this.isSecret = a.isSecret ?? false;
        this.iconUrl = a.iconUrl ?? '';
        this.tutorialUrl = a.tutorialUrl ?? '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.message || 'Failed to load achievement';
        this.cdr.detectChanges();
      }
    });
  }

  buildRequest(): AchievementRequest {
    return {
      title: this.title.trim(),
      description: this.description.trim(),
      pointsAwarded: this.pointsAwarded ?? 25,
      achievementType: this.achievementType,
      tierRequired: this.tierRequired ?? undefined,
      badgeColor: this.badgeColor.trim() || undefined,
      isSecret: this.isSecret,
      iconUrl: this.iconUrl.trim() || undefined,
      tutorialUrl: this.tutorialUrl.trim() || undefined,
    };
  }

  save() {
    this.error = null;
    if (this.title.trim().length < 3) {
      this.error = 'Title must be at least 3 characters.';
      this.cdr.detectChanges();
      return;
    }
    if (this.description.trim().length < 10) {
      this.error = 'Description must be at least 10 characters.';
      this.cdr.detectChanges();
      return;
    }
    const pts = this.pointsAwarded ?? 0;
    if (pts < 1 || pts > 1000) {
      this.error = 'Points must be between 1 and 1000.';
      this.cdr.detectChanges();
      return;
    }
    if (!this.achievementType) {
      this.error = 'Type is required.';
      this.cdr.detectChanges();
      return;
    }
    this.loading = true;
    this.cdr.detectChanges();
    const req = this.buildRequest();
    const op = this.editId != null
      ? this.scoreService.updateAchievement(this.editId, req)
      : this.scoreService.createAchievement(req);
    op.pipe(
      finalize(() => { this.loading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => this.router.navigate(['/admin/scoring/achievements']),
      error: (err) => {
        this.error = err?.error?.message || err?.message || (this.editId != null ? 'Update failed' : 'Create failed');
        this.cdr.detectChanges();
      }
    });
  }
}
