import { Component } from '@angular/core';

/**
 * ViewModel: admin global dashboard (MVVM).
 * Main copy and section titles in VM; table/cards data can be extended.
 */
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly pageTitle = 'Global Command Center';
  readonly pageSubtitle = 'Holistic ecosystem performance across all 11 FINIX modules.';
  readonly backendStatusLabel = 'Backend: Online';
  readonly ledgerStatusLabel = 'Ledger: Syncing';
  readonly systemLogsLabel = 'System Logs';
}
