import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-seller',
  standalone: false,
  templateUrl: './seller.html',
  styleUrl: './seller.css',
})
export class SellerLayout {
  protected readonly isSidebarOpen = signal(false);

  protected readonly menuItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/seller/dashboard' },
    { label: 'My listings', icon: 'directions_car', path: '/seller/listings' },
    { label: 'Orders & contracts', icon: 'description', path: '/seller/orders' },
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
