import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

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
  activeSection: 'dashboard' | 'offers' | 'events' | 'catalogs' = 'dashboard';
  searchQuery = '';

  showAddOfferModal = false;
  showAddEventModal = false;
  showAddCatalogModal = false;

  stats = [
    { label: 'Polices actives', value: '248', icon: '🛡️', trend: '+12 ce mois', trendClass: 'up' },
    { label: 'Sinistres en cours', value: '17', icon: '⚠️', trend: '-3 vs mois dernier', trendClass: 'up' },
    { label: 'Renouvellements', value: '34', icon: '🔄', trend: '+8 ce mois', trendClass: 'up' },
    { label: 'Primes collectées', value: '1.2M', suffix: 'TND', icon: '💰', trend: '+15.4%', trendClass: 'up' },
  ];

  offers: InsuranceOffer[] = [
    { id: 1, name: 'Auto Tous Risques', type: 'auto', price: 850, duration: '12 mois', coverage: 'Tous risques + assistance 24h', status: 'active', subscribers: 156, date: '15 Mars 2026' },
    { id: 2, name: 'Auto Tiers', type: 'auto', price: 420, duration: '12 mois', coverage: 'Responsabilité civile', status: 'active', subscribers: 312, date: '12 Mars 2026' },
    { id: 3, name: 'Habitation Premium', type: 'habitation', price: 680, duration: '12 mois', coverage: 'Incendie + vol + dégâts des eaux', status: 'active', subscribers: 89, date: '10 Mars 2026' },
    { id: 4, name: 'Santé Famille', type: 'sante', price: 1200, duration: '12 mois', coverage: 'Hospitalisation + soins courants', status: 'active', subscribers: 245, date: '8 Mars 2026' },
    { id: 5, name: 'Vie Épargne', type: 'vie', price: 150, duration: '60 mois', coverage: 'Capital garanti + épargne', status: 'draft', subscribers: 0, date: '5 Mars 2026' },
    { id: 6, name: 'Auto Jeune Conducteur', type: 'auto', price: 1100, duration: '12 mois', coverage: 'Tous risques + formation', status: 'expired', subscribers: 67, date: '1 Mars 2026' },
  ];

  events: InsuranceEvent[] = [
    { id: 1, title: 'Déclaration sinistre auto', type: 'sinistre', client: 'Mohamed Ben Ali', date: '20 Mars 2026', status: 'urgent', description: 'Accident de circulation — dommages matériels' },
    { id: 2, title: 'Renouvellement police habitation', type: 'renouvellement', client: 'Fatma Trabelsi', date: '18 Mars 2026', status: 'en_cours', description: 'Renouvellement annuel — ajustement prime' },
    { id: 3, title: 'Nouvelle souscription santé', type: 'nouveau', client: 'Ahmed Khelifi', date: '17 Mars 2026', status: 'en_cours', description: 'Souscription famille — 4 bénéficiaires' },
    { id: 4, title: 'Résiliation contrat auto', type: 'resiliation', client: 'Sonia Mansour', date: '15 Mars 2026', status: 'traite', description: 'Résiliation à échéance — changement assureur' },
    { id: 5, title: 'Sinistre dégât des eaux', type: 'sinistre', client: 'Karim Bouaziz', date: '14 Mars 2026', status: 'en_cours', description: 'Fuite canalisation — expertise en cours' },
    { id: 6, title: 'Nouveau contrat vie', type: 'nouveau', client: 'Leila Hamdi', date: '12 Mars 2026', status: 'traite', description: 'Assurance vie épargne — durée 10 ans' },
  ];

  catalogs: CatalogItem[] = [
    { id: 1, name: 'Assurance Automobile', category: 'Auto', description: 'Gamme complète de couvertures pour véhicules particuliers et professionnels', icon: '🚗', offersCount: 5 },
    { id: 2, name: 'Assurance Habitation', category: 'Habitation', description: 'Protection du logement contre les risques courants et catastrophes', icon: '🏠', offersCount: 3 },
    { id: 3, name: 'Assurance Santé', category: 'Santé', description: 'Couvertures médicales individuelles et familiales', icon: '🏥', offersCount: 4 },
    { id: 4, name: 'Assurance Vie', category: 'Vie', description: "Produits d'épargne et de prévoyance à long terme", icon: '💎', offersCount: 2 },
    { id: 5, name: 'Assurance Professionnelle', category: 'Pro', description: 'Solutions pour les entreprises et professionnels indépendants', icon: '🏢', offersCount: 3 },
  ];

  newOffer = { name: '', type: 'auto', price: 0, duration: '12 mois', coverage: '', description: '' };
  newEvent = { title: '', type: 'sinistre', client: '', date: '', description: '' };
  newCatalog = { name: '', category: '', description: '' };

  constructor(private router: Router, private renderer: Renderer2) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('finix_theme') as 'light' | 'dark' | null;
    this.currentTheme = saved || 'dark';
    this.applyTheme();
    this.loadUser();
  }

  private loadUser(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.userName = user.name || 'Assureur';
        this.userEmail = user.email || '';
      }
    } catch { }
    if (!this.userName) this.userName = 'Assureur';
    const parts = this.userName.split(' ');
    this.userInitials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  ngOnDestroy(): void {
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

  formatPrice(p: number): string { return p.toLocaleString('fr-FR') + ' TND'; }

  getTypeLabel(type: string): string {
    const labels: Record<string, string> = { auto: 'Auto', habitation: 'Habitation', sante: 'Santé', vie: 'Vie' };
    return labels[type] || type;
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = { auto: '🚗', habitation: '🏠', sante: '🏥', vie: '💎' };
    return icons[type] || '📋';
  }

  getEventTypeLabel(type: string): string {
    const labels: Record<string, string> = { sinistre: 'Sinistre', renouvellement: 'Renouvellement', resiliation: 'Résiliation', nouveau: 'Nouveau contrat' };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = { active: 'Active', draft: 'Brouillon', expired: 'Expirée', en_cours: 'En cours', traite: 'Traité', urgent: 'Urgent' };
    return labels[status] || status;
  }

  toggleUserDropdown(): void { this.showUserDropdown = !this.showUserDropdown; }

  openAddOfferModal(): void {
    this.showAddOfferModal = true;
    this.newOffer = { name: '', type: 'auto', price: 0, duration: '12 mois', coverage: '', description: '' };
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
    localStorage.removeItem('finix_access_token');
    localStorage.removeItem('currentUser');
    this.showUserDropdown = false;
    this.router.navigate(['/login']);
  }
}
