import { Component } from '@angular/core';
import { SavingsMonthRow } from '../../../models';

/**
 * ViewModel: savings challenge (MVVM).
 */
@Component({
  selector: 'app-savings-challenge',
  standalone: false,
  templateUrl: './savings-challenge.html',
  styleUrl: './savings-challenge.css',
})
export class SavingsChallenge {
  readonly pageTitle = 'Savings Challenge';
  readonly pageSubtitle = 'Save regularly to earn points — use savings as down payment for vehicle credit.';
  readonly backRoute = '/score/dashboard';
  readonly backLabel = 'Back to score';
  readonly commitmentLabel = 'Your commitment';
  readonly commitmentAmount = '50 TND';
  readonly commitmentUnit = '/ month';
  readonly commitmentNote = 'Saved 3 months in a row → +45 points this month';
  readonly progressText = '3/4 this month';
  readonly progressPercent = 75;
  readonly totalSavedLabel = 'Total saved (challenge)';
  readonly totalSavedAmount = '450 TND';
  readonly totalSavedNote = 'Can be used as down payment for credit';
  readonly pointsEarnedLabel = 'Points earned (savings)';
  readonly pointsEarnedAmount = '+120';
  readonly pointsEarnedNote = 'Last 3 months';
  readonly monthlyHistoryTitle = 'Monthly history';
  readonly tipText = 'Set a monthly amount (e.g. 50 TND). Each on-time save earns points and builds your eligibility for vehicle micro-credit.';

  readonly monthlyHistory: SavingsMonthRow[] = [
    { month: 'February 2025', detail: '50 TND saved · +15 pts', statusLabel: 'Done', statusClass: 'text-green-600' },
    { month: 'January 2025', detail: '50 TND saved · +15 pts', statusLabel: 'Done', statusClass: 'text-green-600' },
  ];
}
