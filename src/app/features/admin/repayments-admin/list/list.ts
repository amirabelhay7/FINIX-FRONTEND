import { Component } from '@angular/core';
import { AdminHubCard } from '../../../../models';

/**
 * ViewModel: repayments hub (MVVM).
 */
@Component({
  selector: 'app-admin-repayments-list',
  standalone: false,
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List {
  readonly pageTitle = 'Repayments';
  readonly pageSubtitle = 'Schedules, payments, delinquency, grace periods, recovery, penalties.';

  readonly cards: AdminHubCard[] = [
    { title: 'Payments', subtitle: 'All payments', route: '/admin/repayments/payments', icon: 'payments', iconColorClass: 'text-[#135bec]' },
    { title: 'Schedules', subtitle: 'Repayment schedules', route: '/admin/repayments/schedules', icon: 'calendar_month', iconColorClass: 'text-green-600' },
    { title: 'Delinquency', subtitle: 'Overdue cases', route: '/admin/repayments/delinquency', icon: 'warning', iconColorClass: 'text-red-600' },
    { title: 'Grace periods', subtitle: 'Grace period management', route: '/admin/repayments/grace', icon: 'schedule', iconColorClass: 'text-amber-500' },
    { title: 'Recovery actions', subtitle: 'Collection actions', route: '/admin/repayments/recovery', icon: 'restore', iconColorClass: 'text-purple-600' },
    { title: 'Penalties', subtitle: 'Late fees & penalties', route: '/admin/repayments/penalties', icon: 'gavel', iconColorClass: 'text-gray-700' },
  ];
}
