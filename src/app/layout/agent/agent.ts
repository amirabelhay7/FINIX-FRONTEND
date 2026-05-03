import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation, ChangeDetectorRef, NgZone, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { apiUrl } from '../../core/config/api-url';
import { AppNotificationDto, NotificationCategoryApi, NotificationModuleApi, ReservationStatus, VehicleDto, VehicleReservationDto, VehicleSearchQuery, VehicleStatus } from '../../models';
import { VehicleService } from '../../services/vehicle/vehicle.service';
import { ReservationService } from '../../services/vehicle/reservation.service';
import { NotificationService } from '../../services/notification/notification.service';
import {
  DelinquencyService,
  DelinquencyCaseDto,
  RecoveryActionDto,
  CreateRecoveryActionDto,
} from '../../services/delinquency/delinquency.service';
import { RiskScoreService } from '../../services/risk-score/risk-score.service';

@Component({
  selector: 'app-agent',
  standalone: false,
  templateUrl: './agent.html',
  styleUrl: './agent.css',
  encapsulation: ViewEncapsulation.None,
})
export class AgentLayout implements OnInit, OnDestroy {
  currentTheme: 'light' | 'dark' = 'dark';
  selectedPage = 'dashboard';
  showUserMenu = false;

  private readonly API = apiUrl('/api');
  agentFirstName = '';
  agentLastName  = '';
  agentInitials  = 'AG';
  agentRole      = 'Agent IMF';

  currentTime = '';
  private clockInterval: any;
  private notifRefreshSub?: Subscription;
  private notifDropdownPollingId: ReturnType<typeof setInterval> | null = null;

  /* ── Notifications ── */
  notifDropdownOpen = false;
  notifications: AppNotificationDto[] = [];
  notificationsLoading = false;
  unreadCount = 0;
  private pendingNotificationVehicleId: number | null = null;
  private pendingNotificationReservationId: number | null = null;

  /* ── Payment form ── */
  showPaymentModal = false;
  cinSearch = '';
  clientResults: any[] = [];
  selectedClient: any = null;
  nextInstallment: any = null;
  installmentLoading = false;
  installmentError = '';
  paymentLoading = false;
  paymentError = '';
  paymentSuccess = false;
  lastPayment: any = null;
  showReceiptPopup = false;
  recentPayments: any[] = [];

  /* ── History ── */
  agentHistory: any[] = [];
  historyLoading = false;
  historyError = '';
  histPage = 1;
  readonly histPageSize = 10;
  histFilter = '';

