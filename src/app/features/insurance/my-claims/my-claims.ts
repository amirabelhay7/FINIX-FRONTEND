import { Component } from '@angular/core';
import { ClaimRow } from '../../../models';

/**
 * ViewModel: my claims list (MVVM).
 */
@Component({
  selector: 'app-my-claims',
  standalone: false,
  templateUrl: './my-claims.html',
  styleUrl: './my-claims.css',
})
export class MyClaims {
  readonly pageTitle = 'My claims';
  readonly pageSubtitle = 'Your insurance claims and their status.';
  readonly fileClaimLabel = 'File a claim';
  readonly fileClaimRoute = '/insurance/file-claim';

  readonly claims: ClaimRow[] = [
    { id: 1, policy: 'Micro-health basic', amount: '500 TND', status: 'Pending', statusClass: 'bg-amber-50 text-amber-700', date: '2025-02-18', viewRoute: '/insurance/claims/1' },
  ];
}
