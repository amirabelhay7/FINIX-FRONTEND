import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-agent',
  standalone: false,
  templateUrl: './agent.html',
  styleUrl: './agent.css',
})
export class AgentLayout {
  protected readonly isSidebarOpen = signal(false);

  protected readonly menuItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/agent/dashboard' },
    { label: 'Clients', icon: 'group', path: '/agent/clients' },
    { label: 'Wallet top-up', icon: 'account_balance_wallet', path: '/agent/top-up' },
    { label: 'Loan verification', icon: 'verified_user', path: '/agent/loan-verification' },
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
