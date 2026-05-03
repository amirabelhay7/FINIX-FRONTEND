import { Component, OnInit, OnDestroy, Renderer2, HostListener } from '@angular/core';
import { Credit } from '../../services/credit/credit.service';
import { RequestLoanDto, PageResponse } from '../../models/credit.model';
import { finalize, Subscription } from 'rxjs';
import { CreateEventPayload, EventDto, EventPageResponse, EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import {
  AdminEventNotificationEvent,
  AdminRequestNotificationEvent,
  AdminRequestNotificationService,
} from '../../services/credit/admin-request-notification.service';
import { TopbarNotificationItem } from './components/topbar/topbar.component';

interface PipelineCard {
  idDemande?: number;
  statutDemande?: string;
  dateCreation?: string | Date;
  user?: RequestLoanDto['user'];
  vehicle?: RequestLoanDto['vehicle'];
  vehicule?: RequestLoanDto['vehicule'];
  name: string;
  ref: string;
  amount: string;
  type: string;
  warn?: boolean;
}

interface PipelineColumn {
  title: string;
  shortTitle?: string;
  class: string;
  count: number;
  cards: PipelineCard[];
}

interface DossierItem {
  ref: string;
  initials: string;
  client: string;
  clientSince: string;
  type: string;
  amount: string;
  score: string;
  scoreColor: string;
  status: string;
  statusClass: string;
}

interface AnalysisFileItem {
  idDemande: number;
  statutDemande: string;
  montantDemande: number;
  apportPersonnel: number;
  dureeMois: number;
  mensualiteEstimee: number;
  objectifCredit: string;
  dateCreation?: string | Date;
  user?: RequestLoanDto['user'];
  vehicle?: RequestLoanDto['vehicle'];
  vehicule?: RequestLoanDto['vehicule'];
  ref: string;
  initials: string;
  name: string;
  clientInfo: string;
  type: string;
  amount: string;
  duration: string;
  score: number;
  debtRatio: number;
  seniority: string;
  recommendation: string;
  riskDecision?: RequestLoanDto['riskDecision'];
  riskBreakdown?: string;
  internalRiskBreakdown?: string;
}

interface CriticalNotificationItem {
  title: string;
  meta: string;
  type: 'danger' | 'warning' | string;
  requestId?: number;
  targetPage?: string;
  eventId?: number;
}

interface RecentNotificationItem {
  title: string;
  meta: string;
  color: string;
  requestId?: number;
  targetPage?: string;
  eventId?: number;
}

@Component({
  selector: 'app-backoffice',
  standalone: false,
  templateUrl: './backoffice.component.html',
  styleUrls: ['./backoffice.component.css']
})
export class BackofficeComponent implements OnInit, OnDestroy {
  readonly scoringFactors = [
    {
      sourceKey: 'X1',
      displayKey: 'x1',
      label: 'x1 (DTI)',
      meaning: 'Monthly debt-to-income ratio (payment / income).',
    },
    {
      sourceKey: 'X4',
      displayKey: 'x2',
      label: 'x2',
      meaning: 'Down payment relative to vehicle price.',
    },
    {
      sourceKey: 'X5',
      displayKey: 'x3',
      label: 'x3',
      meaning: 'Collateral coverage relative to the requested amount.',
    },
  ] as const;

  readonly weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  selectedPage = 'dashboard';
  currentTheme: 'light' | 'dark' = 'dark';
  hover = false;
  showModal = false;
  decisionNote = '';
  private ignoreNextOverlayClose = false;
  private readonly themeStorageKey = 'finix_theme';
  private realtimeSubscription?: Subscription;
  private eventRealtimeSubscription?: Subscription;
  private fallbackPollingHandle: ReturnType<typeof setInterval> | null = null;
  private seenRequestIds = new Set<number>();
  private seededNotificationRequestIds = new Set<number>();
  private seededNotificationEventIds = new Set<number>();

  requestLoans: RequestLoanDto[] = [];
  loansLoading = false;
  loansError = '';
  showHistoryTable = false;
  showStatsWindow = false;
  unreadNotificationsCount = 0;
  historyPage = 1;
  historyPageSize = 9;
  historyGridColumns = 3;
  pipelinePage = 1;
  pipelinePageSize = 4;
  analysisPage = 1;
  analysisPageSize = 8;

  decisionSubmitting = false;
  decisionError = '';

  showEventModal = false;
  showAddressMapModal = false;
  isCreatingEvent = false;
  isEditingEvent = false;
  editingEventId: number | null = null;
  eventCreateError = '';
  eventCreateSuccess = '';
  mapPickerError = '';
  mapSearchQuery = '';
  selectedMapAddress = '';
  selectedMapLat: number | null = null;
  selectedMapLng: number | null = null;
  selectedMapLocation: { lat: number; lon: number; display_name: string } | null = null;
  private leafletLib: any = null;
  private addressMap: any = null;
  private addressMarker: any = null;
  events: EventDto[] = [];
  eventsLoading = false;
  eventsError = '';
  eventsSearchTerm = '';
  eventsStatusFilter = 'ALL';
  eventsPage = 1;
  eventsPageSize = 6;
  expandedEventId: number | null = null;

  eventForm = {
    title: '',
    description: '',
    rules: '',
    city: '',
    address: '',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: 0,
    currentParticipants: 0,
    imageUrl: '',
    status: 'PUBLISHED',
    publicEvent: true,
    userId: 0,
  };

  constructor(
    private creditService: Credit,
    private eventService: EventService,
    private adminNotificationService: AdminRequestNotificationService,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.readSavedTheme();
    this.applyTheme(this.currentTheme);
    this.loadRequestLoans();
    this.unreadNotificationsCount = this.notificationsCritical.length;
    this.adminNotificationService.connect();
    this.realtimeSubscription = this.adminNotificationService.events$.subscribe((event) =>
      this.handleRealtimeNotification(event)
    );
    this.eventRealtimeSubscription = this.adminNotificationService.eventEvents$.subscribe((event) =>
      this.handleRealtimeEventNotification(event)
    );
    this.seedNotificationsFromExistingPendingEvents();
    this.startFallbackNotificationPolling();
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
    this.unlockBodyScroll();
    this.realtimeSubscription?.unsubscribe();
    this.eventRealtimeSubscription?.unsubscribe();
    this.adminNotificationService.disconnect();
    this.stopFallbackNotificationPolling();
  }

  onPageChange(page: string) {
    this.selectedPage = page;

    if (page === 'credits' && this.requestLoans.length === 0) {
      this.loadRequestLoans();
    }
    if (page === 'events' && this.events.length === 0) {
      this.loadEvents();
    }
  }

  loadEvents(page = 0, size = 1000): void {
    this.eventsLoading = true;
    this.eventsError = '';
    this.eventService
      .getEvents(page, size)
      .pipe(finalize(() => (this.eventsLoading = false)))
      .subscribe({
        next: (response: EventPageResponse) => {
          this.events = Array.isArray(response?.content) ? response.content : [];
          this.eventsPage = 1;
          this.expandedEventId = null;
        },
        error: () => {
          this.eventsError = 'Unable to load events.';
        },
      });
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

  get totalEventPages(): number {
    return Math.max(1, Math.ceil(this.filteredEvents.length / this.eventsPageSize));
  }

  get paginatedEvents(): EventDto[] {
    const start = (this.eventsPage - 1) * this.eventsPageSize;
    return this.filteredEvents.slice(start, start + this.eventsPageSize);
  }

  get visiblePipelineColumns(): PipelineColumn[] {
    const columns = this.pipelineColumns ?? [];
    const nonEmpty = columns.filter((col) => (col.cards?.length ?? 0) > 0);
    return nonEmpty.length > 0 ? nonEmpty : columns;
  }

  get totalPipelinePages(): number {
    const maxCards = this.visiblePipelineColumns.reduce((max, col) => Math.max(max, col.cards.length), 0);
    return Math.max(1, Math.ceil(maxCards / this.pipelinePageSize));
  }

  get paginatedPipelineColumns(): PipelineColumn[] {
    const start = (this.pipelinePage - 1) * this.pipelinePageSize;
    return this.visiblePipelineColumns.map((col) => ({
      ...col,
      cards: col.cards.slice(start, start + this.pipelinePageSize),
    }));
  }

  goToPipelinePage(page: number): void {
    this.pipelinePage = Math.min(Math.max(1, page), this.totalPipelinePages);
  }

  get pipelinePaginationPages(): number[] {
    const total = this.totalPipelinePages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const current = this.pipelinePage;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }

  get totalAnalysisPages(): number {
    return Math.max(1, Math.ceil(this.analysisFiles.length / this.analysisPageSize));
  }

  get paginatedAnalysisFiles(): AnalysisFileItem[] {
    const start = (this.analysisPage - 1) * this.analysisPageSize;
    return this.analysisFiles.slice(start, start + this.analysisPageSize);
  }

  goToAnalysisPage(page: number): void {
    this.analysisPage = Math.min(Math.max(1, page), this.totalAnalysisPages);
  }

  get analysisPaginationPages(): number[] {
    const total = this.totalAnalysisPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const current = this.analysisPage;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }

  get creditsSummaryText(): string {
    const loans = this.requestLoans ?? [];
    const total = loans.length;
    const pending = loans.filter((loan) => loan.statutDemande === 'PENDING').length;
    const decided = Math.max(0, total - pending);
    const approved = loans.filter((loan) => loan.statutDemande === 'APPROVED').length;
    const approvalRate = decided > 0 ? ((approved / decided) * 100).toFixed(1) : '0.0';
    return `${total} active files · ${pending} pending · Approval rate ${approvalRate}%`;
  }

  onEventsFilterChange(): void {
    this.eventsPage = 1;
    this.expandedEventId = null;
  }

  goToEventsPage(page: number): void {
    this.eventsPage = Math.min(Math.max(1, page), this.totalEventPages);
    this.expandedEventId = null;
  }

  toggleHistoryWindow(): void {
    this.showHistoryTable = !this.showHistoryTable;
    if (this.showHistoryTable) {
      this.recalculateHistoryLayout();
      this.historyPage = 1;
    }
    if (this.showHistoryTable && !this.loansLoading && this.requestLoans.length === 0 && !this.loansError) {
      this.loadRequestLoans();
    }
    this.syncBodyScrollLock();
  }

  closeHistoryWindow(): void {
    this.showHistoryTable = false;
    this.syncBodyScrollLock();
  }

  get totalHistoryPages(): number {
    return Math.max(1, Math.ceil(this.requestLoans.length / this.historyPageSize));
  }

  get paginatedHistoryLoans(): RequestLoanDto[] {
    const start = (this.historyPage - 1) * this.historyPageSize;
    return this.requestLoans.slice(start, start + this.historyPageSize);
  }

  get historyPaginationPages(): number[] {
    const total = this.totalHistoryPages;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const current = this.historyPage;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }

  goToHistoryPage(page: number): void {
    this.historyPage = Math.min(Math.max(1, page), this.totalHistoryPages);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (!this.showHistoryTable) return;
    this.recalculateHistoryLayout();
  }

  private recalculateHistoryLayout(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width >= 1500) this.historyGridColumns = 4;
    else if (width >= 1150) this.historyGridColumns = 3;
    else if (width >= 820) this.historyGridColumns = 2;
    else this.historyGridColumns = 1;

    const rows = height >= 920 ? 3 : 2;
    this.historyPageSize = this.historyGridColumns * rows;

    if (this.historyPage > this.totalHistoryPages) {
      this.historyPage = this.totalHistoryPages;
    }
  }

  toggleStatsWindow(): void {
    this.showStatsWindow = !this.showStatsWindow;
    if (this.showStatsWindow && !this.loansLoading && this.requestLoans.length === 0 && !this.loansError) {
      this.loadRequestLoans();
    }
    this.syncBodyScrollLock();
  }

  closeStatsWindow(): void {
    this.showStatsWindow = false;
    this.syncBodyScrollLock();
  }

  get statsTotalDossiers(): number {
    return this.requestLoans.length;
  }

  get statsApprovedCount(): number {
    return this.requestLoans.filter((loan) => loan.statutDemande === 'APPROVED').length;
  }

  get statsRejectedCount(): number {
    return this.requestLoans.filter((loan) => loan.statutDemande === 'REJECTED').length;
  }

  get statsPendingCount(): number {
    return this.requestLoans.filter((loan) => loan.statutDemande === 'PENDING').length;
  }

  get statsApprovedPct(): number {
    const total = this.statsTotalDossiers || 1;
    return Math.round((this.statsApprovedCount / total) * 100);
  }

  get statsRejectedPct(): number {
    const total = this.statsTotalDossiers || 1;
    return Math.round((this.statsRejectedCount / total) * 100);
  }

  get statsPendingPct(): number {
    const total = this.statsTotalDossiers || 1;
    return Math.round((this.statsPendingCount / total) * 100);
  }

  get eventPaginationPages(): number[] {
    const total = this.totalEventPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const current = this.eventsPage;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }

  toggleEventExpand(eventId?: number): void {
    if (!eventId) {
      return;
    }
    this.expandedEventId = this.expandedEventId === eventId ? null : eventId;
  }

  trackByEventId(index: number, ev: EventDto): number | string {
    return ev.idEvent ?? `event-${index}`;
  }

  getCategoryLabel(ev: EventDto): string {
    return 'Event Public';
  }

  getEventDateTimeLabel(ev: EventDto): string {
    if (!ev.startDate || !ev.endDate) {
      return 'Date not set';
    }
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return 'Date not set';
    }
    const date = start.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
    const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${date} · ${startTime} - ${endTime} CST`;
  }

  isEventDayActive(ev: EventDto, dayIndex: number): boolean {
    if (!ev.startDate || !ev.endDate) {
      return false;
    }
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return false;
    }
    const map = [6, 0, 1, 2, 3, 4, 5]; // MON..SUN -> JS day index
    const targetDay = map[dayIndex];
    for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
      if (cursor.getDay() === targetDay) {
        return true;
      }
    }
    return false;
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

  getEventStatusClass(status?: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'PUBLISHED') return 'published';
    if (s === 'DRAFT') return 'draft';
    if (s === 'CANCELLED') return 'cancelled';
    return 'default';
  }

  loadRequestLoans(): void {
    this.loansLoading = true;
    this.loansError = '';
    this.requestLoans = [];
    this.selectedFile = null;
    this.showModal = false;

    this.creditService
      .getRequestLoans(0, 2000)
      .pipe(
        finalize(() => {
          this.loansLoading = false;
        }),
      )
      .subscribe({
        next: (response: PageResponse<RequestLoanDto>) => {
          this.requestLoans = Array.isArray(response?.content) ? response.content : [];
          this.syncCreditViewsFromApi();
          this.syncSeenRequestIds(this.requestLoans);
          this.seedNotificationsFromExistingPending(this.requestLoans);
        },
        error: (error: unknown) => {
          console.error('Error while loading request loans', error);
          this.loansError = 'Unable to load loan requests.';
          this.syncCreditViewsFromApi();
        },
      });
  }

  dossiers: DossierItem[] = [];

  activities = [
    {
      title: "Remboursement reçu — <b>Bilel Mrabet</b>",
      meta: "Il y a 4 min · Virement · #PAY-2026-028",
      value: "850 TND",
      color: "text-success",
      dotColor: "var(--success)"
    },
    {
      title: "Nouveau dossier soumis — <b>Karim Hadj</b>",
      meta: "Il y a 18 min · Consommation",
      value: "8 000 TND",
      color: "",
      dotColor: "var(--blue)"
    },
    {
      title: "Impayé détecté — <b>Farouk Ben Ali</b>",
      meta: "Il y a 1h · #CR-2024-018 · J+3",
      value: "310 TND",
      color: "text-danger",
      dotColor: "var(--danger)"
    },
    {
      title: "Assurance renouvelée — <b>Amira Selmi</b>",
      meta: "Il y a 2h · STAR · Toyota Corolla",
      value: "1 200 TND",
      color: "text-success",
      dotColor: "var(--success)"
    }
  ];

  topAgents = [
    {
      rank: 1,
      initials: "SA",
      name: "Sami Allani",
      desc: "18 dossiers approuvés",
      score: "98%",
      scoreClass: "text-success"
    },
    {
      rank: 2,
      initials: "RK",
      name: "Rania Khelifi",
      desc: "14 dossiers approuvés",
      score: "91%",
      scoreClass: "text-warning"
    },
    {
      rank: 3,
      initials: "MN",
      name: "Mohamed Naifar",
      desc: "11 dossiers approuvés",
      score: "87%",
      scoreClass: "text-blue"
    }
  ];

  chartBars = [55,70,85,60,75,90,65,80,70,95,88,100];

  creditDistribution = [
    { name:"Automobile", value:20, pct:"42%", color:"#3B82F6" },
    { name:"Immobilier", value:12, pct:"26%", color:"#06B6D4" },
    { name:"Consommation", value:10, pct:"21%", color:"#8B5CF6" },
    { name:"Autres", value:5, pct:"11%", color:"#CBD5E1" }
  ];

  delinquencies = [
    {
      initials: "FB",
      name: "Farouk Ben Ali",
      city: "Tunis",
      phone: "+216 20 111 222",   // ← ajouter
      dossier: "#CR-2024-018",
      product: "Consommation · 24 mois",
      amount: "310 TND",
      delay: "J+3",
      risk: "Modéré",
      sms: "1 SMS · 0 appel"
    },
    {
      initials: "HG",
      name: "Hanen Gharbi",
      city: "Sfax",
      phone: "+216 24 333 444",   // ← ajouter
      dossier: "#CR-2023-092",
      product: "Automobile · 60 mois",
      amount: "890 TND",
      delay: "J+14",
      risk: "Élevé",
      sms: "3 SMS · 2 appels"
    }
  ];

  clients = [
    {
      initials: "BM",
      name: "Bilel Mrabet",
      email: "bilel.mrabet@email.com",
      phone: "+216 20 123 456",
      cin: "08 123 456",
      city: "Tunis",
      score: 742,
      scoreColor: "var(--success)",
      credits: "3 active",
      encours: "24 500 TND",
      kyc: "Complete",
      status: "Active",
      statusClass: "b-actif"
    },
    {
      initials: "LB",
      name: "Leila Bourguiba",
      email: "l.bourguiba@email.com",
      phone: "+216 22 654 321",
      cin: "12 456 789",
      city: "Sousse",
      score: 610,
      scoreColor: "var(--warning)",
      credits: "1 active",
      encours: "32 500 TND",
      kyc: "Partial",
      status: "Active",
      statusClass: "b-actif"
    }
  ];


  pipelineColumns: PipelineColumn[] = [];

  analysisFiles: AnalysisFileItem[] = [];

  payments = [
    {
      ref: "#PAY-2026-028",
      client: "Bilel Mrabet",
      file: "#CR-2024-001",
      fileType: "Auto Loan",
      amount: "260 TND",
      date: "28 Feb 2026",
      mode: "Transfer",
      status: "Paid",
      agent: "Auto"
    },
    {
      ref: "#PAY-2026-027",
      client: "Bilel Mrabet",
      file: "#CR-2024-018",
      fileType: "Consumption",
      amount: "310 TND",
      date: "28 Feb 2026",
      mode: "Direct Debit",
      status: "Paid",
      agent: "Auto"
    },
    {
      ref: "#PAY-2026-024",
      client: "Amira Selmi",
      file: "#CR-2024-015",
      fileType: "Consumption",
      amount: "420 TND",
      date: "25 Feb 2026",
      mode: "Cash",
      status: "Paid",
      agent: "Sami A."
    },
    {
      ref: "#PAY-2026-019",
      client: "Farouk Ben Ali",
      file: "#CR-2024-018",
      fileType: "Consumption",
      amount: "310 TND",
      date: "J+3",
      mode: "",
      status: "Pending",
      agent: "Rania K."
    }
  ];

  riskAlerts = [
    {
      initials: "FB",
      name: "Farouk Ben Ali",
      score: 468,
      motif: "Overdue J+3",
      encours: "7,800 TND",
      actionLabel: "Process",
      badgeClass: "b-danger"
    },
    {
      initials: "HG",
      name: "Hanen Gharbi",
      score: 412,
      motif: "Overdue J+14",
      encours: "12,400 TND",
      actionLabel: "Legal",
      badgeClass: "b-danger"
    },
    {
      initials: "RK",
      name: "Ridha Khelil",
      score: 538,
      motif: "Debt ratio 58%",
      encours: "19,200 TND",
      actionLabel: "Analyze",
      badgeClass: "b-review"
    }
  ];

  scoreDistribution = [
    { label: "800–850", pct: 18, color: "var(--success)" },
    { label: "700–799", pct: 54, color: "var(--success)" },
    { label: "600–699", pct: 19, color: "var(--warning)" },
    { label: "500–599", pct: 6, color: "var(--danger)" },
    { label: "< 500", pct: 3, color: "var(--danger)" }
  ];

  notificationsCritical: CriticalNotificationItem[] = [];

  get unreadCriticalCount(): number {
    return this.notificationsCritical.length;
  }

  get topbarUnreadCount(): number {
    return this.unreadNotificationsCount;
  }

  notificationsRecent: RecentNotificationItem[] = [];

  get topbarNotifications(): TopbarNotificationItem[] {
    return [...this.notificationsCritical, ...this.notificationsRecent];
  }

  private handleRealtimeNotification(event: AdminRequestNotificationEvent): void {
    if (!event || event.type !== 'NEW_REQUEST') {
      return;
    }

    const createdAt = event.createdAt ? new Date(event.createdAt) : new Date();
    const amountLabel = typeof event.amount === 'number' ? `${event.amount} TND` : '-';
    const objective = event.objective || 'Credit request';
    const title = `New request — ${event.clientFullName || 'Client'} — #CR-${event.requestId}`;
    const meta = `${createdAt.toLocaleString()} · ${objective} · ${amountLabel} · Action required`;

    this.notificationsCritical = [
      {
        title,
        meta,
        type: 'warning',
        requestId: event.requestId,
        targetPage: 'credits',
      },
      ...this.notificationsCritical,
    ].slice(0, 25);
    this.unreadNotificationsCount += 1;
  }

  private handleRealtimeEventNotification(event: AdminEventNotificationEvent): void {
    if (!event || event.type !== 'EVENT_SUBMITTED' || !event.eventId) {
      return;
    }

    const createdAt = event.createdAt ? new Date(event.createdAt) : new Date();
    const title = `New event — ${event.organizerFullName || 'Insurer'} — #EV-${event.eventId}`;
    const meta = `${createdAt.toLocaleString()} · ${event.title || 'Event'} · Pending validation`;

    this.notificationsCritical = [
      {
        title,
        meta,
        type: 'warning',
        eventId: event.eventId,
        targetPage: 'events',
      },
      ...this.notificationsCritical,
    ].slice(0, 25);
    this.seededNotificationEventIds.add(event.eventId);
    this.unreadNotificationsCount += 1;
  }

  private seedNotificationsFromExistingPendingEvents(): void {
    this.eventService.getEvents(0, 1000).subscribe({
      next: (response: EventPageResponse) => {
        const rows = Array.isArray(response?.content) ? response.content : [];
        const pending = rows
          .filter((ev) => ev?.idEvent != null && (ev.status || '').toUpperCase() === 'DRAFT')
          .slice(0, 20);

        pending.forEach((ev) => {
          if (!ev.idEvent || this.seededNotificationEventIds.has(ev.idEvent)) return;
          this.handleRealtimeEventNotification({
            type: 'EVENT_SUBMITTED',
            eventId: ev.idEvent,
            title: ev.title || 'Event',
            status: (ev.status || 'DRAFT').toUpperCase(),
            organizerId: ev.userId,
            organizerFullName: 'Insurer',
            createdAt: new Date().toISOString(),
            message: 'New event submitted for validation',
          });
        });
      },
      error: () => {
        // Keep websocket as primary channel.
      },
    });
  }

  onNotificationsPanelOpened(): void {
    this.unreadNotificationsCount = 0;
  }

  openNotification(item: CriticalNotificationItem): void {
    if (!item.requestId) {
      return;
    }
    this.openLoanRequestById(item.requestId);
  }

  openTopbarNotification(item: TopbarNotificationItem): void {
    if (item.eventId) {
      this.openEventById(item.eventId);
      return;
    }

    const requestId = item.requestId ?? this.extractRequestIdFromText(`${item.title} ${item.meta}`);
    if (requestId) {
      this.openLoanRequestById(requestId);
      return;
    }

    if (item.targetPage) {
      this.onPageChange(item.targetPage);
      return;
    }

    // Fallback for event-like notifications without explicit target metadata.
    if (/event/i.test(item.title) || /event/i.test(item.meta)) {
      this.onPageChange('events');
      return;
    }

    this.onPageChange('notifications');
  }

  private extractRequestIdFromText(text: string): number | undefined {
    const match = text.match(/#CR-(\d+)/i);
    if (!match) return undefined;
    const id = Number(match[1]);
    return Number.isFinite(id) ? id : undefined;
  }

  private openLoanRequestById(requestId: number): void {
    this.onPageChange('credits');
    const existing = this.requestLoans.find((loan) => loan.idDemande === requestId);
    if (existing) {
      this.openModal(existing);
      return;
    }

    this.loansLoading = true;
    this.loansError = '';
    this.creditService
      .getRequestLoans(0, 2000)
      .pipe(finalize(() => (this.loansLoading = false)))
      .subscribe({
        next: (response: PageResponse<RequestLoanDto>) => {
          this.requestLoans = Array.isArray(response?.content) ? response.content : [];
          this.syncCreditViewsFromApi();
          const target = this.requestLoans.find((loan) => loan.idDemande === requestId);
          if (target) {
            this.openModal(target);
          }
        },
        error: () => {
          this.loansError = 'Unable to open the request from the notification.';
        },
      });
  }

  private openEventById(eventId: number): void {
    this.onPageChange('events');
    const focusTarget = () => {
      const target = this.events.find((ev) => ev.idEvent === eventId);
      if (!target) {
        return;
      }
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
        next: (response: EventPageResponse) => {
          this.events = Array.isArray(response?.content) ? response.content : [];
          focusTarget();
        },
        error: () => {
          this.eventsError = 'Unable to open the event from the notification.';
        },
      });
  }

  reports = [
    {
      title: "Monthly report — Feb 2026",
      date: "Generated on 28/02/2026",
      actionLabel: "Download",
      outline: false
    },
    {
      title: "Monthly report — Jan 2026",
      date: "Generated on 31/01/2026",
      actionLabel: "Download",
      outline: true
    },
    {
      title: "Annual report — 2025",
      date: "Generated on 05/01/2026",
      actionLabel: "Download",
      outline: true
    }
  ];

  vehicles = [
    {
      plate: "267 TN 2022",
      name: "Toyota Corolla",
      desc: "Auto · Petrol · 2022",
      owner: "Bilel Mrabet",
      credit: "#CR-2024-001",
      value: "42 000 TND",
      km: "32 450 km",
      insurance: "⚠ 2 days",
      status: "Insured",
      statusClass: "b-review"
    },
    {
      plate: "158 TN 2019",
      name: "Kia Picanto",
      desc: "Manual · Petrol · 2019",
      owner: "Bilel Mrabet",
      credit: "Settled ✓",
      value: "18 500 TND",
      km: "78 200 km",
      insurance: "106 days",
      status: "Insured",
      statusClass: "b-actif"
    },
    {
      plate: "445 TN 2021",
      name: "Volkswagen Golf",
      desc: "Auto · Diesel · 2021",
      owner: "Amira Selmi",
      credit: "#CR-2024-015",
      value: "58 000 TND",
      km: "41 200 km",
      insurance: "210 days",
      status: "Insured",
      statusClass: "b-actif"
    }
  ];

  insuranceContracts = [
    {
      number: "STAR-2025-048291",
      client: "Bilel Mrabet",
      vehicle: "Toyota Corolla 2022",
      insurer: "STAR Assurance",
      type: "All Risks",
      premium: "1 200 TND",
      expiry: "28 Feb 2026",
      delay: "⚠ 2 days",
      delayClass: "b-danger",
      actions: ["Renew", "View"]
    },
    {
      number: "GAT-2024-019384",
      client: "Sonia Karray",
      vehicle: "Renault Clio 2020",
      insurer: "GAT Assurance",
      type: "Third Party Extended",
      premium: "640 TND",
      expiry: "10 Mar 2026",
      delay: "⚠ 10 days",
      delayClass: "b-review",
      actions: ["Renew", "View"]
    },
    {
      number: "MAGHREBIA-018742",
      client: "Hadi Jouini",
      vehicle: "Peugeot 208 2023",
      insurer: "Maghrebia",
      type: "All Risks",
      premium: "1 100 TND",
      expiry: "25 Mar 2026",
      delay: "25 days",
      delayClass: "b-pending",
      actions: ["Prepare", "View"]
    }
  ];

  settingsUsers = [
    {
      initials: "SA",
      name: "Sami Allani",
      email: "s.allani@finix.tn",
      role: "Super Admin",
      roleClass: "b-purple",
      lastLogin: "Today · 09:14",
      status: "Active"
    },
    {
      initials: "RK",
      name: "Rania Khelifi",
      email: "r.khelifi@finix.tn",
      role: "Advisor",
      roleClass: "b-blue",
      lastLogin: "Today · 08:45",
      status: "Active"
    },
    {
      initials: "MN",
      name: "Mohamed Naifar",
      email: "m.naifar@finix.tn",
      role: "Advisor",
      roleClass: "b-blue",
      lastLogin: "Yesterday · 17:30",
      status: "Active"
    }
  ];

  notificationsConfig: any = {
    overdueSms: true,
    renewalReminder: true,
    monthlyReport: true,
    fileAlert: true,
    autoScoring: false
  };

  dossier = {
    reference: '-',
    status: 'N/A',
    submittedDate: '-',
    client: {
      name: '-',
      cin: '-',
      phone: '-',
      email: '-',
    },
  };

  private syncCreditViewsFromApi(): void {
    const loans = this.requestLoans ?? [];

    this.dossiers = loans.slice(0, 3).map((loan) => {
      const firstName = loan.user?.firstName ?? '';
      const lastName = loan.user?.lastName ?? '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Unknown client';
      const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase() || 'NA';
      return {
        ref: `#CR-${loan.idDemande}`,
        initials,
        client: fullName,
        clientSince: 'Source: database',
        type: loan.objectifCredit || 'N/A',
        amount: `${loan.montantDemande ?? 0} TND`,
        score: this.formatRiskScore(loan.riskScore),
        scoreColor: this.riskScoreColor(loan.riskScore),
        status: loan.statutDemande || 'N/A',
        statusClass:
          loan.statutDemande === 'APPROVED'
            ? 'b-actif'
            : loan.statutDemande === 'REJECTED'
              ? 'b-danger'
              : 'b-review',
      };
    });

    const pending = loans.filter((loan) => loan.statutDemande === 'PENDING');
    const decided = loans.filter((loan) => loan.statutDemande !== 'PENDING');

    this.pipelineColumns = [
      {
        title: 'New requests',
        shortTitle: 'New',
        class: 'ph-new',
        count: pending.length,
        cards: pending.slice(0, 8).map((loan) => ({
          idDemande: loan.idDemande,
          statutDemande: loan.statutDemande,
          dateCreation: loan.dateCreation,
          user: loan.user,
          vehicle: loan.vehicle,
          vehicule: loan.vehicule,
          name:
            `${loan.user?.firstName ?? ''} ${loan.user?.lastName ?? ''}`.trim() ||
            `Request #${loan.idDemande}`,
          ref: `#CR-${loan.idDemande}`,
          amount: `${loan.montantDemande ?? 0} TND`,
          type: loan.objectifCredit || 'N/A',
          warn: this.isOlderThan48h(loan.dateCreation),
        })),
      },
      {
        title: 'Processed files',
        shortTitle: 'Done',
        class: 'ph-analysis',
        count: decided.length,
        cards: decided.slice(0, 8).map((loan) => ({
          idDemande: loan.idDemande,
          statutDemande: loan.statutDemande,
          dateCreation: loan.dateCreation,
          user: loan.user,
          vehicle: loan.vehicle,
          vehicule: loan.vehicule,
          name:
            `${loan.user?.firstName ?? ''} ${loan.user?.lastName ?? ''}`.trim() ||
            `Request #${loan.idDemande}`,
          ref: `#CR-${loan.idDemande}`,
          amount: `${loan.montantDemande ?? 0} TND`,
          type: loan.objectifCredit || 'N/A',
          warn: this.isOlderThan48h(loan.dateCreation),
        })),
      },
    ];

    this.analysisFiles = pending.slice(0, 12).map((loan) => ({
      idDemande: loan.idDemande,
      statutDemande: loan.statutDemande,
      montantDemande: loan.montantDemande ?? 0,
      apportPersonnel: loan.apportPersonnel ?? 0,
      dureeMois: loan.dureeMois ?? 0,
      mensualiteEstimee: loan.mensualiteEstimee ?? 0,
      objectifCredit: loan.objectifCredit || 'N/A',
      dateCreation: loan.dateCreation,
      user: loan.user,
      vehicle: loan.vehicle,
      vehicule: loan.vehicule,
      ref: `#CR-${loan.idDemande}`,
      initials:
        `${loan.user?.firstName?.charAt(0) ?? ''}${loan.user?.lastName?.charAt(0) ?? ''}`.toUpperCase() ||
        'NA',
      name: `${loan.user?.firstName ?? ''} ${loan.user?.lastName ?? ''}`.trim() || 'Unknown client',
      clientInfo: 'Source: database',
      type: loan.objectifCredit || 'N/A',
      amount: `${loan.montantDemande ?? 0} TND`,
      duration: `${loan.dureeMois ?? 0} months`,
      score: Math.round(loan.riskScore ?? 0),
      debtRatio: this.extractDebtRatio(this.adaptiveBreakdownText(loan)),
      seniority: 'N/A',
      recommendation: this.riskDecisionLabel(loan.riskDecision),
      riskDecision: loan.riskDecision,
      riskBreakdown: loan.riskBreakdown,
      internalRiskBreakdown: loan.internalRiskBreakdown,
    }));
    this.pipelinePage = 1;
    this.analysisPage = 1;
  }

  private startFallbackNotificationPolling(): void {
    if (this.fallbackPollingHandle) return;
    this.fallbackPollingHandle = setInterval(() => {
      this.pollForNewRequests();
    }, 10000);
  }

  private stopFallbackNotificationPolling(): void {
    if (!this.fallbackPollingHandle) return;
    clearInterval(this.fallbackPollingHandle);
    this.fallbackPollingHandle = null;
  }

  private syncSeenRequestIds(loans: RequestLoanDto[]): void {
    loans.forEach((loan) => {
      if (loan?.idDemande != null) {
        this.seenRequestIds.add(loan.idDemande);
      }
    });
  }

  private pollForNewRequests(): void {
    this.creditService.getRequestLoans(0, 100).subscribe({
      next: (response: PageResponse<RequestLoanDto>) => {
        const loans = Array.isArray(response?.content) ? response.content : [];
        if (this.seenRequestIds.size === 0) {
          this.syncSeenRequestIds(loans);
          return;
        }

        loans.forEach((loan) => {
          if (!loan?.idDemande || this.seenRequestIds.has(loan.idDemande) || loan.statutDemande === 'DRAFT') {
            return;
          }
          const clientFullName =
            `${loan.user?.firstName ?? ''} ${loan.user?.lastName ?? ''}`.trim() || 'Client';
          this.handleRealtimeNotification({
            type: 'NEW_REQUEST',
            requestId: loan.idDemande,
            clientFullName,
            amount: loan.montantDemande ?? 0,
            objective: loan.objectifCredit ?? 'Credit request',
            status: loan.statutDemande ?? 'PENDING',
            createdAt: loan.dateCreation ? new Date(loan.dateCreation).toISOString() : new Date().toISOString(),
          });
          this.seenRequestIds.add(loan.idDemande);
          this.requestLoans = loans;
          this.syncCreditViewsFromApi();
        });
      },
      error: () => {
        // Silent fallback polling; websocket remains primary realtime channel.
      },
    });
  }

  private seedNotificationsFromExistingPending(loans: RequestLoanDto[]): void {
    if (!Array.isArray(loans) || loans.length === 0) return;
    const latestPending = loans
      .filter((loan) => loan?.idDemande != null && loan.statutDemande === 'PENDING')
      .sort((a, b) => {
        const ta = a.dateCreation ? new Date(a.dateCreation).getTime() : 0;
        const tb = b.dateCreation ? new Date(b.dateCreation).getTime() : 0;
        return tb - ta;
      })
      .slice(0, 10);

    latestPending.forEach((loan) => {
      if (!loan.idDemande || this.seededNotificationRequestIds.has(loan.idDemande)) {
        return;
      }
      const clientFullName =
        `${loan.user?.firstName ?? ''} ${loan.user?.lastName ?? ''}`.trim() || 'Client';
      this.handleRealtimeNotification({
        type: 'NEW_REQUEST',
        requestId: loan.idDemande,
        clientFullName,
        amount: loan.montantDemande ?? 0,
        objective: loan.objectifCredit ?? 'Credit request',
        status: loan.statutDemande ?? 'PENDING',
        createdAt: loan.dateCreation ? new Date(loan.dateCreation).toISOString() : new Date().toISOString(),
      });
      this.seededNotificationRequestIds.add(loan.idDemande);
    });
  }




  goCredits() {
    this.onPageChange('credits');
  }

  openCreateEventModal(): void {
    this.resetEventForm();
    this.isEditingEvent = false;
    this.editingEventId = null;
    this.showEventModal = true;
  }

  openEditEventModal(ev: EventDto): void {
    if (!this.canEditEvent(ev) || !ev.idEvent) {
      return;
    }
    this.eventCreateError = '';
    this.eventCreateSuccess = '';
    this.isEditingEvent = true;
    this.editingEventId = ev.idEvent;
    this.eventForm = {
      title: ev.title || '',
      description: ev.description || '',
      rules: ev.rules || '',
      city: ev.city || '',
      address: ev.address || '',
      startDate: this.toDateTimeLocal(ev.startDate),
      endDate: this.toDateTimeLocal(ev.endDate),
      registrationDeadline: this.toDateTimeLocal(ev.registrationDeadline),
      maxParticipants: ev.maxParticipants ?? 0,
      currentParticipants: ev.currentParticipants ?? 0,
      imageUrl: ev.imageUrl || ev.image || '',
      status: ev.status || 'PUBLISHED',
      publicEvent: ev.publicEvent ?? true,
      userId: ev.userId || this.getConnectedUserId() || 0,
    };
    this.showEventModal = true;
  }

  closeCreateEventModal(resetMessages = true): void {
    this.showEventModal = false;
    this.isEditingEvent = false;
    this.editingEventId = null;
    if (resetMessages) {
      this.eventCreateError = '';
      this.eventCreateSuccess = '';
    }
    this.isCreatingEvent = false;
  }

  openAddressMapPicker(): void {
    this.mapPickerError = '';
    this.mapSearchQuery = '';
    this.selectedMapAddress = this.eventForm.address || '';
    this.selectedMapLocation = null;
    this.showAddressMapModal = true;
    // Initialize only after modal is visible in the DOM.
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
    // Emit selected address payload to parent form state.
    this.eventForm.address = this.selectedMapAddress.trim();
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
    const mapContainerId = 'event-address-map';
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

    // Required delayed tile fix after modal open.
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

  createEvent(): void {
    const userId = this.getConnectedUserId();
    if (!userId) {
      this.eventCreateError = 'Signed-in user not found.';
      return;
    }

    this.eventForm.userId = userId;
    this.isCreatingEvent = true;
    this.eventCreateError = '';
    this.eventCreateSuccess = '';

    const payload: CreateEventPayload = {
      title: this.eventForm.title.trim(),
      description: this.eventForm.description.trim(),
      rules: this.eventForm.rules.trim(),
      city: this.eventForm.city.trim(),
      address: this.eventForm.address.trim(),
      startDate: this.eventForm.startDate,
      endDate: this.eventForm.endDate,
      registrationDeadline: this.eventForm.registrationDeadline,
      maxParticipants: Number(this.eventForm.maxParticipants) || 0,
      currentParticipants: 0,
      imageUrl: this.eventForm.imageUrl.trim(),
      status: this.eventForm.status || 'PUBLISHED',
      publicEvent: this.eventForm.publicEvent,
      userId,
    };

    const duplicateTitleExists = this.events.some((ev) => {
      const sameTitle = (ev.title || '').trim().toLowerCase() === payload.title.toLowerCase();
      const isDifferentEvent = !this.isEditingEvent || ev.idEvent !== this.editingEventId;
      return sameTitle && isDifferentEvent;
    });
    if (duplicateTitleExists) {
      this.isCreatingEvent = false;
      this.eventCreateError = `Another event already uses the title "${payload.title}".`;
      return;
    }

    if (!payload.title || !payload.city || !payload.address || !payload.startDate || !payload.endDate) {
      this.isCreatingEvent = false;
      this.eventCreateError = 'Please fill in the required fields.';
      return;
    }

    const startDate = new Date(payload.startDate);
    const endDate = new Date(payload.endDate);
    const registrationDeadline = payload.registrationDeadline ? new Date(payload.registrationDeadline) : null;

    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && endDate <= startDate) {
      this.isCreatingEvent = false;
      this.eventCreateError = 'End date must be after the start date.';
      return;
    }

    if (
      registrationDeadline &&
      !Number.isNaN(registrationDeadline.getTime()) &&
      !Number.isNaN(endDate.getTime()) &&
      registrationDeadline > endDate
    ) {
      this.isCreatingEvent = false;
      this.eventCreateError = 'Registration deadline must be on or before the end date.';
      return;
    }

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
          this.closeCreateEventModal(false);
          this.loadEvents();
        },
        error: (err: any) => {
          if (err?.status === 403) {
            this.eventCreateError = 'Backend refused access to create or update this event.';
            return;
          }
          this.eventCreateError = err?.error?.message || err?.message || 'Failed to save the event.';
        },
      });
  }

  approveEvent(ev: EventDto): void {
    this.changeEventStatus(ev, 'PUBLISHED');
  }

  declineEvent(ev: EventDto): void {
    this.changeEventStatus(ev, 'CANCELLED');
  }

  private changeEventStatus(ev: EventDto, targetStatus: 'PUBLISHED' | 'CANCELLED'): void {
    if (!ev?.idEvent) {
      this.eventsError = 'Event not found.';
      return;
    }
    if ((ev.status || '').toUpperCase() === targetStatus) {
      return;
    }

    const userId = this.getConnectedUserId() || ev.userId || 0;
    const payload: CreateEventPayload = {
      title: (ev.title || '').trim(),
      description: (ev.description || '').trim(),
      rules: (ev.rules || '').trim(),
      city: (ev.city || '').trim(),
      address: (ev.address || '').trim(),
      startDate: ev.startDate || '',
      endDate: ev.endDate || '',
      registrationDeadline: ev.registrationDeadline || ev.endDate || '',
      maxParticipants: Number(ev.maxParticipants) || 0,
      currentParticipants: Number(ev.currentParticipants) || 0,
      imageUrl: (ev.imageUrl || ev.image || '').trim(),
      status: targetStatus,
      publicEvent: ev.publicEvent ?? true,
      userId,
    };

    if (!payload.title || !payload.city || !payload.address || !payload.startDate || !payload.endDate) {
      this.eventsError = 'Cannot update status: event data is incomplete.';
      return;
    }

    this.eventsError = '';
    this.eventService.updateEvent(ev.idEvent, payload).subscribe({
      next: () => this.loadEvents(),
      error: (err: any) => {
        this.eventsError = err?.error?.message || err?.message || 'Failed to update event status.';
      },
    });
  }

  private resetEventForm(): void {
    this.eventCreateError = '';
    this.eventCreateSuccess = '';
    this.eventForm = {
      title: '',
      description: '',
      rules: '',
      city: '',
      address: '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      maxParticipants: 0,
      currentParticipants: 0,
      imageUrl: '',
      status: 'PUBLISHED',
      publicEvent: true,
      userId: this.getConnectedUserId() || 0,
    };
  }

  canEditEvent(ev: EventDto): boolean {
    if (!ev.startDate) return false;
    const start = new Date(ev.startDate);
    if (Number.isNaN(start.getTime())) return false;
    return start.getTime() > Date.now();
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

  private getConnectedUserId(): number | null {
    try {
      const raw = localStorage.getItem('currentUser');
      if (!raw) return null;
      const user = JSON.parse(raw);
      return typeof user.userId === 'number' ? user.userId : null;
    } catch {
      return null;
    }
  }

  private isOlderThan48h(value?: string | Date): boolean {
    if (!value) {
      return false;
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      return false;
    }
    return Date.now() - d.getTime() > 48 * 60 * 60 * 1000;
  }

  private formatRiskScore(score?: number): string {
    if (typeof score !== 'number' || Number.isNaN(score)) {
      return 'N/A';
    }
    return `${Math.round(score)}/100`;
  }

  private riskScoreColor(score?: number): string {
    if (typeof score !== 'number' || Number.isNaN(score)) {
      return '#64748B';
    }
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    if (score >= 25) return 'var(--orange, #f59e0b)';
    return 'var(--danger)';
  }

  private riskDecisionLabel(decision?: RequestLoanDto['riskDecision']): string {
    if (decision === 'ACCEPTE_AUTO') return 'Auto-accepted (to validate)';
    if (decision === 'REVUE_AGENT') return 'Agent review';
    if (decision === 'COMITE_CREDIT') return 'Credit committee';
    if (decision === 'REFUSE_AUTO') return 'Auto-rejected';
    return 'To review';
  }

  /**
   * Prefer persisted rule-based breakdown when ML replaced riskBreakdown (EXTERNAL_PKL).
   */
  adaptiveBreakdownText(file?: RequestLoanDto | null): string | undefined {
    if (!file) return undefined;
    const internal = file.internalRiskBreakdown?.trim();
    if (internal) return file.internalRiskBreakdown;
    return file.riskBreakdown;
  }

  private extractDebtRatio(breakdown?: string): number {
    if (!breakdown) return 0;
    const match = breakdown.match(/X1 \(DTI\).*?=\s*([0-9]+(?:\.[0-9]+)?)/);
    if (!match) return 0;
    const value = Number(match[1]);
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }

  getScoringFactorValue(factorKey: 'X1' | 'X4' | 'X5', breakdown?: string): string {
    if (!breakdown) return '-';
    const match = breakdown.match(new RegExp(`${factorKey}.*?=\\s*([0-9]+(?:\\.[0-9]+)?)`, 'i'));
    if (!match) return '-';
    const value = Number(match[1]);
    return Number.isFinite(value) ? value.toFixed(2) : '-';
  }

  getRiskDecisionDisplay(decision?: string): string {
    if (!decision) return '-';
    if (decision === 'ACCEPTE_AUTO') return 'Low risk';
    if (decision === 'REFUSE_AUTO') return 'High risk';
    return decision;
  }

  /** True when breakdown text is from external ML (pkl pipeline), not internal X1/X4/X5 scoring. */
  isMlRiskBreakdown(breakdown?: string): boolean {
    if (!breakdown) return false;
    const n = breakdown.toLowerCase();
    return (
      n.includes('ml service') ||
      n.includes('anomaly probability') ||
      n.includes('mapped decision') ||
      (n.includes('decision') && n.includes('automatically_validated')) ||
      /\balerts\s*=/.test(n)
    );
  }

  /**
   * Cards under "Adaptive scoring detail" — internal rule-based lines only.
   * ML-specific lines belong in "ML scoring detail".
   */
  getAdaptiveBreakdownOnlyEntries(breakdown?: string): Array<{ label: string; value: string; tone: 'neutral' | 'good' | 'warn' | 'danger' }> {
    if (!breakdown) return [];
    if (this.isMlRiskBreakdown(breakdown)) return [];
    return this.getBeautifiedScoringEntries(breakdown);
  }

  getBeautifiedScoringEntries(breakdown?: string): Array<{ label: string; value: string; tone: 'neutral' | 'good' | 'warn' | 'danger' }> {
    if (!breakdown) {
      return [];
    }

    const lines = breakdown
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const entries: Array<{ label: string; value: string; tone: 'neutral' | 'good' | 'warn' | 'danger' }> = [];

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('ml service')) {
        entries.push({
          label: 'Scoring source',
          value: line.replace(/^[-*]\s*/, ''),
          tone: 'neutral',
        });
        continue;
      }

      const idx = line.indexOf('=');
      if (idx <= 0) continue;

      const rawKey = line.slice(0, idx).trim();
      const rawValue = line.slice(idx + 1).trim();
      if (!rawValue) continue;

      const normalizedKey = rawKey.toLowerCase();
      let label = rawKey;
      if (normalizedKey.includes('x1') && normalizedKey.includes('dti')) label = 'x1 (DTI)';
      else if (normalizedKey === 'x4') label = 'x2';
      else if (normalizedKey === 'x5') label = 'x3';
      else if (normalizedKey.includes('decision')) label = normalizedKey.includes('mapped') ? 'Mapped decision' : 'Decision';
      else if (normalizedKey.includes('anomaly probability')) label = 'Anomaly probability';
      else if (normalizedKey.includes('alerts')) label = 'Alerts';

      entries.push({
        label,
        value: rawValue,
        tone: this.resolveScoringEntryTone(label, rawValue),
      });
    }

    return entries;
  }

  getRiskScoringSummaryEntries(
    file?: RequestLoanDto | null,
  ): Array<{ label: string; value: string; tone: 'neutral' | 'good' | 'warn' | 'danger' }> {
    if (!file) return [];

    const scoreValue = file.riskScore != null && Number.isFinite(file.riskScore)
      ? `${Math.round(file.riskScore)}/100`
      : 'N/A';
    const decisionValue = this.getRiskDecisionDisplay(file.riskDecision);
    const decisionSourceValue = file.decisionSource || '-';
    const riskSourceValue = file.riskSource || '-';

    return [
      { label: 'Risk score', value: scoreValue, tone: this.resolveRiskScoreTone(file.riskScore) },
      { label: 'Automatic decision', value: decisionValue, tone: this.resolveScoringEntryTone('Decision', file.riskDecision || '') },
      { label: 'Decision source', value: decisionSourceValue, tone: 'neutral' },
      { label: 'Risk source', value: riskSourceValue, tone: 'neutral' },
    ];
  }

  /**
   * ML-only cards: prefer structured API fields when present; otherwise parse riskBreakdown
   * (covers older responses where backend only sends the text block).
   */
  parseMlScoringCardsFromBreakdown(breakdown?: string): Array<{ label: string; value: string; tone: 'neutral' | 'good' | 'warn' | 'danger' }> {
    if (!breakdown || !this.isMlRiskBreakdown(breakdown)) {
      return [];
    }

    const lines = breakdown.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
    const entries: Array<{ label: string; value: string; tone: 'neutral' | 'good' | 'warn' | 'danger' }> = [];

    for (const line of lines) {
      const lower = line.toLowerCase();
      if (lower.includes('ml service')) {
        entries.push({
          label: 'ML source',
          value: line.replace(/^[-*]\s*/, ''),
          tone: 'neutral',
        });
        continue;
      }
      const idx = line.indexOf('=');
      if (idx <= 0) continue;

      const rawKey = line.slice(0, idx).trim();
      const rawValue = line.slice(idx + 1).trim();
      if (!rawValue) continue;

      const nk = rawKey.toLowerCase();
      let label = rawKey;
      if (nk.includes('anomaly probability')) label = 'Anomaly probability';
      else if (nk.includes('mapped decision')) label = 'Mapped decision';
      else if (nk.includes('alerts')) label = 'Alerts';
      else if (nk.includes('decision')) label = 'ML decision';

      entries.push({
        label,
        value: rawValue,
        tone:
          label === 'Anomaly probability'
            ? this.resolveAnomalyProbabilityTone(rawValue)
            : this.resolveScoringEntryTone(label, rawValue),
      });
    }

    return entries;
  }

  private resolveAnomalyProbabilityTone(rawValue: string): 'neutral' | 'good' | 'warn' | 'danger' {
    const numeric = Number(String(rawValue).replace(/,/g, '').trim());
    if (!Number.isFinite(numeric)) return 'neutral';
    if (numeric <= 1) {
      return numeric >= 0.7 ? 'danger' : numeric >= 0.35 ? 'warn' : 'good';
    }
    return numeric >= 70 ? 'danger' : numeric >= 35 ? 'warn' : 'good';
  }

  private buildMlScoringFromDtoFields(
    file?: RequestLoanDto | null,
  ): Array<{ label: string; value: string; tone: 'neutral' | 'good' | 'warn' | 'danger' }> {
    if (!file) return [];
    // Never build "ML cards" from DTO fragments for INTERNAL_FALLBACK — upstream used to mistakenly set mlDecision from "Decision = ACCEPTE_AUTO".
    if ((file.riskSource || '').toUpperCase() !== 'EXTERNAL_PKL') {
      return [];
    }

    const entries: Array<{ label: string; value: string; tone: 'neutral' | 'good' | 'warn' | 'danger' }> = [];

    if (file.mlScoringSource?.trim()) {
      entries.push({ label: 'ML source', value: file.mlScoringSource.trim(), tone: 'neutral' });
    }

    if (file.mlProbability != null && Number.isFinite(file.mlProbability)) {
      const prob = Number(file.mlProbability);
      const pctLabel = `${(prob * 100).toFixed(2)}%`;
      const value = `${prob.toFixed(4)} (${pctLabel})`;
      entries.push({
        label: 'Anomaly probability',
        value,
        tone: this.resolveAnomalyProbabilityTone(String(prob)),
      });
    }

    if (file.mlDecision?.trim()) {
      const value = file.mlDecision.trim();
      entries.push({
        label: 'ML decision',
        value,
        tone: this.resolveScoringEntryTone('ML decision', value),
      });
    }

    if (file.mlAlerts?.trim()) {
      entries.push({
        label: 'Alerts',
        value: file.mlAlerts.trim(),
        tone: this.resolveScoringEntryTone('Alerts', file.mlAlerts),
      });
    }

    return entries;
  }

  getMlScoringEntries(file?: RequestLoanDto | null): Array<{ label: string; value: string; tone: 'neutral' | 'good' | 'warn' | 'danger' }> {
    if (!file) return [];
    // ML panel is only meaningful for EXTERNAL_PKL; internal adaptive scoring fills the upper section.
    if ((file.riskSource || '').toUpperCase() !== 'EXTERNAL_PKL') {
      return [];
    }

    const fromBreakdown = this.parseMlScoringCardsFromBreakdown(file.riskBreakdown);
    if (fromBreakdown.length > 0) {
      return fromBreakdown;
    }

    return this.buildMlScoringFromDtoFields(file);
  }

  hasInternalFactorBreakdown(breakdown?: string): boolean {
    if (!breakdown) return false;
    const normalized = breakdown.toLowerCase();
    return normalized.includes('x1') || normalized.includes('x4') || normalized.includes('x5');
  }

  private resolveRiskScoreTone(score?: number): 'neutral' | 'good' | 'warn' | 'danger' {
    if (typeof score !== 'number' || Number.isNaN(score)) return 'neutral';
    if (score >= 75) return 'good';
    if (score >= 50) return 'warn';
    return 'danger';
  }

  private resolveScoringEntryTone(label: string, value: string): 'neutral' | 'good' | 'warn' | 'danger' {
    const l = label.toLowerCase();
    const v = value.toLowerCase();

    if (l.includes('decision')) {
      if (v.includes('accepte') || v.includes('validated') || v.includes('automatically')) return 'good';
      if (v.includes('revue') || v.includes('comite') || v.includes('manual')) return 'warn';
      if (v.includes('refuse') || v.includes('rejected')) return 'danger';
      return 'neutral';
    }

    if (l.includes('alerts')) {
      const clean = v.replace(/\|/g, ' ').trim();
      if (clean.includes('no alerts') || clean === 'none' || clean === '[]' || clean === '-' || clean === 'aucune') return 'good';
      return 'warn';
    }

    if (l.includes('anomaly probability')) {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return 'neutral';
      if (numeric < 0.35) return 'good';
      if (numeric < 0.7) return 'warn';
      return 'danger';
    }

    return 'neutral';
  }

  hasMlOutput(file?: RequestLoanDto | null): boolean {
    if (!file) return false;
    if ((file.riskSource || '').toUpperCase() !== 'EXTERNAL_PKL') {
      return false;
    }
    return (
      this.parseMlScoringCardsFromBreakdown(file.riskBreakdown).length > 0 ||
      this.buildMlScoringFromDtoFields(file).length > 0
    );
  }

  formatMoney(value?: number | null): string {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '-';
    }
    return `${value} TND`;
  }

  formatMonths(value?: number | null): string {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return '-';
    }
    return `${value} months`;
  }



  selectedFile: (RequestLoanDto & { vehicle?: any; vehicule?: any; user?: any }) | null = null;

  openModal(file: RequestLoanDto | PipelineCard | DossierItem | AnalysisFileItem | Record<string, unknown>): void {
    this.selectedFile = this.resolveLoanForModal(file);
    this.decisionNote = '';
    this.decisionError = '';
    this.ignoreNextOverlayClose = true;
    this.showModal = true;
    this.syncBodyScrollLock();
  }

  private resolveLoanForModal(
    file: RequestLoanDto | PipelineCard | DossierItem | AnalysisFileItem | Record<string, unknown>,
  ): (RequestLoanDto & { vehicle?: any; vehicule?: any; user?: any }) | null {
    const candidate = file as any;
    const id = Number(candidate?.idDemande);
    if (!Number.isFinite(id) || id <= 0) {
      return candidate as (RequestLoanDto & { vehicle?: any; vehicule?: any; user?: any });
    }

    const fullLoan = this.requestLoans.find((loan) => Number(loan.idDemande) === id);
    if (!fullLoan) {
      return candidate as (RequestLoanDto & { vehicle?: any; vehicule?: any; user?: any });
    }

    // Keep any UI-only extras from the clicked card, but always prefer full API loan fields.
    return {
      ...candidate,
      ...fullLoan,
    } as (RequestLoanDto & { vehicle?: any; vehicule?: any; user?: any });
  }
  toggleConfig(key: string): void {
    if (this.notificationsConfig && key in this.notificationsConfig) {
      this.notificationsConfig[key] = !this.notificationsConfig[key];
    }
  }




  closeModal(event?: Event) {
    if (this.ignoreNextOverlayClose) {
      this.ignoreNextOverlayClose = false;
      return;
    }
    if (event) {
      event.stopPropagation();
    }
    this.showModal = false;
    this.syncBodyScrollLock();
  }

  approveCase(): void {
    if (this.selectedFile?.idDemande != null) {
      const id = this.selectedFile.idDemande as number;
      this.decisionSubmitting = true;
      this.decisionError = '';
      this.creditService
        .approveRequestLoan(id, this.decisionPayload())
        .pipe(finalize(() => (this.decisionSubmitting = false)))
        .subscribe({
          next: () => this.loadRequestLoans(),
          error: () => {
            this.decisionError = 'Unable to approve the request.';
          },
        });
      return;
    }
    this.closeDecisionModalUi();
  }

  rejectCase(): void {
    if (this.selectedFile?.idDemande != null) {
      const id = this.selectedFile.idDemande as number;
      this.decisionSubmitting = true;
      this.decisionError = '';
      this.creditService
        .rejectRequestLoan(id, this.decisionPayload())
        .pipe(finalize(() => (this.decisionSubmitting = false)))
        .subscribe({
          next: () => this.loadRequestLoans(),
          error: () => {
            this.decisionError = 'Unable to reject the request.';
          },
        });
      return;
    }
    this.closeDecisionModalUi();
  }

  private decisionPayload(): { note?: string } | undefined {
    const n = this.decisionNote?.trim();
    return n ? { note: n } : undefined;
  }

  /** Close modal without ignoreNextOverlayClose blocking (mock files off API). */
  private closeDecisionModalUi(): void {
    this.ignoreNextOverlayClose = false;
    this.showModal = false;
    this.syncBodyScrollLock();
  }

  private syncBodyScrollLock(): void {
    if (this.showHistoryTable || this.showStatsWindow || this.showModal) {
      this.lockBodyScroll();
      return;
    }
    this.unlockBodyScroll();
  }

  private lockBodyScroll(): void {
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  private unlockBodyScroll(): void {
    this.renderer.removeStyle(document.body, 'overflow');
  }

  requestMoreInfo() {
    console.log("More info requested", this.decisionNote);
  }

  onLogout(): void {
    this.authService.logout();
  }

  onToggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    localStorage.setItem(this.themeStorageKey, this.currentTheme);
  }

  private readSavedTheme(): 'light' | 'dark' {
    const raw = localStorage.getItem(this.themeStorageKey);
    return raw === 'light' ? 'light' : 'dark';
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    this.renderer.setAttribute(document.documentElement, 'data-theme', theme);
  }

  get canTakeDecision(): boolean {
    const status = this.selectedFile?.statutDemande;
    return status !== 'APPROVED' && status !== 'REJECTED';
  }

}





