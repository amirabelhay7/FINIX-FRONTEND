import { Component } from '@angular/core';
import { ScheduleSummary, ScheduleItem } from '../../../models';

/**
 * ViewModel: repayment schedule (MVVM).
 */
@Component({
  selector: 'app-schedule',
  standalone: false,
  templateUrl: './schedule.html',
  styleUrl: './schedule.css',
})
export class Schedule {
  readonly pageTitle = 'Repayment Schedule';
  readonly pageSubtitle = 'Your loan repayment plan and upcoming due dates.';

  readonly summary: ScheduleSummary = {
    contractNumber: 'FIN-2025-0842',
    totalToRepay: '5,342.40 TND',
    remaining: '4,006.80 TND',
    progress: '2 / 12 payments',
    monthly: '445.20 TND',
  };

  readonly scheduleItems: ScheduleItem[] = this.buildScheduleItems();

  private buildScheduleItems(): ScheduleItem[] {
    const paid: ScheduleItem[] = [
      { label: 'Installment 1 · Jan 15, 2025', statusNote: 'Paid Jan 15 · Wallet', amount: '445.20 TND', status: 'paid', icon: 'check_circle', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
      { label: 'Installment 2 · Feb 15, 2025', statusNote: 'Paid Feb 15 · Wallet', amount: '445.20 TND', status: 'paid', icon: 'check_circle', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
    ];
    const due: ScheduleItem[] = [
      { label: 'Installment 3 · Mar 15, 2025', statusNote: 'Due in 18 days', amount: '445.20 TND', status: 'due', icon: 'schedule', iconBgClass: 'bg-amber-50', iconColorClass: 'text-amber-600', rowBgClass: 'bg-amber-50/50', payRoute: '/wallet' },
    ];
    const dates = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const upcoming: ScheduleItem[] = [];
    for (let i = 4; i <= 12; i++) {
      upcoming.push({
        label: `Installment ${i} · ${dates[i - 4]} 15, 2025`,
        amount: '445.20 TND',
        status: 'upcoming',
        icon: 'calendar_month',
        iconBgClass: 'bg-gray-50',
        iconColorClass: 'text-gray-400',
      });
    }
    return [...paid, ...due, ...upcoming];
  }
}
