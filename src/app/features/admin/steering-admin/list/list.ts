import { Component } from '@angular/core';
import { AdminHubCard } from '../../../../models';

/**
 * ViewModel: steering hub (MVVM).
 */
@Component({
  selector: 'app-admin-steering-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  readonly pageTitle = 'Steering';
  readonly pageSubtitle = 'Treasury, cash movements, indicators, simulations.';

  readonly cards: AdminHubCard[] = [
    { title: 'Treasury', subtitle: 'Accounts & movements', route: '/admin/steering/treasury', icon: 'account_balance', iconColorClass: 'text-[#135bec]' },
    { title: 'Indicators', subtitle: 'KPIs', route: '/admin/steering/indicators', icon: 'analytics', iconColorClass: 'text-green-600' },
    { title: 'Simulations', subtitle: 'Scenarios', route: '/admin/steering/simulations', icon: 'calculate', iconColorClass: 'text-purple-600' },
  ];
}
