import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../services/auth/auth.service';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  fuel: string;
  transmission: string;
  color: string;
  status: 'active' | 'pending' | 'sold';
  image: string;
  date: string;
  views: number;
}

@Component({
  selector: 'app-seller',
  standalone: false,
  templateUrl: './seller.html',
  styleUrl: './seller.css',
  encapsulation: ViewEncapsulation.None,
})
export class SellerLayout implements OnInit, OnDestroy {
  currentTheme: 'light' | 'dark' = 'dark';
  showUserDropdown = false;
  userName = '';
  userInitials = '';
  userEmail = '';
  showAddModal = false;
  activeTab = 'all';
  searchQuery = '';

  stats = [
    { label: 'Active listings', value: '12', icon: '🚗', trend: '+3 this month', trendClass: 'up' },
    { label: 'Total views', value: '1,847', icon: '👁️', trend: '+12%', trendClass: 'up' },
    { label: 'Vehicles sold', value: '34', icon: '✅', trend: '+5 this month', trendClass: 'up' },
    { label: 'Estimated revenue', value: '487K', suffix: 'TND', icon: '💰', trend: '+8.2%', trendClass: 'up' },
  ];

  vehicles: Vehicle[] = [
    { id: 1, brand: 'Renault', model: 'Clio 5', year: 2024, price: 52000, km: 12000, fuel: 'Gasoline', transmission: 'Manual', color: 'White', status: 'active', image: '🚗', date: 'Mar 15, 2026', views: 234 },
    { id: 2, brand: 'Peugeot', model: '208 GT', year: 2023, price: 68000, km: 8500, fuel: 'Diesel', transmission: 'Automatic', color: 'Black', status: 'active', image: '🚙', date: 'Mar 12, 2026', views: 187 },
    { id: 3, brand: 'Volkswagen', model: 'Golf 8', year: 2024, price: 95000, km: 5200, fuel: 'Gasoline', transmission: 'Automatic', color: 'Gray', status: 'active', image: '🚘', date: 'Mar 10, 2026', views: 312 },
    { id: 4, brand: 'Toyota', model: 'Yaris Cross', year: 2023, price: 78000, km: 15000, fuel: 'Hybrid', transmission: 'Automatic', color: 'Blue', status: 'pending', image: '🚗', date: 'Mar 8, 2026', views: 89 },
    { id: 5, brand: 'Hyundai', model: 'Tucson', year: 2024, price: 115000, km: 3000, fuel: 'Diesel', transmission: 'Automatic', color: 'Red', status: 'active', image: '🚙', date: 'Mar 5, 2026', views: 456 },
    { id: 6, brand: 'Dacia', model: 'Duster', year: 2022, price: 62000, km: 28000, fuel: 'Diesel', transmission: 'Manual', color: 'Green', status: 'sold', image: '🚘', date: 'Mar 1, 2026', views: 523 },
    { id: 7, brand: 'Kia', model: 'Sportage', year: 2024, price: 105000, km: 7800, fuel: 'Gasoline', transmission: 'Automatic', color: 'White', status: 'active', image: '🚗', date: 'Feb 28, 2026', views: 198 },
    { id: 8, brand: 'Fiat', model: '500', year: 2023, price: 42000, km: 19000, fuel: 'Gasoline', transmission: 'Manual', color: 'Pink', status: 'sold', image: '🚙', date: 'Feb 25, 2026', views: 345 },
  ];

  newVehicle = { brand: '', model: '', year: 2024, price: 0, km: 0, fuel: 'Gasoline', transmission: 'Manual', color: '', description: '' };

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private themeService: ThemeService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.initTheme(this.currentTheme);
    this.loadUser();
  }

  private loadUser(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.userName = user.name || 'Seller';
        this.userEmail = user.email || '';
      }
    } catch { }
    if (!this.userName) this.userName = 'Seller';
    const parts = this.userName.split(' ');
    this.userInitials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
  }

  toggleTheme(): void {
    this.currentTheme = this.themeService.toggleTheme(this.currentTheme);
  }

  get filteredVehicles(): Vehicle[] {
    let list = this.vehicles;
    if (this.activeTab !== 'all') list = list.filter(v => v.status === this.activeTab);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(v => v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q));
    }
    return list;
  }

  get activeCounts() {
    return {
      all: this.vehicles.length,
      active: this.vehicles.filter(v => v.status === 'active').length,
      pending: this.vehicles.filter(v => v.status === 'pending').length,
      sold: this.vehicles.filter(v => v.status === 'sold').length,
    };
  }

  formatPrice(p: number): string { return p.toLocaleString('en-US') + ' TND'; }
  formatKm(k: number): string { return k.toLocaleString('en-US') + ' km'; }

  toggleUserDropdown(): void { this.showUserDropdown = !this.showUserDropdown; }

  openAddModal(): void {
    this.showAddModal = true;
    this.newVehicle = { brand: '', model: '', year: 2024, price: 0, km: 0, fuel: 'Gasoline', transmission: 'Manual', color: '', description: '' };
  }

  closeAddModal(): void { this.showAddModal = false; }

  logout(): void {
    this.showUserDropdown = false;
    this.authService.logout();
  }
}
