import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme/theme.service';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notifications/notification.service';
import { Subscription } from 'rxjs';

interface InsuranceOffer {
  id: number;
  name: string;
  type: 'auto' | 'habitation' | 'sante' | 'vie';
  price: number;
  duration: string;
  coverage: string;
  status: 'active' | 'draft' | 'expired';
  subscribers: number;
  date: string;
}

interface InsuranceEvent {
  id: number;
  title: string;
  type: 'sinistre' | 'renouvellement' | 'resiliation' | 'nouveau';
  client: string;
  date: string;
  status: 'en_cours' | 'traite' | 'urgent';
  description: string;
}

interface CatalogItem {
  id: number;
  name: string;
  category: string;
  description: string;
  icon: string;
  offersCount: number;
}

@Component({
  selector: 'app-insurer',
  standalone: false,
  templateUrl: './insurer.html',
  styleUrl: './insurer.css',
  encapsulation: ViewEncapsulation.None,
})
export class InsurerLayout implements OnInit, OnDestroy {
  currentTheme: 'light' | 'dark' = 'dark';
  showUserDropdown = false;
  userName = '';
  userInitials = '';
  userEmail = '';
  unreadCount = 0;
  private wsSubscription: Subscription | null = null;
  activeSection: 'dashboard' | 'offers' | 'events' | 'catalogs' = 'dashboard';
  searchQuery = '';

  showAddOfferModal = false;
  showAddEventModal = false;
  showAddCatalogModal = false;

  stats = [
    { label: 'Active policies', value: '248', icon: '🛡️', trend: '+12 this month', trendClass: 'up' },
    { label: 'Claims in progress', value: '17', icon: '⚠️', trend: '-3 vs last month', trendClass: 'up' },
    { label: 'Renewals', value: '34', icon: '🔄', trend: '+8 this month', trendClass: 'up' },
    { label: 'Premiums collected', value: '1.2M', suffix: 'TND', icon: '💰', trend: '+15.4%', trendClass: 'up' },
  ];

  offers: InsuranceOffer[] = [
    { id: 1, name: 'Comprehensive Auto', type: 'auto', price: 850, duration: '12 months', coverage: 'Comprehensive + 24/7 assistance', status: 'active', subscribers: 156, date: 'Mar 15, 2026' },
    { id: 2, name: 'Third-Party Auto', type: 'auto', price: 420, duration: '12 months', coverage: 'Third-party liability', status: 'active', subscribers: 312, date: 'Mar 12, 2026' },
    { id: 3, name: 'Premium Home', type: 'habitation', price: 680, duration: '12 months', coverage: 'Fire + theft + water damage', status: 'active', subscribers: 89, date: 'Mar 10, 2026' },
    { id: 4, name: 'Family Health', type: 'sante', price: 1200, duration: '12 months', coverage: 'Hospitalization + outpatient care', status: 'active', subscribers: 245, date: 'Mar 8, 2026' },
    { id: 5, name: 'Life Savings', type: 'vie', price: 150, duration: '60 months', coverage: 'Guaranteed capital + savings', status: 'draft', subscribers: 0, date: 'Mar 5, 2026' },
    { id: 6, name: 'Young Driver Auto', type: 'auto', price: 1100, duration: '12 months', coverage: 'Comprehensive + training', status: 'expired', subscribers: 67, date: 'Mar 1, 2026' },
  ];

  events: InsuranceEvent[] = [
    { id: 1, title: 'Auto claim declaration', type: 'sinistre', client: 'Mohamed Ben Ali', date: 'Mar 20, 2026', status: 'urgent', description: 'Traffic accident — property damage' },
    { id: 2, title: 'Home policy renewal', type: 'renouvellement', client: 'Fatma Trabelsi', date: 'Mar 18, 2026', status: 'en_cours', description: 'Annual renewal — premium adjustment' },
    { id: 3, title: 'New health subscription', type: 'nouveau', client: 'Ahmed Khelifi', date: 'Mar 17, 2026', status: 'en_cours', description: 'Family subscription — 4 beneficiaries' },
    { id: 4, title: 'Auto contract cancellation', type: 'resiliation', client: 'Sonia Mansour', date: 'Mar 15, 2026', status: 'traite', description: 'End-of-term cancellation — switching insurer' },
    { id: 5, title: 'Water damage claim', type: 'sinistre', client: 'Karim Bouaziz', date: 'Mar 14, 2026', status: 'en_cours', description: 'Pipe leak — assessment in progress' },
    { id: 6, title: 'New life contract', type: 'nouveau', client: 'Leila Hamdi', date: 'Mar 12, 2026', status: 'traite', description: 'Life savings insurance — 10-year term' },
  ];

