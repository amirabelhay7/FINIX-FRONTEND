import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';
import { AppNotificationDto, NotificationCategoryApi } from '../../models';
import { Subscription } from 'rxjs';

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
  showNotifDropdown = false;
  notifications: AppNotificationDto[] = [];
  notificationsLoading = false;
  unreadCount = 0;
  userName = '';
  userInitials = '';
  userEmail = '';
  userImageUrl = '';

  private readonly userUpdatedListener = () => this.loadUser();
  private notifRefreshSub?: Subscription;
  private dropdownPollingId: ReturnType<typeof setInterval> | null = null;

  showAddModal = false;
  activeTab = 'all';
  searchQuery = '';

  stats = [
    { label: 'Active listings', value: '12', icon: '🚗', trend: '+3 this month', trendClass: 'up' },
    { label: 'Total views', value: '1 847', icon: '👁️', trend: '+12%', trendClass: 'up' },
    { label: 'Vehicles sold', value: '34', icon: '✅', trend: '+5 this month', trendClass: 'up' },
    { label: 'Estimated revenue', value: '487K', suffix: 'TND', icon: '💰', trend: '+8.2%', trendClass: 'up' },
  ];

  vehicles: Vehicle[] = [
    { id: 1, brand: 'Renault', model: 'Clio 5', year: 2024, price: 52000, km: 12000, fuel: 'Petrol', transmission: 'Manual', color: 'White', status: 'active', image: '🚗', date: '15 Mar 2026', views: 234 },
    { id: 2, brand: 'Peugeot', model: '208 GT', year: 2023, price: 68000, km: 8500, fuel: 'Diesel', transmission: 'Automatic', color: 'Black', status: 'active', image: '🚙', date: '12 Mar 2026', views: 187 },
    { id: 3, brand: 'Volkswagen', model: 'Golf 8', year: 2024, price: 95000, km: 5200, fuel: 'Petrol', transmission: 'Automatic', color: 'Gray', status: 'active', image: '🚘', date: '10 Mar 2026', views: 312 },
    { id: 4, brand: 'Toyota', model: 'Yaris Cross', year: 2023, price: 78000, km: 15000, fuel: 'Hybrid', transmission: 'Automatic', color: 'Blue', status: 'pending', image: '🚗', date: '8 Mar 2026', views: 89 },
    { id: 5, brand: 'Hyundai', model: 'Tucson', year: 2024, price: 115000, km: 3000, fuel: 'Diesel', transmission: 'Automatic', color: 'Red', status: 'active', image: '🚙', date: '5 Mar 2026', views: 456 },
    { id: 6, brand: 'Dacia', model: 'Duster', year: 2022, price: 62000, km: 28000, fuel: 'Diesel', transmission: 'Manual', color: 'Green', status: 'sold', image: '🚘', date: '1 Mar 2026', views: 523 },
    { id: 7, brand: 'Kia', model: 'Sportage', year: 2024, price: 105000, km: 7800, fuel: 'Petrol', transmission: 'Automatic', color: 'White', status: 'active', image: '🚗', date: '28 Feb 2026', views: 198 },
    { id: 8, brand: 'Fiat', model: '500', year: 2023, price: 42000, km: 19000, fuel: 'Petrol', transmission: 'Manual', color: 'Rose', status: 'sold', image: '🚙', date: '25 Feb 2026', views: 345 },
  ];

  newVehicle = { brand: '', model: '', year: 2024, price: 0, km: 0, fuel: 'Petrol', transmission: 'Manual', color: '', description: '' };

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private auth: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('finix_theme') as 'light' | 'dark' | null;
    this.currentTheme = saved || 'dark';
    this.applyTheme();
    this.loadUser();
    this.loadUnreadCount();
    this.loadNotifications(true);
    this.notifRefreshSub = this.notificationService.refreshTrigger.subscribe(() => {
      this.loadUnreadCount();
      if (this.showNotifDropdown) this.loadNotifications();
    });
    window.addEventListener('finix-user-updated', this.userUpdatedListener);
  }

  private loadUser(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.userName = user.name || 'Seller';
        this.userEmail = user.email || '';
        this.userImageUrl = this.getImageUrl(user.profileImageUrl || '');
      }
    } catch { /* ignore */ }
    if (!this.userName) this.userName = 'Seller';
    const parts = this.userName.split(' ');
    this.userInitials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  ngOnDestroy(): void {
    window.removeEventListener('finix-user-updated', this.userUpdatedListener);
    this.notifRefreshSub?.unsubscribe();
    this.stopDropdownPolling();
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('finix_theme', this.currentTheme);
    this.applyTheme();
  }

  private applyTheme(): void {
    this.renderer.setAttribute(document.documentElement, 'data-theme', this.currentTheme);
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  toggleNotifDropdown(): void {
    this.showNotifDropdown = !this.showNotifDropdown;
    if (this.showNotifDropdown) {
      this.loadNotifications();
      this.loadUnreadCount();
      this.startDropdownPolling();
      return;
    }
    this.stopDropdownPolling();
  }

  closeNotifDropdown(): void {
    this.showNotifDropdown = false;
    this.stopDropdownPolling();
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount('VEHICLE').subscribe({
      next: (count) => (this.unreadCount = count),
      error: () => (this.unreadCount = 0),
    });
  }

  loadNotifications(silent = false): void {
    if (!silent) this.notificationsLoading = true;
    this.notificationService.getNotifications('VEHICLE').subscribe({
      next: (rows) => {
        this.notifications = rows.slice(0, 25);
        this.notificationsLoading = false;
      },
      error: () => {
        this.notifications = [];
        this.notificationsLoading = false;
      },
    });
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead('VEHICLE').subscribe({
      next: () => {
        this.loadUnreadCount();
        this.loadNotifications();
      },
    });
  }

  onSelectNotification(n: AppNotificationDto): void {
    if (!n.read) {
      this.notificationService.markAsRead(n.id).subscribe({
        next: () => {
          n.read = true;
          this.loadUnreadCount();
        },
      });
    }
    if (n.relatedEntityType === 'VEHICLE_RESERVATION' && n.relatedEntityId != null) {
      sessionStorage.setItem('finix_focus_reservation_id', String(n.relatedEntityId));
      sessionStorage.removeItem('finix_focus_vehicle_id');
    } else if (n.relatedEntityId != null) {
      sessionStorage.setItem('finix_focus_vehicle_id', String(n.relatedEntityId));
      sessionStorage.removeItem('finix_focus_reservation_id');
    }
    void this.router.navigate(['/seller/vehicles']);
    this.closeNotifDropdown();
  }

  notificationCategoryLabel(category: NotificationCategoryApi): string {
    const labels: Record<string, string> = {
      VEHICLE_SUBMITTED: 'Submitted',
      VEHICLE_APPROVED: 'Approved',
      VEHICLE_REJECTED: 'Rejected',
      UPCOMING_DUE_DATE: 'Due date',
      OVERDUE_PAYMENT: 'Overdue',
      PAYMENT_RECEIVED: 'Payment',
      RISK_ALERT: 'Risk',
      RESERVATION_PENDING_ADMIN: 'Reservation (admin)',
      RESERVATION_CONFIRMED_CLIENT: 'Request received',
      RESERVATION_NEW_FOR_SELLER: 'New reservation',
      RESERVATION_APPROVED: 'Reservation approved',
      RESERVATION_REJECTED: 'Reservation rejected',
      RESERVATION_AUTO_REJECTED: 'Not retained',
      RESERVATION_ACTION_REQUIRED: 'Action required',
      RESERVATION_UNDER_REVIEW: 'Under review',
      RESERVATION_CANCELLED_BY_CLIENT: 'Cancelled (client)',
      RESERVATION_CANCELLED_BY_ADMIN: 'Cancelled (platform)',
    };
    return labels[category] ?? category;
  }

  notificationRelativeTime(iso: string): string {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} m`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} h`;
    return `${Math.floor(h / 24)} d`;
  }

  private startDropdownPolling(): void {
    this.stopDropdownPolling();
    this.dropdownPollingId = setInterval(() => {
      if (!this.showNotifDropdown) return;
      this.loadNotifications();
      this.loadUnreadCount();
    }, 10000);
  }

  private stopDropdownPolling(): void {
    if (this.dropdownPollingId) {
      clearInterval(this.dropdownPollingId);
      this.dropdownPollingId = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.sl-tb-user')) this.showUserDropdown = false;
    if (!target?.closest('.sl-notif-wrap')) this.closeNotifDropdown();
  }

  logout(): void {
    this.showUserDropdown = false;
    this.auth.logout();
  }

  goToMyProfile(): void {
    this.showUserDropdown = false;
    this.router.navigate(['/seller/profile']);
  }

  private getImageUrl(path?: string): string {
    if (!path || !path.trim()) return '';
    const raw = path.trim();
    if (/^https?:\/\//i.test(raw)) return raw;
    const backendBase = 'http://localhost:8082';
    if (raw.startsWith('/')) return `${backendBase}${raw}`;
    return `${backendBase}/${raw}`;
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

  formatPrice(p: number): string { return p.toLocaleString('fr-FR') + ' TND'; }
  formatKm(k: number): string { return k.toLocaleString('fr-FR') + ' km'; }

  openAddModal(): void {
    this.showAddModal = true;
    this.newVehicle = { brand: '', model: '', year: 2024, price: 0, km: 0, fuel: 'Petrol', transmission: 'Manual', color: '', description: '' };
  }

  closeAddModal(): void { this.showAddModal = false; }
}


