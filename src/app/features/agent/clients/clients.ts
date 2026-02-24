import { Component } from '@angular/core';
import { AgentClientRow } from '../../../models';

/**
 * ViewModel: agent clients list (MVVM).
 */
@Component({
  selector: 'app-clients',
  standalone: false,
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients {
  readonly pageTitle = 'Clients';
  readonly pageSubtitle = 'Search and verify clients.';
  readonly searchPlaceholder = 'Phone, CIN, or name...';
  readonly recentTitle = 'Recent';

  readonly clients: AgentClientRow[] = [
    { initials: 'AK', initialsBgClass: 'bg-blue-50', initialsColorClass: 'text-[#135bec]', name: 'Amadou Kone', meta: 'CIN 12345678 · +216 12 345 678', status: 'Verified', statusClass: 'text-green-600 bg-green-50' },
    { initials: 'MS', initialsBgClass: 'bg-amber-50', initialsColorClass: 'text-amber-600', name: 'Mariem Said', meta: 'CIN 87654321 · Pending verification', status: 'Pending', statusClass: 'text-amber-600 bg-amber-50', actionRoute: '/agent/loan-verification', actionLabel: 'Verify' },
  ];
}
