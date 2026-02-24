import { Component } from '@angular/core';
import { LoginSummaryCard, LoginLogRow } from '../../../models';

/**
 * ViewModel: login history (MVVM).
 */
@Component({
  selector: 'app-login-history',
  standalone: false,
  templateUrl: './login-history.html',
  styleUrl: './login-history.css',
})
export class LoginHistory {
  readonly pageTitle = 'Login History';
  readonly pageSubtitle = 'A complete audit trail of all access to your account.';
  readonly terminateLabel = 'Terminate All Sessions';
  readonly accessLogsTitle = 'Access Logs';
  readonly filterOptions = ['All Events', 'Successful', 'Failed', 'Suspicious'];
  readonly paginationText = 'Showing 4 of 42 events';
  readonly prevLabel = 'Previous';
  readonly nextLabel = 'Next';

  readonly summaryCards: LoginSummaryCard[] = [
    { label: 'Total Logins (30d)', value: '42', subValue: '↑ Normal activity', valueClass: 'text-green-600' },
    { label: 'Active Sessions', value: '2', subValue: 'Current: Chrome / Linux', valueClass: 'text-[#135bec]', borderClass: '' },
    { label: 'Suspicious Attempts', value: '1', subValue: '⚠ Blocked — IP: 192.168.1.x', valueClass: 'text-red-600', borderClass: 'border-red-50 bg-red-50/30' },
  ];

  readonly logs: LoginLogRow[] = [
    { dateTime: 'Feb 24, 2026 — 00:02:14', device: 'Chrome / Linux', deviceIcon: 'computer', deviceIconClass: 'text-gray-400', ip: '196.14.x.x', location: 'Tunis, TN 🇹🇳', status: 'Success', statusClass: 'bg-green-50 text-green-700 border-green-100' },
    { dateTime: 'Feb 23, 2026 — 18:45:09', device: 'Safari / iPhone', deviceIcon: 'smartphone', deviceIconClass: 'text-gray-400', ip: '196.14.x.x', location: 'Tunis, TN 🇹🇳', status: 'Success', statusClass: 'bg-green-50 text-green-700 border-green-100' },
    { dateTime: 'Feb 22, 2026 — 03:11:52', device: 'Unknown Device', deviceIcon: 'devices', deviceIconClass: 'text-red-400', ip: '192.168.1.102', ipClass: 'text-red-500', location: 'Unknown 🚩', status: 'Blocked', statusClass: 'bg-red-50 text-red-700 border-red-200', rowClass: 'bg-red-50/20' },
    { dateTime: 'Feb 21, 2026 — 09:30:00', device: 'Firefox / Linux', deviceIcon: 'computer', deviceIconClass: 'text-gray-400', ip: '196.14.x.x', location: 'Tunis, TN 🇹🇳', status: 'Success', statusClass: 'bg-green-50 text-green-700 border-green-100' },
  ];
}