  catalogs: CatalogItem[] = [
    { id: 1, name: 'Auto Insurance', category: 'Auto', description: 'Full range of coverages for personal and professional vehicles', icon: '🚗', offersCount: 5 },
    { id: 2, name: 'Home Insurance', category: 'Home', description: 'Home protection against common risks and disasters', icon: '🏠', offersCount: 3 },
    { id: 3, name: 'Health Insurance', category: 'Health', description: 'Individual and family medical coverage', icon: '🏥', offersCount: 4 },
    { id: 4, name: 'Life Insurance', category: 'Life', description: 'Long-term savings and protection products', icon: '💎', offersCount: 2 },
    { id: 5, name: 'Business Insurance', category: 'Business', description: 'Solutions for companies and independent professionals', icon: '🏢', offersCount: 3 },
  ];

  newOffer = { name: '', type: 'auto', price: 0, duration: '12 months', coverage: '', description: '' };
  newEvent = { title: '', type: 'sinistre', client: '', date: '', description: '' };
  newCatalog = { name: '', category: '', description: '' };

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.themeService.initTheme(this.currentTheme);
    this.loadUser();
    this.refreshUnread();

    // Drive UI from URL: /insurer/<child>
    const path = this.route.snapshot.routeConfig?.path as InsurerLayout['activeSection'] | undefined;
    this.activeSection = path && path.length > 0 ? path : 'dashboard';

    const payload = this.authService.getPayload();
    const token = this.authService.getToken();
    if (payload?.userId) {
      this.notificationService.connectWebSocket(payload.userId, token || undefined);
      this.wsSubscription = this.notificationService.realTimeNotification$.subscribe(() => {
        this.unreadCount += 1;
      });
    }
  }



  goToNotifications(): void {
    void this.router.navigate(['/notifications']).then(() => this.refreshUnread());
  }

  private refreshUnread(): void {
    this.notificationService.unreadCount().subscribe({
      next: (r) => {
        this.unreadCount = r?.count ?? 0;
      },
      error: () => {
        this.unreadCount = 0;
      },
    });
  }

  private loadUser(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.userName = user.name || 'Insurer';
        this.userEmail = user.email || '';
      }
    } catch { }
    if (!this.userName) this.userName = 'Insurer';
    const parts = this.userName.split(' ');
    this.userInitials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  toggleTheme(): void {
    this.currentTheme = this.themeService.toggleTheme(this.currentTheme);
  }

  get filteredOffers(): InsuranceOffer[] {
    let list = this.offers;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(o => o.name.toLowerCase().includes(q) || o.type.includes(q));
    }
    return list;
  }

  get filteredEvents(): InsuranceEvent[] {
    let list = this.events;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(e => e.title.toLowerCase().includes(q) || e.client.toLowerCase().includes(q));
    }
    return list;
  }

  get offerCounts() {
    return {
      total: this.offers.length,
      active: this.offers.filter(o => o.status === 'active').length,
      draft: this.offers.filter(o => o.status === 'draft').length,
      expired: this.offers.filter(o => o.status === 'expired').length,
    };
  }

  get eventCounts() {
    return {
      total: this.events.length,
      urgent: this.events.filter(e => e.status === 'urgent').length,
      en_cours: this.events.filter(e => e.status === 'en_cours').length,
      traite: this.events.filter(e => e.status === 'traite').length,
    };
  }

  formatPrice(p: number): string { return p.toLocaleString('en-US') + ' TND'; }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { auto: 'Auto', habitation: 'Home', sante: 'Health', vie: 'Life' };
    return labels[type] || type;
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = { auto: '🚗', habitation: '🏠', sante: '🏥', vie: '💎' };
    return icons[type] || '📋';
  }

  getEventTypeLabel(type: string): string {
    const labels: Record<string, string> = { sinistre: 'Claim', renouvellement: 'Renewal', resiliation: 'Cancellation', nouveau: 'New contract' };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { active: 'Active', draft: 'Draft', expired: 'Expired', en_cours: 'In progress', traite: 'Completed', urgent: 'Urgent' };
    return labels[status] || status;
  }

  toggleUserDropdown(): void { this.showUserDropdown = !this.showUserDropdown; }

  switchSection(section: InsurerLayout['activeSection']): void {
    this.activeSection = section;
    void this.router.navigate(['/insurer', section]);
  }

  openAddOfferModal(): void {
    this.showAddOfferModal = true;
    this.newOffer = { name: '', type: 'auto', price: 0, duration: '12 months', coverage: '', description: '' };
  }
  closeAddOfferModal(): void { this.showAddOfferModal = false; }

  openAddEventModal(): void {
    this.showAddEventModal = true;
    this.newEvent = { title: '', type: 'sinistre', client: '', date: '', description: '' };
  }
  closeAddEventModal(): void { this.showAddEventModal = false; }

  openAddCatalogModal(): void {
    this.showAddCatalogModal = true;
    this.newCatalog = { name: '', category: '', description: '' };
  }
  closeAddCatalogModal(): void { this.showAddCatalogModal = false; }

  logout(): void {
    this.showUserDropdown = false;
    this.authService.logout();
  }
}
