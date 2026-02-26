import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

interface SidebarItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input() isOpen = false;
  @Output() navigate = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

  protected readonly menuItems: SidebarItem[] = [
    { label: 'Dashboard', icon: 'dashboard', path: '/admin/dashboard' },
    { label: 'Credit', icon: 'monetization_on', path: '/admin/credit' },
    { label: 'Scoring', icon: 'analytics', path: '/admin/scoring' },
    { label: 'Wallet', icon: 'account_balance_wallet', path: '/admin/wallet' },
    { label: 'Insurance', icon: 'verified_user', path: '/admin/insurance' },
    { label: 'Repayment', icon: 'payments', path: '/admin/repayment' },
    { label: 'Vehicles', icon: 'directions_car', path: '/admin/vehicles' },
  ];

  onNavigate(): void {
    this.navigate.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}

