import { Component } from '@angular/core';
import { Segment } from '../../../../models';

/**
 * ViewModel: exposes segments and commands for the View.
 * View binds only to this component (MVVM).
 */
@Component({
  selector: 'app-segments-list',
  standalone: false,
  templateUrl: './segments-list.html',
  styleUrl: './segments-list.css',
})
export class SegmentsList {
  readonly pageTitle = 'Segments';
  readonly pageSubtitle = 'Audience segments for targeting.';

  readonly segments: Segment[] = [
    { id: 1, name: 'Gold tier clients', criteria: 'tier = GOLD, score ≥ 700', members: '1,247', lastUsed: 'Feb 22, 2026' },
    { id: 2, name: 'Silver tier clients', criteria: 'tier = SILVER, score 500–699', members: '3,892', lastUsed: 'Feb 20, 2026' },
    { id: 3, name: 'New clients (30d)', criteria: 'registeredAt > 30 days ago', members: '412', lastUsed: 'Feb 24, 2026' },
    { id: 4, name: 'High wallet balance', criteria: 'wallet.balance ≥ 2,000 TND', members: '892', lastUsed: 'Feb 18, 2026' },
    { id: 5, name: 'Vehicle loan holders', criteria: 'hasActiveVehicleLoan = true', members: '2,104', lastUsed: 'Feb 15, 2026' },
    { id: 6, name: 'Insurance policy holders', criteria: 'activePolicies ≥ 1', members: '5,631', lastUsed: 'Feb 23, 2026' },
    { id: 7, name: 'Inactive 90 days', criteria: 'lastLogin < 90 days ago', members: '1,088', lastUsed: 'Jan 10, 2026' },
  ];

  onAddSegment(): void {
    // Static: no-op; would call service when wired.
  }

  onEditSegment(segment: Segment): void {
    // Static: no-op
  }

  onDeleteSegment(segment: Segment): void {
    // Static: no-op
  }
}
