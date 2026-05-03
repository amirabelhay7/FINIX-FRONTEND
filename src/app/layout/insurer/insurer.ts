import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import { CreateEventPayload, EventChatMemberDto, EventDto, EventService } from '../../services/event.service';
import {
  EventNotificationService,
  EventWorkflowNotification,
} from '../../services/event/event-notification.service';

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
  standalone: true,
  templateUrl: './insurer.html',
  styleUrl: './insurer.css',
  imports: [CommonModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
})
export class InsurerLayout implements OnInit, OnDestroy {
  readonly canManageEvents = true;
  readonly weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  currentTheme: 'light' | 'dark' = 'dark';
  showUserDropdown = false;
  showNotificationsDropdown = false;
  notificationItems: { title: string; meta: string; eventId?: number }[] = [];
  unreadNotificationsCount = 0;
  userName = '';
  userInitials = '';
  userEmail = '';
  activeSection: 'dashboard' | 'offers' | 'events' | 'catalogs' = 'dashboard';
  searchQuery = '';

  showAddOfferModal = false;
  showAddEventModal = false;
  showAddCatalogModal = false;
  showChatMembersModal = false;
  eventsLoading = false;
  eventsError = '';
  isCreatingEvent = false;
  isEditingEvent = false;
  editingEventId: number | null = null;
  eventCreateError = '';
  eventCreateSuccess = '';
  chatMembersLoading = false;
  chatMembersError = '';
  chatMembers: EventChatMemberDto[] = [];
  selectedChatEvent: EventDto | null = null;
  removingMemberUserId: number | null = null;
  showAddressMapModal = false;
  mapPickerError = '';
  mapSearchQuery = '';
  selectedMapAddress = '';
  selectedMapLat: number | null = null;
  selectedMapLng: number | null = null;
  selectedMapLocation: { lat: number; lon: number; display_name: string } | null = null;
  private leafletLib: any = null;
  private addressMap: any = null;
  private addressMarker: any = null;
  private eventRealtimeSubscription?: Subscription;
  private seededApprovalEventIds = new Set<number>();
  eventsSearchTerm = '';
  eventsStatusFilter = 'ALL';
  eventsPage = 1;
  eventsPageSize = 6;
  expandedEventId: number | null = null;

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

  events: EventDto[] = [];

  catalogs: CatalogItem[] = [
    { id: 1, name: 'Assurance Automobile', category: 'Auto', description: 'Gamme complète de couvertures pour véhicules particuliers et professionnels', icon: '🚗', offersCount: 5 },
    { id: 2, name: 'Assurance Habitation', category: 'Habitation', description: 'Protection du logement contre les risques courants et catastrophes', icon: '🏠', offersCount: 3 },
    { id: 3, name: 'Assurance Santé', category: 'Santé', description: 'Couvertures médicales individuelles et familiales', icon: '🏥', offersCount: 4 },
    { id: 4, name: 'Assurance Vie', category: 'Vie', description: "Produits d'épargne et de prévoyance à long terme", icon: '💎', offersCount: 2 },
    { id: 5, name: 'Assurance Professionnelle', category: 'Pro', description: 'Solutions pour les entreprises et professionnels indépendants', icon: '🏢', offersCount: 3 },
  ];

