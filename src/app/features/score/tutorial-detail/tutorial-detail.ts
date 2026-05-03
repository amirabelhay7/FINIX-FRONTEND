import { Component } from '@angular/core';

/**
 * ViewModel: tutorial detail (MVVM).
 */
@Component({
  selector: 'app-tutorial-detail',
  standalone: false,
  templateUrl: './tutorial-detail.html',
  styleUrl: './tutorial-detail.css',
})
export class TutorialDetail {
  readonly pageTitle = 'Upload your CIN';
  readonly pageSubtitle = 'Tutorial — 25 points · EASY · 5 min';
  readonly backRoute = '/score/tutorials';
  readonly backLabel = 'Back to tutorials';
  readonly descriptionText = 'Complete this tutorial to earn 25 score points. Upload a clear photo of your CIN (both sides).';
  readonly startLabel = 'Start tutorial';
  readonly markCompleteLabel = 'Mark complete';
}