  private fmtDMY(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  get filteredHistory(): any[] {
    const q = this.histFilter.trim().toLowerCase();
    if (!q) return this.agentHistory;
    return this.agentHistory.filter(p => {
      const name     = (p.clientFirstName + ' ' + p.clientLastName).toLowerCase();
      const contract = (p.numeroContrat || '').toLowerCase();
      const ref      = '#' + p.id;
      const payDate  = this.fmtDMY(p.paymentDate);
      const dueDate  = this.fmtDMY(p.dueDate);
      return name.includes(q) || contract.includes(q) || ref.includes(q)
          || payDate.includes(q) || dueDate.includes(q);
    });
  }

  get histTotalPages(): number {
    return Math.ceil(this.filteredHistory.length / this.histPageSize) || 1;
  }

  get histPagesList(): number[] {
    const pages: number[] = [];
    for (let i = Math.max(1, this.histPage - 2); i <= Math.min(this.histTotalPages, this.histPage + 2); i++) {
      pages.push(i);
    }
    return pages;
  }

  get pagedHistory(): any[] {
    const start = (this.histPage - 1) * this.histPageSize;
    return this.filteredHistory.slice(start, start + this.histPageSize);
  }

  goHistPage(n: number): void {
    if (n >= 1 && n <= this.histTotalPages) this.histPage = n;
  }

  get histTotalCollected(): number {
    return this.agentHistory.reduce((s, p) => s + Number(p.amountPaid ?? 0), 0);
  }

  get histWithPenalty(): number {
    return this.agentHistory.filter(p => p.penaltyAmount).length;
  }

  exportHistPdf(): void {
    const list = this.filteredHistory;
    if (!list.length) return;
    const today = new Date().toLocaleDateString('fr-FR');
    const rows = list.map((p: any) => {
      const base = (p.baseInstallmentAmount ?? p.amountPaid ?? 0).toFixed(2);
      const pen  = p.penaltyAmount ? '+' + Number(p.penaltyAmount).toFixed(2) : '—';
      const tot  = Number(p.amountPaid ?? 0).toFixed(2);
      const due  = p.dueDate ? new Date(p.dueDate).toLocaleDateString('fr-FR') : '—';
      const pay  = p.paymentDate ? new Date(p.paymentDate).toLocaleString('fr-FR') : '—';
      return `<tr>
        <td>#${p.id}</td>
        <td>${p.clientFirstName ?? ''} ${p.clientLastName ?? ''}</td>
        <td>${p.numeroContrat ?? '—'}</td>
        <td style="text-align:center">#${p.installmentNumber}</td>
        <td>${base} TND</td>
        <td style="color:${p.penaltyAmount ? '#ef4444' : '#94a3b8'}">${pen}${p.penaltyAmount ? ' TND' : ''}</td>
        <td style="font-weight:700">${tot} TND</td>
        <td>${due}</td>
        <td>${pay}</td>
        <td style="color:#16a34a;font-weight:700">PAID</td>
      </tr>`;
    }).join('');
    const total = this.histTotalCollected.toFixed(2);
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>Transactions — ${today}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,sans-serif;padding:32px;color:#0f172a;font-size:12px}
h1{font-size:20px;font-weight:800;margin-bottom:4px}
.sub{color:#64748b;font-size:12px;margin-bottom:18px}
.summary{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 18px;margin-bottom:20px;display:flex;gap:32px}
.summary div{font-size:12px}.summary b{display:block;font-size:17px;color:#0f172a;margin-top:2px}
table{width:100%;border-collapse:collapse}
th{background:#f1f5f9;padding:8px;text-align:left;font-weight:700;border-bottom:2px solid #cbd5e1;font-size:11px}
td{padding:7px 8px;border-bottom:1px solid #f1f5f9}
tr:nth-child(even) td{background:#fafafa}
</style></head><body>
<h1>Transactions History</h1>
<div class="sub">Generated ${today} · ${list.length} transaction(s)</div>
<div class="summary">
  <div>Total transactions<b>${list.length}</b></div>
  <div>Total collected<b style="color:#16a34a">${total} TND</b></div>
  <div>With penalties<b style="color:#ef4444">${this.histWithPenalty}</b></div>
</div>
<table><thead><tr>
  <th>Ref</th><th>Client</th><th>Contract</th><th>Installment</th>
  <th>Base</th><th>Penalty</th><th>Total Paid</th><th>Due Date</th><th>Payment Date</th><th>Status</th>
</tr></thead><tbody>${rows}</tbody></table>
</body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  /* ── Agent IMF Vehicles ── */
  agentVehicleLoading = false;
  agentVehicleActionLoading = false;
  agentVehicleError = '';
  agentVehicles: VehicleDto[] = [];
  agentReservations: VehicleReservationDto[] = [];
  selectedVehicle: VehicleDto | null = null;
  selectedVehicleReservations: VehicleReservationDto[] = [];
  readonly reservationTimelineSteps: Array<{ label: string; status: ReservationStatus }> = [
    { label: 'Pending', status: 'PENDING_ADMIN_APPROVAL' },
    { label: 'Under Review', status: 'UNDER_REVIEW' },
    { label: 'Waiting Client', status: 'WAITING_CUSTOMER_ACTION' },
    { label: 'Approved', status: 'APPROVED' },
  ];
  vehicleQuery: VehicleSearchQuery = {
    q: '',
    marque: '',
    modele: '',
    status: undefined,
    reservationStatus: undefined,
    sort: 'created_desc',
  };
  /* ── Grace Period Requests ── */
  graceRequests: any[] = [];
  graceRequestsLoading = false;
  graceFilterStatus = '';
  graceActionLoading: number | null = null;
  graceDetailRequest: any = null;
  gracePage = 1;
  readonly gracePageSize = 8;

  /* ── AI Decision Modal (grace period) ── */
  agentDecisionModalOpen = false;
  agentDecisionRequest: any = null;
  agentDecisionMlLoading = false;
  agentDecisionMlResult: any = null;
  agentDecisionMlError: string | null = null;
  agentDecisionRejectReason = '';
  agentDecisionLoading = false;
  agentDecisionError: string | null = null;

  // ── Dossiers de délinquance (agent) ──
  dossiers: DelinquencyCaseDto[] = [];
  dossiersLoading = false;
  dossiersError = '';
  selectedDossier: DelinquencyCaseDto | null = null;
  dossierActions: RecoveryActionDto[] = [];
  dossierActionsLoading = false;

  // Paiement en agence
  registeringCashPayment = false;
  cashPaymentSuccess = false;

  // Formulaire action de recouvrement
  showActionForm = false;
  actionForm: CreateRecoveryActionDto = {
    delinquencyCaseId: 0, actionType: '', result: '', description: '',
    nextActionNote: '', nextActionDate: '',
  };
  savingAction = false;
  actionFormError = '';

  readonly actionTypeOptions = [
    'PHONE_CALL','SMS','EMAIL','HOME_VISIT','WORK_VISIT',
    'DEMAND_LETTER','NEGOTIATION','PAYMENT_PLAN',
    'VEHICLE_LOCATION','VEHICLE_SEIZURE','LEGAL_ACTION',
  ];
  readonly resultOptions = [
    'CONTACTED','NOT_CONTACTED','PROMISE_MADE','PAYMENT_RECEIVED',
    'REFUSED','NO_ANSWER','WRONG_ADDRESS','VEHICLE_FOUND','NEGOTIATED','ESCALATED',
  ];

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private vehicleService: VehicleService,
    private reservationService: ReservationService,
    private notificationService: NotificationService,
    private delinquencyService: DelinquencyService,
    private ngZone: NgZone,
    private riskScoreService: RiskScoreService,
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('finix_theme') as 'light' | 'dark' | null;
    this.currentTheme = saved || 'dark';
    this.applyTheme();
    this.loadAgentProfile();
    if (this.selectedPage === 'dossiers') this.loadDossiers();
    this.loadUnreadCount();
    this.loadNotifications(true);
    this.notifRefreshSub = this.notificationService.refreshTrigger.subscribe(() => {
      this.loadUnreadCount();
      if (this.notifDropdownOpen) this.loadNotifications();
    });

    this.currentTime = this.formatTime();
    this.ngZone.runOutsideAngular(() => {
      this.clockInterval = setInterval(() => {
        const t = this.formatTime();
        if (t !== this.currentTime) {
          this.currentTime = t;
          this.cdr.detectChanges();
        }
      }, 1000);
    });
  }

  private loadAgentProfile(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const fullName: string = user.name || user.firstName || '';
    const parts = fullName.trim().split(' ');
    this.agentFirstName = parts[0] || 'Agent';
    this.agentLastName  = parts.slice(1).join(' ');
    this.agentInitials  = ((this.agentFirstName[0] || '') + (this.agentLastName[0] || '')).toUpperCase() || 'AG';
    this.agentRole      = user.role ? (user.role as string).replace(/_/g, ' ') : 'Agent IMF';
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
    clearInterval(this.clockInterval);
    this.notifRefreshSub?.unsubscribe?.();
    this.stopNotifDropdownPolling();
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('finix_theme', this.currentTheme);
    this.applyTheme();
  }

  switchPage(page: string): void {
    this.selectedPage = page;
    this.loadUnreadCount();
    if (this.notifDropdownOpen) this.loadNotifications();
    if (page === 'remboursements') this.loadAgentHistory();
    if (page === 'vehicules') this.loadAgentVehiclesPage();
    if (page === 'grace-requests') this.loadGraceRequests();
    if (page === 'delinquency') this.loadDossiers();
  }

  private currentModuleFilter(): NotificationModuleApi | undefined {
    return this.selectedPage === 'vehicules' ? 'VEHICLE' : undefined;
  }

  toggleNotifDropdown(): void {
    this.notifDropdownOpen = !this.notifDropdownOpen;
    if (this.notifDropdownOpen) {
      this.loadNotifications();
      this.loadUnreadCount();
      this.startNotifDropdownPolling();
      return;
    }
    this.stopNotifDropdownPolling();
  }

  closeNotifDropdown(): void {
    this.notifDropdownOpen = false;
    this.stopNotifDropdownPolling();
  }

  private startNotifDropdownPolling(): void {
    this.stopNotifDropdownPolling();
    this.notifDropdownPollingId = setInterval(() => {
      if (!this.notifDropdownOpen) return;
      this.loadNotifications();
      this.loadUnreadCount();
    }, 10000);
  }

  private stopNotifDropdownPolling(): void {
    if (this.notifDropdownPollingId) {
      clearInterval(this.notifDropdownPollingId);
      this.notifDropdownPollingId = null;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.notifDropdownOpen) return;
    const target = event.target as HTMLElement | null;
    if (!target?.closest('.cfm-notif-wrap')) this.closeNotifDropdown();
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount(this.currentModuleFilter()).subscribe({
      next: (count) => (this.unreadCount = count),
      error: () => (this.unreadCount = 0),
    });
  }

  loadNotifications(silent = false): void {
    if (!silent) this.notificationsLoading = true;
    this.notificationService.getNotifications(this.currentModuleFilter()).subscribe({
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

  markAllNotificationsRead(): void {
    this.notificationService.markAllAsRead(this.currentModuleFilter()).subscribe({
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
    this.routeForNotification(n);
    this.closeNotifDropdown();
  }

  private routeForNotification(n: AppNotificationDto): void {
    if (n.module === 'VEHICLE') {
      if (n.relatedEntityType === 'VEHICLE_RESERVATION' && n.relatedEntityId != null) {
        this.pendingNotificationReservationId = n.relatedEntityId;
        this.pendingNotificationVehicleId = null;
      } else if (n.relatedEntityId != null) {
        this.pendingNotificationVehicleId = n.relatedEntityId;
        this.pendingNotificationReservationId = null;
      }
      this.switchPage('vehicules');
      return;
    }
    this.switchPage('dashboard');
  }

  notificationCategoryLabel(category: NotificationCategoryApi): string {
    const labels: Record<string, string> = {
      VEHICLE_SUBMITTED: 'New request',
      VEHICLE_APPROVED: 'Approved',
      VEHICLE_REJECTED: 'Rejected',
      UPCOMING_DUE_DATE: 'Due date',
      OVERDUE_PAYMENT: 'Overdue',
      PAYMENT_RECEIVED: 'Payment',
      RISK_ALERT: 'Risk',
      RESERVATION_PENDING_ADMIN: 'Reservation (admin)',
      RESERVATION_CONFIRMED_CLIENT: 'Client request',
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

  // ── Dossiers de délinquance ──────────────────────────────────────────

  loadDossiers(): void {
    this.dossiersLoading = true;
    this.dossiersError = '';
    this.selectedDossier = null;

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const agentId = user.userId;
    if (!agentId) {
      this.dossiersError = 'Impossible de récupérer l\'identifiant de l\'agent.';
      this.dossiersLoading = false;
      return;
    }

    this.delinquencyService.getCasesByAgent(agentId).subscribe({
      next: (data) => {
        this.dossiers = data;
        this.dossiersLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.dossiersError = 'Erreur de chargement des dossiers.';
        this.dossiersLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  openDossier(dossier: DelinquencyCaseDto): void {
    this.selectedDossier = dossier;
    this.showActionForm = false;
    this.dossierActionsLoading = true;
    this.delinquencyService.getActionsByCase(dossier.id).subscribe({
      next: (actions) => {
        this.dossierActions = actions;
        this.dossierActionsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.dossierActionsLoading = false; }
    });
  }

  backToDossierList(): void {
    this.selectedDossier = null;
    this.showActionForm = false;
    this.cashPaymentSuccess = false;
  }

  /** Enregistre un paiement effectué par le client en agence */
  registerCashPayment(): void {
    if (!this.selectedDossier || this.registeringCashPayment) return;
    this.registeringCashPayment = true;
    this.cashPaymentSuccess = false;
    this.delinquencyService.payByAgent(this.selectedDossier.id).subscribe({
      next: (updated) => {
        this.selectedDossier = updated;
        const idx = this.dossiers.findIndex(d => d.id === updated.id);
        if (idx !== -1) this.dossiers[idx] = updated;
        this.registeringCashPayment = false;
        this.cashPaymentSuccess = true;
        this.cdr.detectChanges();
        setTimeout(() => { this.cashPaymentSuccess = false; this.cdr.detectChanges(); }, 4000);
      },
      error: () => { this.registeringCashPayment = false; this.cdr.detectChanges(); }
    });
  }

  openActionForm(): void {
    this.actionForm = {
      delinquencyCaseId: this.selectedDossier!.id,
      actionType: '', result: '', description: '',
      nextActionNote: '', nextActionDate: '',
    };
    this.actionFormError = '';
    this.showActionForm = true;
  }

  submitAction(): void {
    if (!this.actionForm.actionType || !this.actionForm.result || !this.actionForm.description) {
      this.actionFormError = 'Type, résultat et description sont obligatoires.';
      return;
    }
    this.savingAction = true;
    this.delinquencyService.createAction(this.actionForm).subscribe({
      next: (action) => {
        this.dossierActions.unshift(action);
        this.showActionForm = false;
        this.savingAction = false;
        // Rafraîchir le dossier (statut peut avoir changé NEW→CONTACTED)
        this.delinquencyService.getCaseById(this.selectedDossier!.id).subscribe({
          next: (updated) => { this.selectedDossier = updated; this.cdr.detectChanges(); }
        });
      },
      error: () => { this.actionFormError = 'Erreur enregistrement.'; this.savingAction = false; }
    });
  }

  // Helpers affichage dossiers
  dossierRiskClass(risk: string): string {
    const map: Record<string, string> = {
      LOW: 'text-green-600', MODERATE: 'text-amber-600',
      HIGH: 'text-orange-600', CRITICAL: 'text-red-600',
    };
    return map[risk] ?? 'text-gray-500';
  }

  dossierRiskBg(risk: string): string {
    const map: Record<string, string> = {
      LOW: 'bg-green-50', MODERATE: 'bg-amber-50',
      HIGH: 'bg-orange-50', CRITICAL: 'bg-red-50',
    };
    return map[risk] ?? 'bg-gray-50';
  }

  dossierStatusLabel(status: string): string {
    const map: Record<string, string> = {
      NEW: 'Nouveau', CONTACTED: 'Contacté', IN_PROGRESS: 'En cours',
      PLAN_ACTIVE: 'Plan actif', RECOVERED: 'Récupéré', CLOSED: 'Clôturé',
    };
    return map[status] ?? status;
  }

  actionIconName(type: string): string {
    const map: Record<string, string> = {
      PHONE_CALL: 'call', SMS: 'sms', EMAIL: 'mail',
      HOME_VISIT: 'home', WORK_VISIT: 'business',
      DEMAND_LETTER: 'description', NEGOTIATION: 'handshake',
      PAYMENT_PLAN: 'event_available', VEHICLE_LOCATION: 'location_on',
      VEHICLE_SEIZURE: 'gavel', LEGAL_ACTION: 'account_balance',
    };
    return map[type] ?? 'task';
  }

  countByRisk(risk: string): number {
    return this.dossiers.filter(d => d.riskLevel === risk).length;
  }

  actionResultClass(result: string): string {
    const map: Record<string, string> = {
      PAYMENT_RECEIVED: 'text-green-600', PROMISE_MADE: 'text-blue-600',
      CONTACTED: 'text-teal-600', REFUSED: 'text-red-600',
      NO_ANSWER: 'text-gray-400', NOT_CONTACTED: 'text-gray-400',
      ESCALATED: 'text-orange-600',
    };
    return map[result] ?? 'text-gray-500';
  }

  loadAgentHistory(): void {
    this.historyLoading = true;
    this.historyError = '';
    this.http.get<any[]>(`${this.API}/payment-history/agent-transactions`).pipe(
      finalize(() => {
        this.historyLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        console.log('[History] response:', res);
        this.agentHistory = Array.isArray(res) ? res : [];
      },
      error: (err) => {
        console.error('[History] error:', err?.status, err?.error);
        this.agentHistory = [];
        this.historyError =
          'Erreur ' +
          (err?.status || '') +
          ' — ' +
          (err?.error?.message || err?.message || "impossible de charger l'historique");
      },
    });
  }

  loadAgentVehiclesPage(): void {
    this.agentVehicleLoading = true;
    this.agentVehicleError = '';

    forkJoin({
      vehicles: this.vehicleService.getAgentVehicles(this.vehicleQuery),
      reservations: this.reservationService.getAgentReservations(
        this.vehicleQuery.reservationStatus ? { status: this.vehicleQuery.reservationStatus } : undefined
      ),
    })
      .pipe(
        finalize(() => {
          this.agentVehicleLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: ({ vehicles, reservations }) => {
          this.agentVehicles = Array.isArray(vehicles) ? vehicles : [];
          this.agentReservations = Array.isArray(reservations) ? reservations : [];
          if (this.pendingNotificationReservationId) {
            const res = this.agentReservations.find((row) => row.id === this.pendingNotificationReservationId);
            if (res) {
              const veh = this.agentVehicles.find((v) => v.id === res.vehicleId) || null;
              this.selectVehicle(veh);
            }
            this.pendingNotificationReservationId = null;
          } else if (this.pendingNotificationVehicleId) {
            const focused = this.agentVehicles.find((v) => v.id === this.pendingNotificationVehicleId) || null;
            this.selectVehicle(focused);
            this.pendingNotificationVehicleId = null;
          }
          if (this.selectedVehicle) {
            const refreshed = this.agentVehicles.find((v) => v.id === this.selectedVehicle!.id) || null;
            this.selectVehicle(refreshed);
          }
        },
        error: (err) => {
          this.agentVehicles = [];
          this.agentReservations = [];
          this.selectedVehicle = null;
          this.selectedVehicleReservations = [];
          this.agentVehicleError =
            err?.error?.message || 'Erreur lors du chargement des véhicules opérationnels.';
        },
      });
  }

  onVehicleFilterChange(): void {
    this.loadAgentVehiclesPage();
  }

  clearVehicleFilters(): void {
    this.vehicleQuery = {
      q: '',
      marque: '',
      modele: '',
      status: undefined,
      reservationStatus: undefined,
      sort: 'created_desc',
    };
    this.loadAgentVehiclesPage();
  }

  vehicleReservations(vehicleId: number): VehicleReservationDto[] {
    return this.agentReservations
      .filter((r) => r.vehicleId === vehicleId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  latestReservation(vehicleId: number): VehicleReservationDto | null {
    const rows = this.vehicleReservations(vehicleId);
    return rows.length > 0 ? rows[0] : null;
  }

  selectVehicle(vehicle: VehicleDto | null): void {
    this.selectedVehicle = vehicle;
    if (!vehicle) {
      this.selectedVehicleReservations = [];
      return;
    }
    this.selectedVehicleReservations = this.vehicleReservations(vehicle.id);
  }

  markReservationUnderReview(id: number): void {
    this.agentVehicleActionLoading = true;
    this.agentVehicleError = '';
    this.reservationService
      .setUnderReview(id)
      .pipe(finalize(() => (this.agentVehicleActionLoading = false)))
      .subscribe({
        next: () => this.loadAgentVehiclesPage(),
        error: (err) => {
          this.agentVehicleError = err?.error?.message || 'Impossible de passer la réservation en examen.';
        },
      });
  }

  markReservationWaitingCustomerAction(id: number): void {
    this.agentVehicleActionLoading = true;
    this.agentVehicleError = '';
    this.reservationService
      .setWaitingCustomer(id)
      .pipe(finalize(() => (this.agentVehicleActionLoading = false)))
      .subscribe({
        next: () => this.loadAgentVehiclesPage(),
        error: (err) => {
          this.agentVehicleError =
            err?.error?.message || 'Impossible de passer la réservation en attente action client.';
        },
      });
  }

  vehicleStatusLabel(status: VehicleStatus): string {
    if (status === 'DISPONIBLE') return 'Disponible';
    if (status === 'RESERVE') return 'Réservé';
    if (status === 'VENDU') return 'Vendu';
    if (status === 'INACTIF') return 'Inactif';
    return status;
  }

  reservationStatusLabel(status: ReservationStatus): string {
    if (status === 'PENDING_ADMIN_APPROVAL') return 'En attente admin';
    if (status === 'UNDER_REVIEW') return 'En examen';
    if (status === 'WAITING_CUSTOMER_ACTION') return 'Action client';
    if (status === 'APPROVED') return 'Approuvée';
    if (status === 'REJECTED') return 'Refusée';
    if (status === 'CANCELLED_BY_CLIENT') return 'Annulée client';
    if (status === 'CANCELLED_BY_ADMIN') return 'Annulée admin';
    if (status === 'EXPIRED') return 'Expirée';
    return status;
  }

  reservationStatusClass(status: ReservationStatus): string {
    if (status === 'PENDING_ADMIN_APPROVAL') return 'status-pending';
    if (status === 'UNDER_REVIEW') return 'status-review';
    if (status === 'WAITING_CUSTOMER_ACTION') return 'status-waiting';
    if (status === 'APPROVED') return 'status-approved';
    if (status === 'REJECTED') return 'status-rejected';
    if (status === 'CANCELLED_BY_CLIENT' || status === 'CANCELLED_BY_ADMIN') return 'status-cancelled';
    if (status === 'EXPIRED') return 'status-expired';
    return 'status-default';
  }

  isFlowStatus(status: ReservationStatus): boolean {
    return this.reservationTimelineSteps.some((step) => step.status === status);
  }

  isTimelineStepReached(currentStatus: ReservationStatus, stepStatus: ReservationStatus): boolean {
    const currentIndex = this.reservationTimelineSteps.findIndex((s) => s.status === currentStatus);
    const stepIndex = this.reservationTimelineSteps.findIndex((s) => s.status === stepStatus);
    if (currentIndex < 0 || stepIndex < 0) return false;
    return currentIndex >= stepIndex;
  }

  isTimelineStepActive(currentStatus: ReservationStatus, stepStatus: ReservationStatus): boolean {
    return currentStatus === stepStatus;
  }

  canMarkUnderReview(status: ReservationStatus): boolean {
    return status === 'PENDING_ADMIN_APPROVAL' || status === 'WAITING_CUSTOMER_ACTION';
  }

  canMarkWaitingCustomerAction(status: ReservationStatus): boolean {
    return status === 'UNDER_REVIEW';
  }

  canAgentEdit(status: ReservationStatus): boolean {
    return (
      status === 'PENDING_ADMIN_APPROVAL' ||
      status === 'UNDER_REVIEW' ||
      status === 'WAITING_CUSTOMER_ACTION'
    );
  }

  get vehiclePendingCount(): number {
    return this.agentReservations.filter((r) => r.status === 'PENDING_ADMIN_APPROVAL').length;
  }

  get vehicleUnderReviewCount(): number {
    return this.agentReservations.filter((r) => r.status === 'UNDER_REVIEW').length;
  }

  get vehicleWaitingCustomerCount(): number {
    return this.agentReservations.filter((r) => r.status === 'WAITING_CUSTOMER_ACTION').length;
  }

  logout(): void {
    this.auth.logout();
  }

  private applyTheme(): void {
    this.renderer.setAttribute(document.documentElement, 'data-theme', this.currentTheme);
  }

  private formatTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  navItems = [
  { page: 'dashboard', label: 'Overview', section: 'MAIN', icon: 'grid' },

  { page: 'flux', label: 'Cash Flow', section: 'OPERATIONS', icon: 'trending-up', badge: '5' },

  {
    page: 'dossiers',
    label: 'Loan Applications',
    section: 'OPERATIONS',
    icon: 'folder',
    badge: '12',
  },

  { page: 'remboursements', label: 'Repayments', section: 'OPERATIONS', icon: 'TND' },
  { page: 'delinquency', label: 'Delinquency Cases', section: 'OPERATIONS', icon: 'warning' },
  { page: 'grace-requests', label: 'Grace Requests', section: 'OPERATIONS', icon: 'clock' },

  { page: 'clients', label: 'Clients', section: 'OPERATIONS', icon: 'users' },

  { page: 'vehicules', label: 'Vehicles', section: 'OPERATIONS', icon: 'truck' },

  { page: 'risque', label: 'Risk & Scoring', section: 'ANALYSIS', icon: 'alert-triangle' },

  { page: 'rapports', label: 'Reports', section: 'ANALYSIS', icon: 'file-text' },

  { page: 'assurances', label: 'Insurance', section: 'ANALYSIS', icon: 'shield' },

  {
    page: 'alertes',
    label: 'Alerts',
    section: 'SYSTEM',
    icon: 'bell',
    badge: '3',
    badgeType: 'danger',
  },

  { page: 'parametres', label: 'Settings', section: 'SYSTEM', icon: 'settings' },
];
  get navSections(): string[] {
    const seen = new Set<string>();
    return this.navItems
      .filter((i) => {
        if (seen.has(i.section)) return false;
        seen.add(i.section);
        return true;
      })
      .map((i) => i.section);
  }

  navBySection(section: string) {
    return this.navItems.filter((i) => i.section === section);
  }

  /* ── Agent IMF Payment ── */
  onCinInput(event: Event): void {
    this.cinSearch = (event.target as HTMLInputElement).value;
    this.searchByCin();
  }

  searchByCin(): void {
    const q = this.cinSearch.trim();
    if (q.length < 1) { this.clientResults = []; return; }
    this.installmentError = '';
    this.http.get<any[]>(`${this.API}/users/search?q=${encodeURIComponent(q)}`).subscribe({
      next: (res) => {
        this.clientResults = res;
        // Auto-select when exactly one result matches the typed CIN exactly
        if (res.length === 1 && res[0].cin?.toString().toLowerCase() === q.toLowerCase()) {
          this.selectClient(res[0]);
        }
      },
      error: () => { this.clientResults = []; this.installmentError = 'Erreur lors de la recherche.'; },
    });
  }

  selectClient(c: any): void {
    this.selectedClient = c;
    this.clientResults = [];
    this.cinSearch = '';
    this.paymentSuccess = false;
    this.paymentError = '';
    this.installmentError = '';
    this.nextInstallment = null;
    this.installmentLoading = true;

    this.http.get<any>(`${this.API}/payment-history/next-installment/by-user/${c.id}`).pipe(
      finalize(() => {
        this.installmentLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        this.nextInstallment = res;
      },
      error: (err) => {
        console.error('Next installment error:', err?.status, err?.error);
        this.installmentError = err?.error?.error || err?.error?.message || 'Aucune mensualité en attente pour ce client.';
      },
    });
  }

  resetPaymentForm(): void {
    this.cinSearch = '';
    this.clientResults = [];
    this.selectedClient = null;
    this.nextInstallment = null;
    this.installmentLoading = false;
    this.installmentError = '';
    this.paymentError = '';
    this.paymentSuccess = false;
    this.lastPayment = null;
    this.showReceiptPopup = false;
  }

  closePopup(): void {
    this.showReceiptPopup = false;
  }

  printReceipt(): void {
    const p = this.lastPayment;
    const client = this.selectedClient;
    const html = `
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8"/>
      <title>Reçu de paiement</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; max-width: 420px; margin: auto; color: #111; }
        .logo { font-size: 1.5rem; font-weight: 900; color: #2563eb; margin-bottom: 4px; }
        .sub  { font-size: .8rem; color: #666; margin-bottom: 24px; }
        h2 { font-size: 1rem; color: #059669; margin: 0 0 20px; border-bottom: 2px solid #059669; padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; font-size: .88rem; }
        td { padding: 7px 4px; border-bottom: 1px solid #eee; }
        td:first-child { color: #555; }
        td:last-child  { text-align: right; font-weight: 600; }
        .amount td:last-child { font-size: 1.1rem; color: #059669; font-weight: 800; }
        .footer { margin-top: 28px; font-size: .75rem; color: #999; text-align: center; }
      </style></head><body>
      <div class="logo">FIN'IX</div>
      <div class="sub">Institution de Microfinance — Reçu Officiel</div>
      <h2>✓ Paiement confirmé</h2>
      <table>
        <tr><td>Référence</td><td>#${p.id}</td></tr>
        <tr><td>Client</td><td>${client?.firstName || ''} ${client?.lastName || ''}</td></tr>
        <tr><td>CIN</td><td>${client?.cin || '—'}</td></tr>
        <tr><td>Contrat</td><td>${p.numeroContrat}</td></tr>
        <tr><td>Mensualité N°</td><td>${p.installmentNumber}</td></tr>
        <tr><td>Échéance</td><td>${p.dueDate}</td></tr>
        <tr class="amount"><td>Montant payé</td><td>${Number(p.amountPaid).toLocaleString('fr-TN', {minimumFractionDigits:2})} TND</td></tr>
        <tr><td>Méthode</td><td>Cash Agent</td></tr>
        <tr><td>Date</td><td>${new Date(p.paymentDate).toLocaleString('fr-FR')}</td></tr>
      </table>
      <div class="footer">Document généré automatiquement par FIN'IX — ${new Date().toLocaleDateString('fr-FR')}</div>
      </body></html>`;
    const w = window.open('', '_blank', 'width=500,height=700');
    if (w) { w.document.write(html); w.document.close(); w.focus(); w.print(); }
  }

  submitAgentPayment(): void {
    console.log('[Agent] submitAgentPayment called, selectedClient=', this.selectedClient);
    if (!this.selectedClient) {
      console.warn('[Agent] No client selected, aborting');
      return;
    }
    this.paymentLoading = true;
    this.paymentError = '';
    this.paymentSuccess = false;

    const url = `${this.API}/payment-history/record-agent`;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const body = { userId: this.selectedClient.id, agentId: currentUser.userId || null };
    console.log('[Agent] POST', url, body);

    this.http.post<any>(url, body).pipe(
      finalize(() => {
        this.paymentLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        console.log('[Agent] Payment success:', res);
        this.paymentSuccess = true;
        this.lastPayment = res;
        this.recentPayments = [res, ...this.recentPayments].slice(0, 10);
        this.nextInstallment = null;
        this.showReceiptPopup = true;
        this.loadAgentHistory();
      },
      error: (err) => {
        console.error('[Agent] Payment error:', err?.status, err?.error);
        this.paymentError = err?.error?.error || err?.message || 'Erreur lors de l\'enregistrement du paiement.';
      },
    });
  }

  tickerItems = [
    {
      ref: '#CR-2025-844',
      client: 'S. Bouaziz',
      amount: '-32 000 TND',
      type: 'CRÉDIT',
      typeClass: 'credit',
    },
    {
      ref: '#VIR-0392',
      client: 'R. Khelifi',
      amount: '+750 TND',
      type: 'REMB.',
      typeClass: 'remb',
    },
    {
      ref: '#CR-2025-841',
      client: 'K. Mansour',
      amount: '+4 800 TND',
      type: 'REMB.',
      typeClass: 'remb',
    },
    {
      ref: '#CR-2025-842',
      client: 'L. Chaari',
      amount: '-85 000 TND',
      type: 'CRÉDIT',
      typeClass: 'credit',
    },
  ];

  chartBars = [35, 42, 55, 48, 38, 52, 60, 45, 58, 72, 65, 85];
  chartMonths = [
    'Mar',
    'Avr',
    'Mai',
    'Jun',
    'Jul',
    'Aoû',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
    'Jan',
    'Fév',
    'Mar', 
    'Apr', 
    'May', 
    'Jun', 
    'Jul', 
    'Aug', 
    'Sep', 
    'Oct', 
    'Nov', 
    'Dec', 
    'Jan', 
    'Feb'  
  ];

  riskClients = [
    { initials: 'C', name: 'S. Hammami', detail: 'Auto · 24 000 TND', pct: 72, color: '#EF4444' },
    {
      initials: 'B',
      name: 'W. Ferchichi',
      detail: 'Immo. · 120 000 TND',
      pct: 48,
      color: '#F59E0B',
    },
    { initials: 'D', name: 'I. Oueslati', detail: 'Conso. · 8 500 TND', pct: 35, color: '#EF4444' },
  ];

  /* ── Grace Period Requests Methods ── */
  loadGraceRequests(): void {
    this.graceRequestsLoading = true;
    const url = this.graceFilterStatus
      ? `${this.API}/grace-period-requests/status/${this.graceFilterStatus}`
      : `${this.API}/grace-period-requests`;
    this.http.get<any[]>(url).pipe(
      finalize(() => { this.graceRequestsLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (res) => { this.graceRequests = Array.isArray(res) ? res : []; },
      error: () => { this.graceRequests = []; },
    });
  }

  onGraceFilterChange(status: string): void {
    this.graceFilterStatus = status;
    this.gracePage = 1;
    this.loadGraceRequests();
  }

  get graceTotalPages(): number {
    return Math.ceil(this.graceRequests.length / this.gracePageSize) || 1;
  }

  get gracePagesList(): number[] {
    const pages: number[] = [];
    for (let i = Math.max(1, this.gracePage - 2); i <= Math.min(this.graceTotalPages, this.gracePage + 2); i++) {
      pages.push(i);
    }
    return pages;
  }

  get pagedGraceRequests(): any[] {
    const start = (this.gracePage - 1) * this.gracePageSize;
    return this.graceRequests.slice(start, start + this.gracePageSize);
  }

  goGracePage(n: number): void {
    if (n >= 1 && n <= this.graceTotalPages) this.gracePage = n;
  }

  openGraceDetail(req: any): void {
    this.graceDetailRequest = req;
  }

  closeGraceDetail(): void {
    this.graceDetailRequest = null;
  }

  // ── AI Decision Modal ──────────────────────────────────────────────────

  openAgentDecisionModal(req: any): void {
    this.agentDecisionRequest = req;
    this.agentDecisionModalOpen = true;
    this.agentDecisionMlResult = null;
    this.agentDecisionMlError = null;
    this.agentDecisionError = null;
    this.agentDecisionRejectReason = '';
    this.riskScoreService.evaluate(req.clientId, req.loanContractId).subscribe({
      next: (res) => {
        this.agentDecisionMlResult = res;
        this.agentDecisionMlLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.agentDecisionMlError = err?.status === 0
          ? 'Backend inaccessible (port 8081).'
          : err?.status === 500
            ? 'Erreur serveur — vérifiez que l\'API ML Python tourne sur le port 8000.'
            : err?.error?.message || err?.message || 'Erreur inconnue';
        this.agentDecisionMlLoading = false;
        this.cdr.detectChanges();
      },
    });
    this.agentDecisionMlLoading = true;
  }

  closeAgentDecisionModal(): void {
    this.agentDecisionModalOpen = false;
    this.agentDecisionRequest = null;
    this.agentDecisionMlResult = null;
    this.agentDecisionMlError = null;
  }

  agentDecisionApprove(): void {
    if (!this.agentDecisionRequest) return;
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.agentDecisionLoading = true;
    this.agentDecisionError = null;
    this.http.put<any>(`${this.API}/grace-period-requests/${this.agentDecisionRequest.id}/approve`, {
      reviewedById: user.userId,
    }).pipe(
      finalize(() => { this.agentDecisionLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => { this.closeAgentDecisionModal(); this.loadGraceRequests(); },
      error: (err) => { this.agentDecisionError = err?.error?.message || 'Erreur lors de l\'approbation'; },
    });
  }

  agentDecisionReject(): void {
    if (!this.agentDecisionRequest) return;
    if (!this.agentDecisionRejectReason.trim()) {
      this.agentDecisionError = 'La raison du rejet est obligatoire.';
      return;
    }
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.agentDecisionLoading = true;
    this.agentDecisionError = null;
    this.http.put<any>(`${this.API}/grace-period-requests/${this.agentDecisionRequest.id}/reject`, {
      reviewedById: user.userId,
      rejectionReason: this.agentDecisionRejectReason,
    }).pipe(
      finalize(() => { this.agentDecisionLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => { this.closeAgentDecisionModal(); this.loadGraceRequests(); },
      error: (err) => { this.agentDecisionError = err?.error?.message || 'Erreur lors du rejet'; },
    });
  }

  agentRiskStyle(): Record<string, string> {
    if (!this.agentDecisionMlResult) return {};
    const map: Record<string, Record<string, string>> = {
      LOW:      { background: '#f0fdf4', color: '#15803d' },
      MODERATE: { background: '#fefce8', color: '#a16207' },
      HIGH:     { background: '#fff7ed', color: '#c2410c' },
      CRITICAL: { background: '#fef2f2', color: '#b91c1c' },
    };
    return map[this.agentDecisionMlResult.riskLevel] ?? { background: '#f9fafb', color: '#374151' };
  }

  agentSolvabilityStyle(): Record<string, string> {
    if (!this.agentDecisionMlResult) return {};
    return this.agentDecisionMlResult.solvability === 'SOLVABLE'
      ? { background: '#f0fdf4', color: '#15803d' }
      : { background: '#fef2f2', color: '#b91c1c' };
  }

  agentGraceStyle(): Record<string, string> {
    if (!this.agentDecisionMlResult) return {};
    return this.agentDecisionMlResult.graceRecommendation === 'APPROVE'
      ? { background: '#f0fdf4', color: '#15803d', 'border-color': '#86efac' }
      : { background: '#fef2f2', color: '#b91c1c', 'border-color': '#fca5a5' };
  }

  get pendingGraceCount(): number {
    return this.graceRequests.filter(r => r.status === 'PENDING').length;
  }

  get approvedGraceCount(): number {
    return this.graceRequests.filter(r => r.status === 'APPROVED').length;
  }

  get rejectedGraceCount(): number {
    return this.graceRequests.filter(r => r.status === 'REJECTED').length;
  }
}