  newOffer = { name: '', type: 'auto', price: 0, duration: '12 mois', coverage: '', description: '' };
  newEvent = {
    title: '',
    description: '',
    city: '',
    address: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: 0,
    imageUrl: '',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT' | 'CANCELLED',
    publicEvent: true,
  };
  newCatalog = { name: '', category: '', description: '' };

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private eventService: EventService,
    private eventNotificationService: EventNotificationService,
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('finix_theme') as 'light' | 'dark' | null;
    this.currentTheme = saved || 'dark';
    this.applyTheme();
    this.loadUser();
    this.loadEvents();
    this.seedInsurerApprovalNotifications();
    this.eventNotificationService.connect();
    this.eventRealtimeSubscription = this.eventNotificationService.insurerEvents$.subscribe((event) =>
      this.handleInsurerEventNotification(event)
    );
  }

  private loadUser(): void {
    try {
      const raw = localStorage.getItem('currentUser');
      if (raw) {
        const user = JSON.parse(raw);
        this.userName = user.name || 'Assureur';
        this.userEmail = user.email || '';
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    }
    if (!this.userName) this.userName = 'Assureur';
    const parts = this.userName.split(' ');
    this.userInitials = parts.map((p: string) => p[0]).join('').toUpperCase().slice(0, 2);
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
    if (this.addressMap) {
      this.addressMap.remove();
      this.addressMap = null;
      this.addressMarker = null;
    }
    this.eventRealtimeSubscription?.unsubscribe();
    this.eventNotificationService.disconnect();
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

  get filteredEvents(): EventDto[] {
    const q = this.eventsSearchTerm.trim().toLowerCase();
    return this.events.filter((ev) => {
      const matchesSearch =
        !q ||
        (ev.title || '').toLowerCase().includes(q) ||
        (ev.city || '').toLowerCase().includes(q) ||
        (ev.address || '').toLowerCase().includes(q);
      const matchesStatus =
        this.eventsStatusFilter === 'ALL' || (ev.status || '').toUpperCase() === this.eventsStatusFilter;
      return matchesSearch && matchesStatus;
    });
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
      urgent: this.events.filter(e => (e.status || '').toUpperCase() === 'CANCELLED').length,
      en_cours: this.events.filter(e => (e.status || '').toUpperCase() === 'DRAFT').length,
      traite: this.events.filter(e => (e.status || '').toUpperCase() === 'PUBLISHED').length,
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

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      active: 'Active',
      draft: 'Draft',
      expired: 'Expired',
      PUBLISHED: 'Published',
      DRAFT: 'Draft',
      CANCELLED: 'Cancelled',
    };
    return labels[status] || status;
  }

  toggleUserDropdown(): void { this.showUserDropdown = !this.showUserDropdown; }
  toggleNotificationsDropdown(): void {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
    if (this.showNotificationsDropdown) {
      this.unreadNotificationsCount = 0;
    }
  }

  openNotification(item: { title: string; meta: string; eventId?: number }): void {
    this.showNotificationsDropdown = false;
    if (!item.eventId) return;
    this.openEventFromNotification(item.eventId);
  }

  openAddOfferModal(): void {
    this.showAddOfferModal = true;
    this.newOffer = { name: '', type: 'auto', price: 0, duration: '12 mois', coverage: '', description: '' };
  }
  closeAddOfferModal(): void { this.showAddOfferModal = false; }

  openAddEventModal(): void {
    if (!this.canManageEvents) return;
    this.isEditingEvent = false;
    this.editingEventId = null;
    this.showAddEventModal = true;
    this.eventCreateError = '';
    this.eventCreateSuccess = '';
    this.newEvent = {
      title: '',
      description: '',
      city: '',
      address: '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      maxParticipants: 0,
      imageUrl: '',
      status: 'PUBLISHED',
      publicEvent: true,
    };
  }
  closeAddEventModal(): void { this.showAddEventModal = false; }

  openAddressMapPicker(): void {
    this.mapPickerError = '';
    this.mapSearchQuery = '';
    this.selectedMapAddress = this.newEvent.address || '';
    this.selectedMapLocation = null;
    this.showAddressMapModal = true;
    setTimeout(() => {
      if (this.showAddressMapModal) this.initAddressMap();
    }, 200);
  }

  closeAddressMapPicker(): void {
    this.showAddressMapModal = false;
  }

  async confirmAddressFromMap(): Promise<void> {
    if (!this.selectedMapLocation || !this.selectedMapAddress.trim()) {
      this.mapPickerError = 'Pick a location on the map.';
      return;
    }
    this.newEvent.address = this.selectedMapAddress.trim();
    this.newEvent.city = this.deriveCityFromAddress(this.newEvent.address);
    this.showAddressMapModal = false;
  }

  async searchAddressOnMap(): Promise<void> {
    const query = this.mapSearchQuery.trim();
    if (!query) {
      this.mapPickerError = 'Enter an address to search.';
      return;
    }
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
      );
      const data = await res.json();
      const first = Array.isArray(data) ? data[0] : null;
      if (!first) {
        this.mapPickerError = 'No results found.';
        return;
      }
      const lat = Number(first.lat);
      const lon = Number(first.lon);
      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        this.mapPickerError = 'Invalid coordinates.';
        return;
      }
      this.placeOrMoveMarker(lat, lon);
      this.addressMap?.setView([lat, lon], 13);
      await this.reverseGeocodeAddress(lat, lon);
    } catch {
      this.mapPickerError = 'Search is unavailable right now.';
    }
  }

  private async initAddressMap(): Promise<void> {
    const mapContainerId = 'insurer-event-address-map';
    const el = document.getElementById(mapContainerId);
    if (!el) {
      this.mapPickerError = 'Map unavailable.';
      return;
    }

    const L = await import('leaflet');
    this.leafletLib = L;
    if (this.addressMap) {
      this.addressMap.remove();
      this.addressMap = null;
      this.addressMarker = null;
    }

    this.addressMap = L.map(mapContainerId).setView([36.8065, 10.1815], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.addressMap);

    this.addressMap.on('click', async (e: any) => {
      const { lat, lng } = e.latlng;
      this.placeOrMoveMarker(lat, lng);
      await this.reverseGeocodeAddress(lat, lng);
    });

    setTimeout(() => this.addressMap?.invalidateSize(), 200);
  }

  private placeOrMoveMarker(lat: number, lng: number): void {
    this.selectedMapLat = lat;
    this.selectedMapLng = lng;
    if (this.addressMarker) {
      this.addressMarker.setLatLng([lat, lng]);
    } else {
      if (!this.leafletLib) return;
      this.addressMarker = this.leafletLib.marker([lat, lng]).addTo(this.addressMap);
    }
  }

  private async reverseGeocodeAddress(lat: number, lng: number): Promise<void> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      this.selectedMapAddress = data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      this.selectedMapLocation = {
        lat,
        lon: lng,
        display_name: this.selectedMapAddress,
      };
      this.mapPickerError = '';
    } catch {
      this.selectedMapAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      this.selectedMapLocation = {
        lat,
        lon: lng,
        display_name: this.selectedMapAddress,
      };
      this.mapPickerError = 'Address could not be resolved; coordinates kept.';
    }
  }

  openEditEventModal(ev: EventDto): void {
    if (!this.canManageEvents || !ev.idEvent || !this.canEditEvent(ev)) return;
    this.isEditingEvent = true;
    this.editingEventId = ev.idEvent;
    this.showAddEventModal = true;
    this.eventCreateError = '';
    this.eventCreateSuccess = '';
    this.newEvent = {
      title: ev.title || '',
      description: ev.description || '',
      city: ev.city || '',
      address: ev.address || '',
      startDate: this.toDateTimeLocal(ev.startDate),
      endDate: this.toDateTimeLocal(ev.endDate),
      registrationDeadline: this.toDateTimeLocal(ev.registrationDeadline),
      maxParticipants: Number(ev.maxParticipants ?? 0),
      imageUrl: ev.imageUrl || ev.image || '',
      status: ((ev.status || 'PUBLISHED').toUpperCase() as 'PUBLISHED' | 'DRAFT' | 'CANCELLED'),
      publicEvent: ev.publicEvent ?? true,
    };
  }

  createEvent(): void {
    if (!this.canManageEvents) return;
    const userId = this.getConnectedUserId();
    if (!userId) {
      this.eventCreateError = 'Signed-in user not found.';
      return;
    }

    const resolvedCity = (this.newEvent.city || this.deriveCityFromAddress(this.newEvent.address) || 'N/A').trim();
    if (!this.newEvent.title.trim() || !this.newEvent.address.trim()
      || !this.newEvent.startDate || !this.newEvent.endDate) {
      this.eventCreateError = 'Please fill in the required fields.';
      return;
    }

    const startDate = new Date(this.newEvent.startDate);
    const endDate = new Date(this.newEvent.endDate);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && endDate <= startDate) {
      this.eventCreateError = 'End date must be after the start date.';
      return;
    }

    const rawImageUrl = this.newEvent.imageUrl.trim();
    if (rawImageUrl.startsWith('data:')) {
      this.eventCreateError = 'Invalid image URL: use an HTTP/HTTPS link, not a base64 image.';
      return;
    }
    if (rawImageUrl.length > 3000) {
      this.eventCreateError = 'Image URL is too long (max 3000 characters).';
      return;
    }

    const payload: CreateEventPayload = {
      title: this.newEvent.title.trim(),
      description: this.newEvent.description.trim(),
      rules: '',
      city: resolvedCity,
      address: this.newEvent.address.trim(),
      startDate: this.newEvent.startDate,
      endDate: this.newEvent.endDate,
      registrationDeadline: this.newEvent.registrationDeadline || this.newEvent.endDate,
      maxParticipants: Number(this.newEvent.maxParticipants) || 0,
      currentParticipants: 0,
      imageUrl: rawImageUrl,
      status: this.newEvent.status,
      publicEvent: !!this.newEvent.publicEvent,
      userId,
    };

    this.isCreatingEvent = true;
    this.eventCreateError = '';
    this.eventCreateSuccess = '';

    const request$ =
      this.isEditingEvent && this.editingEventId
        ? this.eventService.updateEvent(this.editingEventId, payload)
        : this.eventService.createEvent(payload);

    request$
      .pipe(finalize(() => (this.isCreatingEvent = false)))
      .subscribe({
        next: () => {
          this.eventCreateSuccess = this.isEditingEvent
            ? 'Event updated successfully.'
            : 'Event created successfully.';
          this.closeAddEventModal();
          this.loadEvents();
        },
        error: (err: any) => {
          this.eventCreateError = err?.error?.message || err?.message || 'Failed to save the event.';
        },
      });
  }

  openAddCatalogModal(): void {
    this.showAddCatalogModal = true;
    this.newCatalog = { name: '', category: '', description: '' };
  }
  closeAddCatalogModal(): void { this.showAddCatalogModal = false; }

  openChatMembersModal(ev: EventDto): void {
    if (!ev?.idEvent) return;
    this.showChatMembersModal = true;
    this.selectedChatEvent = ev;
    this.chatMembers = [];
    this.chatMembersError = '';
    this.loadChatMembers(ev.idEvent);
  }

  closeChatMembersModal(): void {
    this.showChatMembersModal = false;
    this.selectedChatEvent = null;
    this.chatMembers = [];
    this.chatMembersError = '';
    this.removingMemberUserId = null;
  }

  removeMemberFromChat(member: EventChatMemberDto): void {
    const eventId = this.selectedChatEvent?.idEvent;
    const actorUserId = this.getConnectedUserId();
    const targetUserId = member?.userId;
    if (!eventId || !actorUserId || !targetUserId) return;

    this.removingMemberUserId = targetUserId;
    this.chatMembersError = '';
    this.eventService.removeEventChatMember(eventId, actorUserId, targetUserId)
      .pipe(finalize(() => (this.removingMemberUserId = null)))
      .subscribe({
        next: () => {
          this.loadChatMembers(eventId);
        },
        error: (err: any) => {
          this.chatMembersError = err?.error?.message || err?.message || 'Unable to remove member.';
        },
      });
  }

  logout(): void {
    localStorage.removeItem('finix_access_token');
    localStorage.removeItem('currentUser');
    this.showUserDropdown = false;
    this.router.navigate(['/login']);
  }

  private loadEvents(): void {
    this.eventsLoading = true;
    this.eventsError = '';
    this.eventService
      .getEvents(0, 1000)
      .pipe(finalize(() => (this.eventsLoading = false)))
      .subscribe({
        next: (response) => {
          const rows = Array.isArray(response?.content) ? response.content : [];
          this.events = rows;
          this.eventsPage = 1;
          this.expandedEventId = null;
        },
        error: () => {
          this.events = [];
          this.eventsError = 'Unable to load events.';
        },
      });
  }

  private loadChatMembers(eventId: number): void {
    const userId = this.getConnectedUserId();
    if (!userId) {
      this.chatMembersError = 'Signed-in user not found.';
      return;
    }
    this.chatMembersLoading = true;
    this.chatMembersError = '';
    this.eventService.getEventChatMembers(eventId, userId)
      .pipe(finalize(() => (this.chatMembersLoading = false)))
      .subscribe({
        next: (members) => {
          this.chatMembers = Array.isArray(members) ? members : [];
        },
        error: (err: any) => {
          this.chatMembers = [];
          this.chatMembersError = err?.error?.message || err?.message || 'Unable to load members.';
        },
      });
  }

  private handleInsurerEventNotification(event: EventWorkflowNotification): void {
    if (!event || event.type !== 'EVENT_APPROVED' || !event.eventId) {
      return;
    }
    const connectedUserId = this.getConnectedUserId();
    if (
      connectedUserId != null &&
      event.organizerId != null &&
      Number(event.organizerId) !== Number(connectedUserId)
    ) {
      return;
    }

    const createdAt = event.createdAt ? new Date(event.createdAt) : new Date();
    const title = `Event approved — #EV-${event.eventId}`;
    const meta = `${createdAt.toLocaleString()} · ${event.title || 'Event'} · Visible to clients`;

    if (this.seededApprovalEventIds.has(event.eventId)) {
      return;
    }
    this.seededApprovalEventIds.add(event.eventId);
    this.notificationItems = [{ title, meta, eventId: event.eventId }, ...this.notificationItems].slice(0, 25);
    this.unreadNotificationsCount += 1;
  }

  private seedInsurerApprovalNotifications(): void {
    const connectedUserId = this.getConnectedUserId();
    if (!connectedUserId) {
      return;
    }

    this.eventService.getEvents(0, 1000).subscribe({
      next: (response) => {
        const rows = Array.isArray(response?.content) ? response.content : [];
        const approvedMine = rows
          .filter((ev) =>
            !!ev?.idEvent &&
            Number(ev.userId) === Number(connectedUserId) &&
            (ev.status || '').toUpperCase() === 'PUBLISHED')
          .slice(0, 20);

        approvedMine.forEach((ev) => {
          this.handleInsurerEventNotification({
            type: 'EVENT_APPROVED',
            eventId: ev.idEvent!,
            title: ev.title || 'Event',
            status: 'PUBLISHED',
            organizerId: connectedUserId,
            organizerFullName: this.userName || 'Assureur',
            createdAt: new Date().toISOString(),
            message: 'Your event has been approved',
          });
        });
      },
      error: () => {
        // Realtime websocket remains the primary channel.
      },
    });
  }

  private openEventFromNotification(eventId: number): void {
    this.activeSection = 'events';
    const focusTarget = () => {
      const idx = this.filteredEvents.findIndex((ev) => ev.idEvent === eventId);
      if (idx >= 0) {
        this.eventsPage = Math.floor(idx / this.eventsPageSize) + 1;
      }
      this.expandedEventId = eventId;
    };

    if (this.events.length > 0) {
      focusTarget();
      return;
    }

    this.eventsLoading = true;
    this.eventsError = '';
    this.eventService
      .getEvents(0, 1000)
      .pipe(finalize(() => (this.eventsLoading = false)))
      .subscribe({
        next: (response) => {
          this.events = Array.isArray(response?.content) ? response.content : [];
          focusTarget();
        },
        error: () => {
          this.eventsError = 'Unable to open the event from the notification.';
        },
      });
  }

  get totalEventPages(): number {
    return Math.max(1, Math.ceil(this.filteredEvents.length / this.eventsPageSize));
  }

  get paginatedEvents(): EventDto[] {
    const start = (this.eventsPage - 1) * this.eventsPageSize;
    return this.filteredEvents.slice(start, start + this.eventsPageSize);
  }

  get eventPaginationPages(): number[] {
    const total = this.totalEventPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const current = this.eventsPage;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }

  onEventsFilterChange(): void {
    this.eventsPage = 1;
    this.expandedEventId = null;
  }

  goToEventsPage(page: number): void {
    this.eventsPage = Math.min(Math.max(1, page), this.totalEventPages);
    this.expandedEventId = null;
  }

  toggleEventExpand(eventId?: number): void {
    if (!eventId) return;
    this.expandedEventId = this.expandedEventId === eventId ? null : eventId;
  }

  trackByEventId(index: number, ev: EventDto): number | string {
    return ev.idEvent ?? `event-${index}`;
  }

  getCategoryLabel(_: EventDto): string {
    return 'Event Public';
  }

  getEventDateTimeLabel(ev: EventDto): string {
    if (!ev.startDate || !ev.endDate) return 'Date not set';
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'Date not set';
    const date = start.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
    const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${date} · ${startTime} - ${endTime} CST`;
  }

  isEventDayActive(ev: EventDto, dayIndex: number): boolean {
    if (!ev.startDate || !ev.endDate) return false;
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
    const map = [6, 0, 1, 2, 3, 4, 5];
    const targetDay = map[dayIndex];
    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      if (cursor.getDay() === targetDay) return true;
    }
    return false;
  }

  getEventStatusClass(status?: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'PUBLISHED') return 'published';
    if (s === 'DRAFT') return 'draft';
    if (s === 'CANCELLED') return 'cancelled';
    return 'default';
  }

  getEventLocations(ev: EventDto): string[] {
    const locations = new Set<string>();
    if (ev.city) locations.add(ev.city);
    if (ev.address) {
      ev.address.split(',').map((part) => part.trim()).filter(Boolean).forEach((part) => locations.add(part));
    }
    return Array.from(locations).slice(0, 3);
  }

  getEventMetricValue(ev: EventDto, metric: 'inscrits' | 'capacite' | 'restants'): number {
    const inscrits = Math.max(0, ev.currentParticipants ?? 0);
    const capacity = Math.max(0, ev.maxParticipants ?? 0);
    const restants = Math.max(0, capacity - inscrits);
    if (metric === 'inscrits') return inscrits;
    if (metric === 'capacite') return capacity;
    return restants;
  }

  getEventMetricPct(ev: EventDto, metric: 'inscrits' | 'capacite' | 'restants'): number {
    const capacity = Math.max(1, ev.maxParticipants ?? 0);
    return Math.min(100, Math.round((this.getEventMetricValue(ev, metric) / capacity) * 100));
  }

  getEventFillStat(ev: EventDto): string {
    const pct = this.getEventMetricPct(ev, 'inscrits');
    return `${pct}% full`;
  }

  canEditEvent(ev: EventDto): boolean {
    if (!ev.startDate) return false;
    const start = new Date(ev.startDate);
    if (Number.isNaN(start.getTime())) return false;
    return start.getTime() > Date.now();
  }

  private formatDateLabel(value?: string): string {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('fr-FR');
  }

  private toDateTimeLocal(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    const hh = `${d.getHours()}`.padStart(2, '0');
    const mm = `${d.getMinutes()}`.padStart(2, '0');
    return `${y}-${m}-${day}T${hh}:${mm}`;
  }

  private deriveCityFromAddress(address?: string): string {
    const value = (address || '').trim();
    if (!value) return '';
    const parts = value.split(',').map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length >= 2) return parts[parts.length - 2];
    return parts[0];
  }

  private getConnectedUserId(): number | null {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      const user = JSON.parse(raw);
      const directId =
        user?.userId ??
        user?.id ??
        user?.user?.id ??
        user?.user?.userId;
      const parsed = Number(directId);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    } catch {
      return null;
    }
  }
}
