import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { DelinquencyService, DelinquencyCaseDto, RecoveryActionDto, CreateRecoveryActionDto } from '../../../services/delinquency/delinquency.service';

@Component({
  selector: 'app-repayment-backoffice',
  standalone: false,
  templateUrl: './repayment-backoffice.component.html',
  styleUrl: './repayment-backoffice.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class RepaymentBackofficeComponent implements OnInit, OnChanges {
  @Input() selectedPage = '';
  @Output() onNavigate = new EventEmitter<string>();

  private readonly API = 'http://localhost:8081/api';

  /* ── Admin payments ── */
  adminPayments: any[] = [];
  adminPaymentsLoading = false;

  /* ── KPI repayment (depuis backend /api/dashboard/kpi) ── */
  kpiCollectedThisMonth = 0;
  kpiUnpaidTotal = 0;
  kpiUnpaidCases = 0;
  kpiRecoveryRate = 0;
  kpiDefaultRate = 0;
  kpiContractsFollowed = 0;
  kpiDueThisMonth = 0;
  kpiNextDueDate: Date | null = null;

  statusOptions = ['PAID', 'PENDING', 'CANCELLED', 'DONE'];
  paymentFilter = '';
  paymentStatusFilter = '';
  paymentMethodFilter = '';
  paymentMonthFilter = '';

  /* ── Pagination payments admin ── */
  adminPayPage = 1;
  adminPayPageSize = 10;

  get filteredPayments(): any[] {
    let list = this.adminPayments;
    const q = this.paymentFilter.trim().toLowerCase();
    if (q) {
      list = list.filter((p: any) =>
        (p.clientFirstName + ' ' + p.clientLastName).toLowerCase().includes(q)
        || (p.clientCin || '').toLowerCase().includes(q)
        || (p.numeroContrat || '').toLowerCase().includes(q)
        || (p.agentFirstName + ' ' + p.agentLastName).toLowerCase().includes(q)
        || ('#' + p.id).includes(q)
      );
    }
    if (this.paymentStatusFilter) {
      list = list.filter((p: any) => p.paymentStatus === this.paymentStatusFilter);
    }
    if (this.paymentMethodFilter) {
      list = list.filter((p: any) => p.paymentMethod === this.paymentMethodFilter);
    }
    if (this.paymentMonthFilter) {
      list = list.filter((p: any) => {
        if (!p.paymentDate) return false;
        const d = new Date(p.paymentDate);
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return month === this.paymentMonthFilter;
      });
    }
    return list;
  }

  get adminPayTotalPages(): number {
    return Math.ceil(this.filteredPayments.length / this.adminPayPageSize) || 1;
  }

  get pagedPayments(): any[] {
    const start = (this.adminPayPage - 1) * this.adminPayPageSize;
    return this.filteredPayments.slice(start, start + this.adminPayPageSize);
  }

  get adminPayPages(): number[] {
    const total = this.adminPayTotalPages;
    const current = this.adminPayPage;
    const pages: number[] = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  }

  get kpiCurrentMonthLabel(): string {
    return new Date().toLocaleDateString('en-US', { month: 'long' });
  }

  goAdminPayPage(page: number): void {
    if (page >= 1 && page <= this.adminPayTotalPages) this.adminPayPage = page;
  }

  onAdminPayFilterChange(): void { this.adminPayPage = 1; }

  /* ── Grace Period Requests ── */
  graceRequests: any[] = [];
  graceRequestsLoading = false;
  graceFilterStatus = '';
  graceActionLoading: number | null = null;
  graceRejectId: number | null = null;
  graceRejectReason = '';
  graceDetailRequest: any = null;

  gracePage = 1;
  readonly gracePageSize = 8;

  get graceTotalPages(): number { return Math.ceil(this.graceRequests.length / this.gracePageSize) || 1; }
  get gracePagesList(): number[] { return Array.from({ length: this.graceTotalPages }, (_, i) => i + 1); }
  get pagedGraceRequests(): any[] {
    const start = (this.gracePage - 1) * this.gracePageSize;
    return this.graceRequests.slice(start, start + this.gracePageSize);
  }
  goGracePage(n: number): void { if (n >= 1 && n <= this.graceTotalPages) this.gracePage = n; }

  /* ── AI Decision Modal ── */
  decisionRequest: any = null;
  decisionMlResult: any = null;
  decisionMlLoading = false;
  decisionMlError: string | null = null;
  decisionRejectReason = '';
  decisionError: string | null = null;

  /* ── Analytics / Charts ── */
  chartYear = new Date().getFullYear();
  monthlyCollected: number[] = Array(12).fill(0);
  chartLoading = false;

  readonly MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  readonly PAYMENT_STATUS_COLORS: Record<string, string> = {
    PAID:      '#10B981', PENDING: '#F59E0B',
    CANCELLED: '#EF4444', DONE:    '#6366F1',
  };
  readonly INSTALLMENT_STATUS_COLORS: Record<string, string> = {
    PAID:    '#10B981', PENDING: '#F59E0B',
    OVERDUE: '#EF4444', WAIVED:  '#6366F1',
  };
  readonly GRACE_STATUS_COLORS: Record<string, string> = {
    PENDING:  '#F59E0B', APPROVED: '#10B981', REJECTED: '#EF4444',
  };

  paymentStatusSegments:     { label: string; value: number; color: string; path: string; percent: number }[] = [];
  installmentStatusSegments: { label: string; value: number; color: string; path: string; percent: number }[] = [];
  graceStatusSegments:       { label: string; value: number; color: string; path: string; percent: number }[] = [];

  get barMaxValue(): number { return Math.max(...this.monthlyCollected, 1); }
  get paymentStatusTotal(): number { return this.paymentStatusSegments.reduce((s, x) => s + x.value, 0); }
  get installmentStatusTotal(): number { return this.installmentStatusSegments.reduce((s, x) => s + x.value, 0); }
  get graceStatusTotal(): number { return this.graceStatusSegments.reduce((s, x) => s + x.value, 0); }
  get barChartBars() {
    return this.monthlyCollected.map((v, i) => ({
      x: i * 30 + 6,
      y: 140 - Math.round((v / this.barMaxValue) * 120),
      h: Math.round((v / this.barMaxValue) * 120),
      w: 22,
      label: this.MONTHS[i],
      amount: v,
      current: i === new Date().getMonth(),
    }));
  }

  loadChartData(): void {
    this.chartLoading = true;
    this.http.get<any>(`${this.API}/dashboard/charts`).pipe(
      finalize(() => { this.chartLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (d) => {
        this.monthlyCollected = Array.isArray(d.monthlyCollected) ? d.monthlyCollected : Array(12).fill(0);
        this.paymentStatusSegments     = this.buildDonut(d.paymentStatusBreakdown     || {}, this.PAYMENT_STATUS_COLORS);
        this.installmentStatusSegments = this.buildDonut(d.installmentStatusBreakdown || {}, this.INSTALLMENT_STATUS_COLORS);
        this.graceStatusSegments       = this.buildDonut(d.graceStatusBreakdown       || {}, this.GRACE_STATUS_COLORS);
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  private buildDonut(raw: Record<string, number>, colors: Record<string, string>) {
    const entries = Object.entries(raw).filter(([, v]) => v > 0);
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    const cx = 80, cy = 80, r = 65, ri = 44;
    let cumAngle = -Math.PI / 2;
    return entries.map(([label, value]) => {
      const sweep = (value / total) * 2 * Math.PI;
      const startA = cumAngle;
      cumAngle += sweep;
      const endA = cumAngle;
      const large = sweep > Math.PI ? 1 : 0;
      const x1 = cx + r  * Math.cos(startA), y1 = cy + r  * Math.sin(startA);
      const x2 = cx + r  * Math.cos(endA),   y2 = cy + r  * Math.sin(endA);
      const x3 = cx + ri * Math.cos(endA),   y3 = cy + ri * Math.sin(endA);
      const x4 = cx + ri * Math.cos(startA), y4 = cy + ri * Math.sin(startA);
      const path = `M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${x3} ${y3} A${ri} ${ri} 0 ${large} 0 ${x4} ${y4}Z`;
      return { label, value, color: colors[label] || '#94A3B8', path, percent: Math.round(value / total * 100) };
    });
  }

  /* ── Délinquance ── */
  allCases: DelinquencyCaseDto[] = [];
  filteredCases: DelinquencyCaseDto[] = [];
  casesLoading = false;
  casesError = '';
  caseFilterStatus = '';
  caseFilterRisk = '';
  caseFilterCategory = '';

  selectedCase: DelinquencyCaseDto | null = null;
  caseActions: RecoveryActionDto[] = [];
  caseActionsLoading = false;

  showCaseActionForm = false;
  caseActionForm: CreateRecoveryActionDto = { delinquencyCaseId: 0, actionType: '', result: '', description: '' };
  savingCaseAction = false;
  caseActionError = '';

  editingNote = false;
  editNoteValue = '';
  savingNote = false;

  showAssignModal = false;
  assignCaseId: number | null = null;
  assignAgentId: number | null = null;
  agentsList: any[] = [];

  showCloseModal = false;
  closeCaseId: number | null = null;
  closeReason = 'PAID';

  registeringCashPayment = false;
  cashPaymentSuccess = false;

  readonly caseActionTypes = ['PHONE_CALL','SMS','EMAIL','HOME_VISIT','WORK_VISIT','DEMAND_LETTER','NEGOTIATION','PAYMENT_PLAN','LEGAL_ACTION'];
  readonly caseResultOptions = ['CONTACTED','NOT_CONTACTED','PROMISE_MADE','PAYMENT_RECEIVED','REFUSED','NO_ANSWER','ESCALATED'];

  /* ── Admin Payment Form ── */
  showAdminPayModal = false;
  adminCinSearch = '';
  adminClientResults: any[] = [];
  adminSelectedClient: any = null;
  adminNextInstallment: any = null;
  adminInstLoading = false;
  adminInstError = '';
  adminPayLoading = false;
  adminPayError = '';
  adminPaySuccess = false;
  adminLastPayment: any = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private delinquencyService: DelinquencyService,
  ) {}

  ngOnInit(): void {
    this.loadAdminPayments();
    this.loadDelinquencyCases();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedPage'] && !changes['selectedPage'].firstChange) {
      const page = changes['selectedPage'].currentValue;
      if (page === 'repayments') {
        this.loadAdminPayments();
        this.loadDelinquencyCases();
      } else if (page === 'delinquency') {
        this.loadDelinquencyCases();
      } else if (page === 'grace-requests') {
        this.loadGraceRequests();
      } else if (page === 'analytics') {
        this.loadChartData();
      }
    }
  }

  /* ── Admin Payment Modal ── */
  openAdminPayModal(): void { this.showAdminPayModal = true; this.resetAdminPayForm(); }
  closeAdminPayModal(): void { this.showAdminPayModal = false; }

  resetAdminPayForm(): void {
    this.adminCinSearch = '';
    this.adminClientResults = [];
    this.adminSelectedClient = null;
    this.adminNextInstallment = null;
    this.adminInstLoading = false;
    this.adminInstError = '';
    this.adminPayError = '';
    this.adminPaySuccess = false;
    this.adminLastPayment = null;
  }

  onAdminCinInput(event: Event): void {
    this.adminCinSearch = (event.target as HTMLInputElement).value;
    this.searchAdminCin();
  }

  searchAdminCin(): void {
    const q = this.adminCinSearch.trim();
    if (q.length < 1) { this.adminClientResults = []; return; }
    this.adminInstError = '';
    this.http.get<any[]>(`${this.API}/users/search?q=${encodeURIComponent(q)}`).subscribe({
      next: (res) => {
        this.adminClientResults = res;
        if (res.length === 1 && res[0].cin?.toString().toLowerCase() === q.toLowerCase()) {
          this.selectAdminClient(res[0]);
        }
        this.cdr.detectChanges();
      },
      error: () => { this.adminClientResults = []; }
    });
  }

  selectAdminClient(c: any): void {
    this.adminSelectedClient = c;
    this.adminClientResults = [];
    this.adminCinSearch = '';
    this.adminPaySuccess = false;
    this.adminPayError = '';
    this.adminInstError = '';
    this.adminNextInstallment = null;
    this.adminInstLoading = true;
    this.http.get<any>(`${this.API}/payment-history/next-installment/by-user/${c.id}`).subscribe({
      next: (res) => { this.adminInstLoading = false; this.adminNextInstallment = res; this.cdr.detectChanges(); },
      error: (err) => {
        this.adminInstLoading = false;
        this.adminInstError = err?.error?.error || 'Aucune mensualité en attente pour ce client.';
        this.cdr.detectChanges();
      }
    });
  }

  submitAdminPayment(): void {
    if (!this.adminSelectedClient) return;
    this.adminPayLoading = true;
    this.adminPayError = '';
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const body = { userId: this.adminSelectedClient.id, adminId: currentUser.userId || null };
    this.http.post<any>(`${this.API}/payment-history/record-admin`, body).pipe(
      finalize(() => { this.adminPayLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (res) => {
        this.adminPaySuccess = true;
        this.adminLastPayment = res;
        this.adminNextInstallment = null;
        this.loadAdminPayments();
      },
      error: (err) => {
        this.adminPayError = err?.error?.error || err?.message || 'Erreur lors du paiement.';
      }
    });
  }

  /* ── Admin Payments API ── */
  loadAdminPayments(): void {
    this.adminPaymentsLoading = true;
    this.http.get<any[]>(`${this.API}/payment-history/admin/all`).pipe(
      finalize(() => { this.adminPaymentsLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (res) => { this.adminPayments = Array.isArray(res) ? res : []; },
      error: (err) => { console.error('[Admin] payments error:', err); this.adminPayments = []; },
    });
    this.loadRepaymentKpi();
  }

  loadRepaymentKpi(): void {
    this.http.get<any>(`${this.API}/dashboard/kpi`).subscribe({
      next: (kpi) => {
        this.kpiCollectedThisMonth = Number(kpi.collectedThisMonth ?? 0);
        this.kpiUnpaidTotal        = Number(kpi.totalOverdueAmount ?? 0);
        this.kpiUnpaidCases        = Number(kpi.openDelinquencyCases ?? 0);
        this.kpiRecoveryRate       = Number(kpi.recoveryRate ?? 0);
        this.kpiDefaultRate        = Number(kpi.defaultRate ?? 0);
        this.kpiContractsFollowed  = Number(kpi.activeContracts ?? 0);
        this.kpiDueThisMonth       = Number(kpi.dueThisMonth ?? 0);
        this.kpiNextDueDate        = kpi.nextDueDate ? new Date(kpi.nextDueDate) : null;
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  changePaymentStatus(paymentId: number, newStatus: string): void {
    this.http.put<any>(`${this.API}/payment-history/admin/${paymentId}/status`, { status: newStatus }).subscribe({
      next: (updated) => {
        const idx = this.adminPayments.findIndex((p: any) => p.id === paymentId);
        if (idx !== -1) this.adminPayments[idx] = updated;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('[Admin] status change error:', err),
    });
  }

  /* ── Grace Period Requests ── */
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

  approveGraceRequest(id: number): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.graceActionLoading = id;
    this.http.put<any>(`${this.API}/grace-period-requests/${id}/approve`, { reviewedById: user.userId }).pipe(
      finalize(() => { this.graceActionLoading = null; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => this.loadGraceRequests(),
      error: (err) => alert(err.error?.message || `Error ${err.status}: approving request`),
    });
  }

  openRejectModal(id: number): void { this.graceRejectId = id; this.graceRejectReason = ''; }

  confirmRejectGraceRequest(): void {
    if (this.graceRejectId === null) return;
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.graceActionLoading = this.graceRejectId;
    this.http.put<any>(`${this.API}/grace-period-requests/${this.graceRejectId}/reject`, {
      reviewedById: user.userId,
      rejectionReason: this.graceRejectReason
    }).pipe(
      finalize(() => { this.graceActionLoading = null; this.graceRejectId = null; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => this.loadGraceRequests(),
      error: (err) => alert(err.error?.message || `Error ${err.status}: rejecting request`),
    });
  }

  openGraceDetail(req: any): void { this.graceDetailRequest = req; }
  closeGraceDetail(): void { this.graceDetailRequest = null; }

  /* ── AI Decision modal ── */
  openDecisionModal(req: any): void {
    this.decisionRequest = req;
    this.decisionMlResult = null;
    this.decisionMlError = null;
    this.decisionError = null;
    this.decisionRejectReason = '';
    this.fetchDecisionMl(req);
  }

  closeDecisionModal(): void {
    this.decisionRequest = null;
    this.decisionMlResult = null;
    this.decisionMlError = null;
  }

  fetchDecisionMl(req: any): void {
    this.decisionMlLoading = true;
    const url = `${this.API}/risk/evaluate/client/${req.clientId}/contract/${req.loanContractId}`;
    this.http.get<any>(url).pipe(
      finalize(() => { this.decisionMlLoading = false; this.cdr.detectChanges(); })
    ).subscribe({
      next: (res) => { this.decisionMlResult = res; },
      error: (err) => {
        if (err?.status === 0) this.decisionMlError = 'Backend Spring inaccessible (port 8081).';
        else if (err?.status === 500) this.decisionMlError = 'Verifie que l\'API Python tourne sur localhost:8000.';
        else this.decisionMlError = err?.error?.message || 'Erreur lors de l\'analyse IA.';
      },
    });
  }

  decisionApprove(): void {
    if (!this.decisionRequest) return;
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.graceActionLoading = this.decisionRequest.id;
    this.decisionError = null;
    this.http.put<any>(`${this.API}/grace-period-requests/${this.decisionRequest.id}/approve`,
      { reviewedById: user.userId }).pipe(
      finalize(() => { this.graceActionLoading = null; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => { this.closeDecisionModal(); this.loadGraceRequests(); },
      error: (err) => { this.decisionError = err.error?.message || `Error ${err.status}: approving request`; },
    });
  }

  decisionReject(): void {
    if (!this.decisionRequest) return;
    if (!this.decisionRejectReason.trim()) {
      this.decisionError = 'Rejection reason is required';
      return;
    }
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.graceActionLoading = this.decisionRequest.id;
    this.decisionError = null;
    this.http.put<any>(`${this.API}/grace-period-requests/${this.decisionRequest.id}/reject`, {
      reviewedById: user.userId,
      rejectionReason: this.decisionRejectReason
    }).pipe(
      finalize(() => { this.graceActionLoading = null; this.cdr.detectChanges(); })
    ).subscribe({
      next: () => { this.closeDecisionModal(); this.loadGraceRequests(); },
      error: (err) => { this.decisionError = err.error?.message || `Error ${err.status}: rejecting request`; },
    });
  }

  decisionRiskClass(): string {
    if (!this.decisionMlResult) return '';
    switch (this.decisionMlResult.riskLevel) {
      case 'LOW':      return 'ai-low';
      case 'MODERATE': return 'ai-moderate';
      case 'HIGH':     return 'ai-high';
      case 'CRITICAL': return 'ai-critical';
      default:         return '';
    }
  }

  decisionSolvabilityClass(): string {
    if (!this.decisionMlResult) return '';
    return this.decisionMlResult.solvability === 'SOLVABLE' ? 'ai-solvable' : 'ai-non-solvable';
  }

  decisionGraceClass(): string {
    if (!this.decisionMlResult) return '';
    return this.decisionMlResult.graceRecommendation === 'APPROVE' ? 'ai-approve' : 'ai-reject';
  }

  get pendingGraceCount(): number { return this.graceRequests.filter((r: any) => r.status === 'PENDING').length; }
  get approvedGraceCount(): number { return this.graceRequests.filter((r: any) => r.status === 'APPROVED').length; }
  get rejectedGraceCount(): number { return this.graceRequests.filter((r: any) => r.status === 'REJECTED').length; }

  /* ── Délinquance ── */
  loadDelinquencyCases(): void {
    this.casesLoading = true;
    this.casesError = '';
    this.selectedCase = null;
    this.delinquencyService.getAllCases().subscribe({
      next: (data) => { this.allCases = data; this.applyDelinquencyFilters(); this.casesLoading = false; this.cdr.detectChanges(); },
      error: () => { this.casesError = 'Erreur de chargement des dossiers.'; this.casesLoading = false; this.cdr.detectChanges(); }
    });
  }

  applyDelinquencyFilters(): void {
    this.filteredCases = this.allCases.filter(c => {
      const ms = !this.caseFilterStatus   || c.status === this.caseFilterStatus;
      const mr = !this.caseFilterRisk     || c.riskLevel === this.caseFilterRisk;
      const mc = !this.caseFilterCategory || c.category === this.caseFilterCategory;
      return ms && mr && mc;
    });
  }

  openCaseDetail(dc: DelinquencyCaseDto): void {
    this.selectedCase = dc;
    this.showCaseActionForm = false;
    this.caseActionsLoading = true;
    this.delinquencyService.getActionsByCase(dc.id).subscribe({
      next: (a) => { this.caseActions = a; this.caseActionsLoading = false; this.cdr.detectChanges(); },
      error: () => { this.caseActionsLoading = false; }
    });
    this.loadAgentsList();
  }

  backToCaseList(): void { this.selectedCase = null; }

  loadAgentsList(): void {
    if (this.agentsList.length > 0) return;
    this.http.get<any[]>(`${this.API}/users`).subscribe({
      next: (users) => { this.agentsList = users.filter((u: any) => u.role === 'AGENT'); this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  openCaseActionForm(): void {
    this.caseActionForm = { delinquencyCaseId: this.selectedCase!.id, actionType: '', result: '', description: '' };
    this.caseActionError = '';
    this.showCaseActionForm = true;
  }

  submitCaseAction(): void {
    if (!this.caseActionForm.actionType || !this.caseActionForm.result || !this.caseActionForm.description) {
      this.caseActionError = 'Type, résultat et description sont obligatoires.'; return;
    }
    this.savingCaseAction = true;
    this.delinquencyService.createAction(this.caseActionForm).subscribe({
      next: (a) => {
        this.caseActions.unshift(a);
        this.showCaseActionForm = false;
        this.savingCaseAction = false;
        this.delinquencyService.getCaseById(this.selectedCase!.id).subscribe({
          next: (u) => { this.selectedCase = u; this.cdr.detectChanges(); }
        });
      },
      error: () => { this.caseActionError = 'Erreur enregistrement.'; this.savingCaseAction = false; }
    });
  }

  openAssignModal(caseId: number): void { this.assignCaseId = caseId; this.assignAgentId = null; this.showAssignModal = true; this.loadAgentsList(); }
  closeAssignModal(): void { this.showAssignModal = false; }

  confirmAssign(): void {
    if (!this.assignCaseId || !this.assignAgentId) return;
    this.delinquencyService.assignAgent(this.assignCaseId, this.assignAgentId).subscribe({
      next: (updated) => {
        if (this.selectedCase?.id === updated.id) this.selectedCase = updated;
        const idx = this.allCases.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.allCases[idx] = updated;
        this.applyDelinquencyFilters();
        this.showAssignModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  /** Enregistre un paiement en agence pour le dossier sélectionné */
  registerCashPayment(): void {
    if (!this.selectedCase || this.registeringCashPayment) return;
    this.registeringCashPayment = true;
    this.cashPaymentSuccess = false;
    this.delinquencyService.payByAgent(this.selectedCase.id).subscribe({
      next: (updated) => {
        this.selectedCase = updated;
        const idx = this.allCases.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.allCases[idx] = updated;
        this.applyDelinquencyFilters();
        this.registeringCashPayment = false;
        this.cashPaymentSuccess = true;
        this.cdr.detectChanges();
        setTimeout(() => { this.cashPaymentSuccess = false; this.cdr.detectChanges(); }, 4000);
      },
      error: () => { this.registeringCashPayment = false; this.cdr.detectChanges(); }
    });
  }

  openCloseModal(caseId: number): void { this.closeCaseId = caseId; this.closeReason = 'PAID'; this.showCloseModal = true; }
  closeCloseModal(): void { this.showCloseModal = false; }

  confirmClose(): void {
    if (!this.closeCaseId) return;
    this.delinquencyService.closeCase(this.closeCaseId, this.closeReason).subscribe({
      next: (updated) => {
        if (this.selectedCase?.id === updated.id) this.selectedCase = updated;
        const idx = this.allCases.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.allCases[idx] = updated;
        this.applyDelinquencyFilters();
        this.showCloseModal = false;
        this.cdr.detectChanges();
      }
    });
  }

  /* ── Export PDF ── */
  exportAdminPaymentsPdf(): void {
    const payments = this.filteredPayments || [];
    if (payments.length === 0) return;
    const today = new Date().toLocaleDateString('fr-FR');
    const rows = payments.map((p: any) => {
      const base = (p.baseInstallmentAmount ?? p.amountPaid ?? 0).toFixed(2);
      const pen = p.penaltyAmount ? p.penaltyAmount.toFixed(2) : '—';
      const tot = (p.amountPaid ?? 0).toFixed(2);
      const date = p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('fr-FR') : '—';
      const method = p.paymentMethod === 'CASH_AGENT' ? 'Cash Agent'
                   : p.paymentMethod === 'CARD' ? 'Card'
                   : p.paymentMethod === 'CASH_IMF' ? 'Cash IMF'
                   : (p.paymentMethod ?? '—');
      const statusColor = p.paymentStatus === 'PAID' ? '#16a34a' : p.paymentStatus === 'PENDING' ? '#f59e0b' : '#ef4444';
      const agent = p.agentFirstName ? `${p.agentFirstName} ${p.agentLastName ?? ''}` : '— Auto';
      return `<tr>
        <td>#${p.id}</td><td>${p.clientFirstName ?? ''} ${p.clientLastName ?? ''}</td>
        <td>${p.numeroContrat ?? '—'}</td><td style="text-align:center">#${p.installmentNumber}</td>
        <td>${base} TND</td><td style="color:#dc2626">${pen}${pen !== '—' ? ' TND' : ''}</td>
        <td style="font-weight:700">${tot} TND</td><td>${date}</td><td>${method}</td>
        <td style="color:${statusColor};font-weight:700">${p.paymentStatus ?? '—'}</td><td>${agent}</td>
      </tr>`;
    }).join('');
    const totalCollected = payments.filter((p: any) => p.paymentStatus === 'PAID')
      .reduce((s: number, p: any) => s + Number(p.amountPaid ?? 0), 0).toFixed(2);
    const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<title>Payment History — ${today}</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,sans-serif;padding:32px;color:#0f172a}
h1{font-size:22px;margin-bottom:4px}.sub{color:#64748b;font-size:13px;margin-bottom:20px}
.summary{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 18px;margin-bottom:20px;display:flex;gap:32px}
.summary div{font-size:13px}.summary b{display:block;font-size:18px;color:#0f172a;margin-top:2px}
table{width:100%;border-collapse:collapse;font-size:11px}
th{background:#f1f5f9;padding:8px;text-align:left;font-weight:700;border-bottom:2px solid #cbd5e1}
td{padding:7px 8px;border-bottom:1px solid #f1f5f9}tr:nth-child(even) td{background:#fafafa}</style>
</head><body>
<h1>Payment History</h1>
<div class="sub">Generated on ${today} · ${payments.length} payment(s)</div>
<div class="summary"><div>Total entries<b>${payments.length}</b></div>
<div>Total collected (PAID)<b style="color:#16a34a">${totalCollected} TND</b></div></div>
<table><thead><tr><th>Ref</th><th>Client</th><th>Contract</th><th>Installment</th>
<th>Base</th><th>Penalty</th><th>Total Paid</th><th>Date</th><th>Method</th><th>Status</th><th>Agent</th>
</tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  }

  /* ── Helpers délinquance ── */
  caseRiskClass(risk: string): string {
    const m: Record<string,string> = { LOW:'b-actif', MODERATE:'b-review', HIGH:'b-warning', CRITICAL:'b-danger' };
    return m[risk] ?? 'b-pending';
  }
  caseCategoryClass(cat: string): string {
    const m: Record<string,string> = { FRIENDLY:'b-teal', PRE_LEGAL:'b-review', LEGAL:'b-danger', WRITTEN_OFF:'b-pending' };
    return m[cat] ?? 'b-pending';
  }
  caseStatusLabel(s: string): string {
    const m: Record<string,string> = { NEW:'Nouveau', CONTACTED:'Contacté', IN_PROGRESS:'En cours', PLAN_ACTIVE:'Plan actif', LEGAL:'Juridique', RECOVERED:'Récupéré', CLOSED:'Clôturé' };
    return m[s] ?? s;
  }
  caseActionIcon(type: string): string {
    const m: Record<string,string> = { PHONE_CALL:'call', SMS:'sms', EMAIL:'mail', HOME_VISIT:'home', WORK_VISIT:'business', DEMAND_LETTER:'description', NEGOTIATION:'handshake', PAYMENT_PLAN:'event_available', LEGAL_ACTION:'account_balance' };
    return m[type] ?? 'task';
  }

  startEditNote(): void { this.editNoteValue = this.selectedCase?.notes ?? ''; this.editingNote = true; }
  cancelEditNote(): void { this.editingNote = false; }

  saveNote(): void {
    if (!this.selectedCase) return;
    this.savingNote = true;
    this.delinquencyService.updateNotes(this.selectedCase.id, this.editNoteValue).subscribe({
      next: (updated) => {
        this.selectedCase = updated;
        this.editingNote = false;
        this.savingNote = false;
        const idx = this.allCases.findIndex(c => c.id === updated.id);
        if (idx !== -1) this.allCases[idx] = updated;
        this.cdr.detectChanges();
      },
      error: () => { this.savingNote = false; }
    });
  }

  countCasesByRisk(risk: string): number { return this.allCases.filter(c => c.riskLevel === risk).length; }
  countCasesByCategory(cat: string): number { return this.allCases.filter(c => c.category === cat).length; }
  countCasesByStatus(status: string): number { return this.allCases.filter(c => c.status === status).length; }
}
