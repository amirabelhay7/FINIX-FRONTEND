import { Component } from '@angular/core';
import { AgentKpis, AgentQuickAction, AgentActivityItem } from '../../../models';

/**
 * ViewModel: agent dashboard (MVVM).
 */
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  readonly pageTitle = 'Agent Dashboard';
  readonly pageSubtitle = "Your activity and today's tasks.";
  readonly quickActionsTitle = 'Quick actions';
  readonly recentActivityTitle = 'Recent activity';

  readonly kpis: AgentKpis = {
    topUpsToday: '12',
    verificationsPending: '3',
    commissionMonth: '420 TND',
  };

  readonly quickActions: AgentQuickAction[] = [
    { title: 'Load client wallet', route: '/agent/top-up', icon: 'account_balance_wallet' },
    { title: 'Verify loan applicant', route: '/agent/loan-verification', icon: 'verified_user' },
  ];

  readonly recentActivity: AgentActivityItem[] = [
    { title: 'Top-up · Amadou Kone', subtitle: '+2,000 TND · 25 mins ago', icon: 'south_east', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
    { title: 'Verification · Youssef Hammami', subtitle: 'Loan 7,500 TND · 1 hour ago', icon: 'verified_user', iconBgClass: 'bg-blue-50', iconColorClass: 'text-[#135bec]' },
    { title: 'Top-up · Fatma Trabelsi', subtitle: '+500 TND · 2 hours ago', icon: 'south_east', iconBgClass: 'bg-green-50', iconColorClass: 'text-green-600' },
  ];
}
