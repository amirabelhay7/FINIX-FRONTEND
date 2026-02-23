import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-backoffice',
  standalone: false,
  templateUrl: './backoffice.html',
  styleUrl: './backoffice.css',
})
export class Backoffice {
  protected readonly isSidebarOpen = signal(false);

  protected readonly menuItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { label: 'Users & Identity', icon: 'group', path: '/admin/users' },
    { label: 'Wallet & Ledger', icon: 'account_balance_wallet', path: '/admin/wallet' },
    { label: 'Credit Center', icon: 'monetization_on', path: '/admin/credit' },
    { label: 'Insurance Desk', icon: 'verified_user', path: '/admin/insurance' },
    { label: 'Risk & Scoring', icon: 'analytics', path: '/admin/scoring' },
    { label: 'Collateral (Vehicles)', icon: 'directions_car', path: '/admin/vehicles' },
    { label: 'Repayments', icon: 'payments', path: '/admin/repayments' },
    { label: 'Marketing & Events', icon: 'campaign', path: '/admin/marketing' },
    { label: 'Treasury & Strategy', icon: 'query_stats', path: '/admin/steering' },
  ];

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebarOnMobile() {
    if (window.innerWidth < 1024) {
      this.isSidebarOpen.set(false);
    }
  }
}
