import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  Credit,
  InstallmentDto,
  LoanContractDto,
  PaymentHistoryResponseDto,
  PenaltyDto,
  StripePaymentIntentRequestDto,
} from '../../../services/credit/credit.service';
import { AuthService } from '../../../services/auth/auth.service';
import {
  GracePeriodRequestService,
  GracePeriodRequestResponseDto,
} from '../../../services/grace-period-request/grace-period-request.service';
import { DelinquencyService, DelinquencyCaseDto } from '../../../services/delinquency/delinquency.service';

// Stripe.js est chargé via CDN dans index.html
declare const Stripe: (key: string) => StripeInstance;

interface StripeInstance {
  elements: (options?: object) => StripeElements;
  confirmCardPayment: (
    clientSecret: string,
    data: object
  ) => Promise<{ paymentIntent?: { id: string; status: string }; error?: { message: string } }>;
}

interface StripeElements {
  create: (type: string, options?: object) => StripeElement;
}

interface StripeElement {
  mount: (selector: string | HTMLElement) => void;
  destroy: () => void;
  on: (event: string, handler: (e: { error?: { message: string } }) => void) => void;
}

export interface AmortizationRow {
  num: number;
  date: string;
  dateObj: Date;
  mensualite: number;
  interet: number;
  capital: number;
  restant: number;
  penalite: string | null;
  penaliteMontant: number;
  status: string;     // 'PENDING' | 'PAID' | 'OVERDUE' — issu directement de la BD
}

@Component({
  selector: 'app-client-repayments',
  standalone: false,
  templateUrl: './repayments.html',
  styleUrl: './repayments.css',
})
export class ClientRepayments implements OnInit {
  activeTab: 'history' | 'amortization' | 'delinquency' = 'history';

  contract: LoanContractDto | null = null;
  amortizationRows: AmortizationRow[] = [];
  mensualite = 0;
  isLoading = true;

  // Ticket du mois en cours
  currentInstallment: AmortizationRow | null = null;
  currentInstallmentPaid = false;

  // Historique real
  paymentHistory: PaymentHistoryResponseDto[] = [];
  historyLoading = false;

  // Pagination
  historyPage = 1;
  historyPageSize = 5;
  amortPage = 1;
  amortPageSize = 8;

  // Sort & search — history
  historySortDir: 'asc' | 'desc' = 'desc';
  historySearchDate = '';

  // Penalties
  penalties: PenaltyDto[] = [];

  // ── Modal Stripe ──────────────────────────────────────
  stripeModalOpen       = false;
  stripeLoadingIntent   = false;   // création du PaymentIntent
  stripeReady           = false;   // CardElement monté et prêt
  stripePaymentLoading  = false;   // confirmCardPayment en cours
  stripePaymentSuccess  = false;
  stripeError: string | null = null;
  stripeStep: 'confirm' | 'processing' | 'card' | 'success' = 'confirm';

  private stripeInstance: StripeInstance | null = null;
  private stripeCardElement: StripeElement | null = null;
  private stripeClientSecret: string | null = null;
  private mountRetries = 0;
  // ──────────────────────────────────────────────────────

  readonly monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];


  // ── Délinquance ──────────────────────────────────────
  delinquencyCase: DelinquencyCaseDto | null = null;
  delinquencyLoading = false;
  delinquencyError = '';

  // ── Grace Period Request ───────────────────────────────
  graceModalOpen = false;
  graceReason = '';
  graceRequestedDays = 5;
  graceSelectedInstallmentId: number | null = null;
  graceAffectedCount = 1;
  graceFiles: File[] = [];
  graceLoading = false;
  graceError: string | null = null;
  graceSuccess = false;
  myGraceRequests: GracePeriodRequestResponseDto[] = [];
  graceRequestsLoading = false;

  constructor(
    private creditService: Credit,
    private authService: AuthService,
    private gracePeriodService: GracePeriodRequestService,
    private cdr: ChangeDetectorRef,
    private delinquencyService: DelinquencyService,
  ) {}

  ngOnInit(): void {
    this.creditService.getMyContract().subscribe({
      next: (c) => {
        if (!c) { this.isLoading = false; this.cdr.detectChanges(); return; }
        this.contract = c;
        this.creditService.getInstallments(c.id).subscribe({
          next: (installments) => {
            this.amortizationRows = this.buildRowsFromDB(installments);
            this.isLoading = false;
            this.findCurrentInstallment();
            this.loadPaymentHistory();
            this.loadPenalties();
            this.loadMyGraceRequests();
            this.loadDelinquencyStatus();
            this.cdr.detectChanges();
          },
          error: () => {
            this.isLoading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); },
    });
  }

  /** Build amortization rows directly from DB installments — no local PMT recalculation. */
  private buildRowsFromDB(installments: InstallmentDto[]): AmortizationRow[] {
    if (installments.length === 0) return [];
    this.mensualite = Number(installments[0].amountDue);
    return installments.map(inst => {
      const d = new Date(inst.dueDate + 'T00:00:00');
      return {
        num:             inst.installmentNumber,
        date:            d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        dateObj:         d,
        mensualite:      Number(inst.amountDue),
        interet:         Number(inst.interestPart),
        capital:         Number(inst.principalPart),
        restant:         Number(inst.remainingBalance),
        penalite:        null,
        penaliteMontant: 0,
        status:          inst.status,
      };
    });
  }

  // ── Ticket courant ─────────────────────────────────────
  private findCurrentInstallment(): void {
    const now   = new Date();
    const thisYM = now.getFullYear() * 100 + now.getMonth(); // ex: 202602 pour Mars 2026

    // 1. Mensualité du mois courant
    const currentRow = this.amortizationRows.find(r =>
      r.dateObj.getFullYear() * 100 + r.dateObj.getMonth() === thisYM
    );
    if (currentRow) { this.currentInstallment = currentRow; return; }

    // 2. Prochaine mensualité (futur)
    const nextRow = this.amortizationRows.find(r =>
      r.dateObj.getFullYear() * 100 + r.dateObj.getMonth() > thisYM
    );
    if (nextRow) { this.currentInstallment = nextRow; return; }

    // 3. Fallback : dernière mensualité (toutes les échéances sont passées)
    this.currentInstallment = this.amortizationRows.at(-1) ?? null;
  }

  // ── Historique ────────────────────────────────────────
  private loadPaymentHistory(): void {
    const userId = this.authService.getPayload()?.userId;
    if (!userId) return;
    this.historyLoading = true;
    this.creditService.getPaymentHistory(userId).subscribe({
      next: (p) => {
        this.paymentHistory = p;
        this.historyLoading = false;
        this.checkCurrentInstallmentPaid();
        this.cdr.detectChanges();
      },
      error: () => { this.historyLoading = false; this.cdr.detectChanges(); },
    });
  }

  private loadPenalties(): void {
    if (!this.contract) return;
    // On déclenche d'abord le calcul pour les mensualités overdue,
    // puis on recharge la liste à jour depuis la DB.
    this.creditService.applyPenaltiesForContract(this.contract.id).subscribe({
      next: (p) => {
        this.penalties = p;
        this.cdr.detectChanges();
      },
      error: () => {
        // En cas d'erreur (ex: pas de mensualités overdue), on lit quand même ce qui est en DB
        this.creditService.getPenaltiesByContract(this.contract!.id).subscribe({
          next: (p) => { this.penalties = p; this.cdr.detectChanges(); },
          error: () => {},
        });
      },
    });
  }

  /** Get the active (APPLIED) penalty for a given installment number, or null */
  getPenaltyForInstallment(num: number): PenaltyDto | null {
    return this.penalties.find(p => p.installmentNumber === num && p.status === 'APPLIED') ?? null;
  }

  /** Get any penalty (APPLIED, PAID, WAIVED) for a given installment number */
  getAnyPenaltyForInstallment(num: number): PenaltyDto | null {
    return this.penalties.find(p => p.installmentNumber === num) ?? null;
  }

  /** Montant de base de la mensualité (sans pénalité) */
  getBaseInstallmentAmount(num: number): number {
    return this.amortizationRows.find(r => r.num === num)?.mensualite ?? 0;
  }

  /** Total réel payé = mensualité + pénalité */
  getTotalPaid(num: number): number {
    const base = this.getBaseInstallmentAmount(num);
    const penalty = this.getAnyPenaltyForInstallment(num)?.totalPenalty ?? 0;
    return base + Number(penalty);
  }

  /** Total amount due for current installment (mensualite + penalty) */
  get currentTotalDue(): number {
    if (!this.currentInstallment) return 0;
    const penalty = this.getPenaltyForInstallment(this.currentInstallment.num);
    return this.currentInstallment.mensualite + (penalty ? penalty.totalPenalty : 0);
  }

  private checkCurrentInstallmentPaid(): void {
    if (!this.currentInstallment) return;
    this.currentInstallmentPaid = this.paymentHistory.some(
      p => p.installmentNumber === this.currentInstallment!.num
    );
    // Si la mensualité courante est déjà payée → avancer vers la prochaine non payée
    if (this.currentInstallmentPaid) {
      const nextUnpaid = this.amortizationRows.find(
        r => r.num > this.currentInstallment!.num && !this.isRowPaid(r.num)
      );
      if (nextUnpaid) {
        this.currentInstallment = nextUnpaid;
        this.currentInstallmentPaid = false;
      }
    }
  }

  isRowPaid(num: number): boolean {
    return this.paymentHistory.some(p => p.installmentNumber === num);
  }

  getPaymentTiming(p: PaymentHistoryResponseDto): 'ontime' | 'tolerance' | 'late' {
    if (!p.dueDate || !p.paymentDate) return 'ontime';
    const due = new Date(p.dueDate);
    const paid = new Date(p.paymentDate);
    const dueDay  = new Date(due.getFullYear(),  due.getMonth(),  due.getDate());
    const paidDay = new Date(paid.getFullYear(), paid.getMonth(), paid.getDate());
    const diff = Math.floor((paidDay.getTime() - dueDay.getTime()) / 86400000);
    if (diff <= 0) return 'ontime';
    if (diff <= (this.contract?.gracePeriodDays ?? 4)) return 'tolerance';
    return 'late';
  }

  // ── KPIs résumé ───────────────────────────────────────
  get nextDueInstallment(): AmortizationRow | null {
    if (this.currentInstallment && !this.currentInstallmentPaid) return this.currentInstallment;
    const now = new Date();
    return this.amortizationRows.find(
      r => !this.isRowPaid(r.num) && r.dateObj >= now
    ) ?? null;
  }

  get lastPayment(): PaymentHistoryResponseDto | null {
    return this.paymentHistory.length > 0 ? this.paymentHistory[0] : null;
  }

  get totalPaid(): number {
    return this.paymentHistory.reduce((s, p) => s + Number(p.amountPaid), 0);
  }

  get totalDue(): number {
    return this.contract?.montantTotalRembourse ?? 0;
  }

  get totalPaidPercent(): number {
    return this.totalDue > 0 ? Math.min(100, (this.totalPaid / this.totalDue) * 100) : 0;
  }

  getMonthName(date: Date): string {
    return this.monthNames[date.getMonth()];
  }

  // ── Filtered + sorted + paged history ──────────────────
  get filteredHistory(): PaymentHistoryResponseDto[] {
    let data = [...this.paymentHistory];

    // Search by due date
    if (this.historySearchDate) {
      data = data.filter(p => p.dueDate && p.dueDate.startsWith(this.historySearchDate));
    }

    // Sort by due date
    data.sort((a, b) => {
      const da = new Date(a.dueDate).getTime();
      const db = new Date(b.dueDate).getTime();
      return this.historySortDir === 'asc' ? da - db : db - da;
    });

    return data;
  }

  get historyTotalPages(): number {
    return Math.ceil(this.filteredHistory.length / this.historyPageSize) || 1;
  }
  get pagedHistory(): PaymentHistoryResponseDto[] {
    const start = (this.historyPage - 1) * this.historyPageSize;
    return this.filteredHistory.slice(start, start + this.historyPageSize);
  }
  get historyPages(): number[] {
    return Array.from({ length: this.historyTotalPages }, (_, i) => i + 1);
  }
  goHistoryPage(page: number): void {
    if (page >= 1 && page <= this.historyTotalPages) this.historyPage = page;
  }
  toggleHistorySort(): void {
    this.historySortDir = this.historySortDir === 'asc' ? 'desc' : 'asc';
    this.historyPage = 1;
  }
  onHistorySearch(): void {
    this.historyPage = 1;
  }

  // ── Pagination — Amortization ─────────────────────────
  get amortTotalPages(): number {
    return Math.ceil(this.amortizationRows.length / this.amortPageSize) || 1;
  }
  get pagedAmortization(): AmortizationRow[] {
    const start = (this.amortPage - 1) * this.amortPageSize;
    return this.amortizationRows.slice(start, start + this.amortPageSize);
  }
  get amortPages(): number[] {
    return Array.from({ length: this.amortTotalPages }, (_, i) => i + 1);
  }
  goAmortPage(page: number): void {
    if (page >= 1 && page <= this.amortTotalPages) this.amortPage = page;
  }

  // ── Ouverture modal → étape confirmation ─────────────
  openStripeModal(): void {
    if (!this.currentInstallment) return;
    this.stripeStep           = 'confirm';
    this.stripeError          = null;
    this.stripePaymentSuccess = false;
    this.stripeReady          = false;
    this.stripeLoadingIntent  = false;
    this.stripePaymentLoading = false;
    this.stripeClientSecret   = null;
    this.mountRetries         = 0;
    this.stripeModalOpen      = true;
    this.cdr.detectChanges();
  }

  // ── Étape 1 → 2 : l'utilisateur a cliqué "Oui" ───────
  initStripePayment(): void {
    if (!this.currentInstallment || !this.contract) return;
    const userId = this.authService.getPayload()?.userId;
    if (!userId) return;

    this.stripeStep          = 'processing';
    this.stripeLoadingIntent = true;
    this.stripeError         = null;
    this.cdr.detectChanges();

    const d = this.currentInstallment.dateObj;
    const dueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const totalAmount = this.currentTotalDue;
    const penalty = this.getPenaltyForInstallment(this.currentInstallment.num);
    const desc = penalty
      ? `Mensualité #${this.currentInstallment.num} + penalty ${penalty.tierLabel} — ${this.contract.numeroContrat ?? ''}`
      : `Mensualité #${this.currentInstallment.num} — ${this.contract.numeroContrat ?? ''}`;

    const req: StripePaymentIntentRequestDto = {
      amount:            Math.round(totalAmount * 100),
      currency:          'eur',
      installmentNumber: this.currentInstallment.num,
      userId,
      loanContractId:    this.contract.id,
      dueDate,
      description:       desc,
    };

    this.creditService.createStripePaymentIntent(req).subscribe({
      next: (res) => {
        this.stripeClientSecret  = res.clientSecret;
        this.stripeLoadingIntent = false;
        this.stripeStep          = 'card';
        if (!this.stripeInstance) {
          this.stripeInstance = Stripe(res.publishableKey);
        }
        this.cdr.detectChanges();
        // Wait for Angular to render the 'card' step DOM, then mount
        setTimeout(() => this.mountCardElement(), 300);
      },
      error: (err) => {
        console.error('[Stripe] PaymentIntent error:', err);
        this.stripeLoadingIntent = false;
        this.stripeError = 'Unable to initialize payment. Please try again.';
        this.stripeStep  = 'confirm';
        this.cdr.detectChanges();
      },
    });
  }

  // ── Montage du CardElement ────────────────────────────
  private mountCardElement(): void {
    if (!this.stripeInstance) {
      console.error('[Stripe] No Stripe instance');
      this.stripeError = 'Payment service unavailable. Please reload the page.';
      this.cdr.detectChanges();
      return;
    }

    const container = document.getElementById('stripe-card-element');
    if (!container) {
      if (this.mountRetries < 10) {
        this.mountRetries++;
        console.warn(`[Stripe] Container not found, retry ${this.mountRetries}/10`);
        setTimeout(() => this.mountCardElement(), 300);
      } else {
        console.error('[Stripe] Container not found after 10 retries');
        this.stripeError = 'Unable to load payment form. Please close and try again.';
        this.cdr.detectChanges();
      }
      return;
    }

    this.mountRetries = 0;

    // Destroy previous element if any
    if (this.stripeCardElement) {
      try { this.stripeCardElement.destroy(); } catch (_) {}
      this.stripeCardElement = null;
    }

    // Clear container content before Stripe mounts
    container.innerHTML = '';

    try {
      const elements = this.stripeInstance.elements();
      this.stripeCardElement = elements.create('card', {
        hidePostalCode: true,
        style: {
          base: {
            fontSize: '15px',
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            color: '#1e293b',
            '::placeholder': { color: '#94a3b8' },
            iconColor: '#3b82f6',
          },
          invalid: { color: '#ef4444', iconColor: '#ef4444' },
        },
      });

      this.stripeCardElement.mount(container);
      this.stripeCardElement.on('ready', () => {
        this.stripeReady = true;
        this.cdr.detectChanges();
      });
      this.stripeCardElement.on('change', (e: any) => {
        this.stripeError = e.error?.message ?? null;
        this.cdr.detectChanges();
      });
    } catch (err) {
      console.error('[Stripe] Mount error:', err);
      this.stripeError = 'Payment form failed to load. Please try again.';
      this.cdr.detectChanges();
    }
  }

  // ── Confirmation du paiement ──────────────────────────
  async confirmStripePayment(): Promise<void> {
    if (!this.stripeInstance || !this.stripeCardElement || !this.stripeClientSecret) return;

    this.stripePaymentLoading = true;
    this.stripeError = null;

    const result = await this.stripeInstance.confirmCardPayment(this.stripeClientSecret, {
      payment_method: { card: this.stripeCardElement },
    });

    if (result.error) {
      this.stripeError = result.error.message ?? 'Paiement refusé.';
      this.stripePaymentLoading = false;
      this.cdr.detectChanges();
      return;
    }

    if (result.paymentIntent?.status === 'succeeded') {
      this.savePaymentToDb(result.paymentIntent.id);
    }
  }

  // ── Enregistrement en DB après succès Stripe ──────────
  private savePaymentToDb(stripePaymentIntentId: string): void {
    if (!this.currentInstallment || !this.contract) return;
    const userId = this.authService.getPayload()?.userId;
    if (!userId) return;

    const d = this.currentInstallment.dateObj;
    const dueDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    this.creditService.recordPaymentHistory({
      stripePaymentIntentId,
      userId,
      loanContractId:    this.contract.id,
      installmentNumber: this.currentInstallment.num,
      dueDate,
      amountPaid:        this.currentTotalDue,
    }).subscribe({
      next: () => {
        this.currentInstallmentPaid = true;
        this.stripePaymentSuccess   = true;
        this.stripePaymentLoading   = false;
        this.stripeStep             = 'success';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.closeStripeModal();
          this.loadPaymentHistory();
          this.cdr.detectChanges();
        }, 2500);
      },
      error: (err) => {
        console.error('Erreur enregistrement payment history:', err);
        // Stripe a encaissé → afficher succès quand même
        this.currentInstallmentPaid = true;
        this.stripePaymentSuccess   = true;
        this.stripePaymentLoading   = false;
        this.stripeStep             = 'success';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.closeStripeModal();
          this.loadPaymentHistory();
          this.cdr.detectChanges();
        }, 2500);
      },
    });
  }

  // ── Fermeture modal ───────────────────────────────────
  closeStripeModal(): void {
    if (this.stripeStep === 'processing' || this.stripePaymentLoading) return;
    if (this.stripeCardElement) {
      this.stripeCardElement.destroy();
      this.stripeCardElement = null;
    }
    const justPaid            = this.stripePaymentSuccess;
    this.stripeModalOpen      = false;
    this.stripePaymentSuccess = false;
    this.stripeError          = null;
    this.stripeReady          = false;
    this.stripeClientSecret   = null;
    this.stripeStep           = 'confirm';
    // Si paiement vient de réussir, loadPaymentHistory() va recalculer l'état
    // Ne pas appeler checkCurrentInstallmentPaid() ici pour éviter de réafficher le bouton
    if (!justPaid) {
      this.checkCurrentInstallmentPaid();
    }
    this.cdr.detectChanges();
  }

  // ── Calendrier tracker ────────────────────────────────
  calExpanded  = false;
  calViewMonth = new Date().getMonth();
  calViewYear  = new Date().getFullYear();
  readonly weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  activeTooltip: string | null = null;

  prevCalMonth() {
    if (this.calViewMonth === 0) { this.calViewMonth = 11; this.calViewYear--; }
    else this.calViewMonth--;
  }

  nextCalMonth() {
    if (this.calViewMonth === 11) { this.calViewMonth = 0; this.calViewYear++; }
    else this.calViewMonth++;
  }

  /** Navigate the calendar to the month of the next unpaid installment. */
  goToNextDue(): void {
    const next = this.amortizationRows.find(r => !this.isRowPaid(r.num));
    if (!next) return;
    this.calViewMonth = next.dateObj.getMonth();
    this.calViewYear  = next.dateObj.getFullYear();
    this.calExpanded  = true;
    this.cdr.detectChanges();
  }

  /** Summary info for the currently viewed month. */
  get calMonthSummary(): { dueRow: AmortizationRow | null; paid: PaymentHistoryResponseDto[]; totalPaid: number; isPaid: boolean } {
    const dueRow = this.amortizationRows.find(
      r => r.dateObj.getMonth() === this.calViewMonth && r.dateObj.getFullYear() === this.calViewYear
    ) ?? null;
    const paid = this.paymentHistory.filter(p => {
      const d = new Date(p.paymentDate);
      return d.getMonth() === this.calViewMonth && d.getFullYear() === this.calViewYear;
    });
    const totalPaid = paid.reduce((s, p) => s + Number(p.amountPaid), 0);
    const isPaid = dueRow ? this.isRowPaid(dueRow.num) : false;
    return { dueRow, paid, totalPaid, isPaid };
  }

  private cellStatus(d: number, m: number, y: number): string {
    // 1. Mark the ACTUAL payment date cell
    const paymentOnThisDay = this.paymentHistory.find(p => {
      const pd = new Date(p.paymentDate);
      return pd.getDate() === d && pd.getMonth() === m && pd.getFullYear() === y;
    });
    if (paymentOnThisDay) {
      const dueRow = this.amortizationRows.find(r => r.num === paymentOnThisDay.installmentNumber);
      if (dueRow) {
        const diff = Math.floor(
          (new Date(y, m, d).getTime() - dueRow.dateObj.getTime()) / 86400000
        );
        return diff <= 0 ? 'ontime' : diff <= (this.contract?.gracePeriodDays ?? 4) ? 'tolerance' : 'late';
      }
      return 'ontime';
    }

    // 2. Check due date cell
    const dueRow = this.amortizationRows.find(
      r => r.dateObj.getDate() === d && r.dateObj.getMonth() === m && r.dateObj.getFullYear() === y
    );
    if (!dueRow) return '';

    // Due date of a PAID installment → subtle marker
    if (this.isRowPaid(dueRow.num)) return 'paid-due';

    // Due date of UNPAID installment
    const now   = new Date();
    const cell  = new Date(y, m, d);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (cell.getTime() === today.getTime()) return 'due-today';
    return cell < today ? 'past-unpaid' : 'future-due';
  }

  private cellTooltip(d: number, m: number, y: number): string {
    // Payment made on this day
    const payment = this.paymentHistory.find(p => {
      const pd = new Date(p.paymentDate);
      return pd.getDate() === d && pd.getMonth() === m && pd.getFullYear() === y;
    });
    if (payment) {
      const dueRow = this.amortizationRows.find(r => r.num === payment.installmentNumber);
      const t = this.getPaymentTiming(payment);
      const tLabel = t === 'ontime' ? '✓ On time' : t === 'tolerance' ? '⚠ Within grace period' : '✗ Late';
      return `Installment #${payment.installmentNumber}\n${Number(payment.amountPaid).toFixed(2)} TND\n${tLabel}${dueRow ? '\nDue: ' + dueRow.date : ''}`;
    }

    // Due date cell
    const dueRow = this.amortizationRows.find(
      r => r.dateObj.getDate() === d && r.dateObj.getMonth() === m && r.dateObj.getFullYear() === y
    );
    if (dueRow) {
      const paid = this.isRowPaid(dueRow.num);
      const status = paid ? '✓ Paid' : 'Pending payment';
      return `Installment #${dueRow.num}\n${dueRow.mensualite.toFixed(2)} TND\nDue date — ${status}`;
    }

    return '';
  }

  getCalGrid(): { day: number; inMonth: boolean; status: string; tooltip: string }[][] {
    const first  = new Date(this.calViewYear, this.calViewMonth, 1);
    const offset = (first.getDay() + 6) % 7;
    const cur    = new Date(first);
    cur.setDate(cur.getDate() - offset);
    const grid: { day: number; inMonth: boolean; status: string; tooltip: string }[][] = [];
    for (let w = 0; w < 6; w++) {
      const week: { day: number; inMonth: boolean; status: string; tooltip: string }[] = [];
      for (let dd = 0; dd < 7; dd++) {
        week.push({
          day:     cur.getDate(),
          inMonth: cur.getMonth() === this.calViewMonth,
          status:  this.cellStatus(cur.getDate(), cur.getMonth(), cur.getFullYear()),
          tooltip: this.cellTooltip(cur.getDate(), cur.getMonth(), cur.getFullYear()),
        });
        cur.setDate(cur.getDate() + 1);
      }
      grid.push(week);
    }
    return grid;
  }

  // ── Grace Period Request methods ──────────────────────
  loadMyGraceRequests(): void {
    const userId = this.authService.getPayload()?.userId;
    if (!userId) return;
    this.graceRequestsLoading = true;
    this.gracePeriodService.getByClientId(userId).subscribe({
      next: (res) => {
        this.myGraceRequests = res;
        this.graceRequestsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.graceRequestsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadDelinquencyStatus(): void {
    const userId = this.authService.getPayload()?.userId;
    if (!userId) return;
    this.delinquencyLoading = true;
    this.delinquencyService.getCasesByClient(userId).subscribe({
      next: (cases) => {
        this.delinquencyCase = cases.find(c => c.status !== 'CLOSED' && c.status !== 'RECOVERED') ?? null;
        this.delinquencyLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.delinquencyLoading = false; this.cdr.detectChanges(); }
    });
  }

  get delinquencyRiskColor(): string {
    const m: Record<string,string> = { LOW:'#22c55e', MODERATE:'#f59e0b', HIGH:'#f97316', CRITICAL:'#ef4444' };
    return m[this.delinquencyCase?.riskLevel ?? ''] ?? '#6b7280';
  }

  get unpaidInstallments(): AmortizationRow[] {
    return this.amortizationRows.filter(r => !this.isRowPaid(r.num));
  }

  get maxAffectedInstallments(): number {
    if (!this.graceSelectedInstallmentId) return 1;
    const selected = this.amortizationRows.find(r => r.num === this.graceSelectedInstallmentId);
    if (!selected) return 1;
    return this.amortizationRows
      .filter(r => r.num >= selected.num && !this.isRowPaid(r.num))
      .length;
  }

  openGraceModal(): void {
    this.graceModalOpen = true;
    this.graceReason = '';
    this.graceRequestedDays = 5;
    this.graceSelectedInstallmentId = this.currentInstallment?.num ?? null;
    this.graceAffectedCount = 1;
    this.graceFiles = [];
    this.graceError = null;
    this.graceSuccess = false;
    this.graceLoading = false;
    this.cdr.detectChanges();
  }

  closeGraceModal(): void {
    if (this.graceLoading) return;
    this.graceModalOpen = false;
    this.cdr.detectChanges();
  }

  onGraceFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.graceFiles = Array.from(input.files);
    }
  }

  removeGraceFile(index: number): void {
    this.graceFiles.splice(index, 1);
  }

  submitGraceRequest(): void {
    if (!this.contract || this.graceLoading) return;
    const userId = this.authService.getPayload()?.userId;
    if (!userId) return;

    if (!this.graceSelectedInstallmentId) {
      this.graceError = 'Please select an installment.';
      return;
    }
    if (!this.graceReason.trim()) {
      this.graceError = 'Please provide a reason for the grace period request.';
      return;
    }
    if (this.graceRequestedDays < 1 || this.graceRequestedDays > 15) {
      this.graceError = 'Grace days must be between 1 and 15.';
      return;
    }
    if (this.graceAffectedCount < 1 || this.graceAffectedCount > this.maxAffectedInstallments) {
      this.graceError = 'Affected installments must be between 1 and ' + this.maxAffectedInstallments + '.';
      return;
    }

    this.graceLoading = true;
    this.graceError = null;

    this.gracePeriodService.create(
      {
        requestedGraceDays: this.graceRequestedDays,
        reason: this.graceReason,
        clientId: userId,
        loanContractId: this.contract.id,
        installmentNumber: this.graceSelectedInstallmentId,
        numberOfAffectedInstallments: this.graceAffectedCount,
      },
      this.graceFiles.length > 0 ? this.graceFiles : undefined
    ).subscribe({
      next: () => {
        this.graceSuccess = true;
        this.graceLoading = false;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.closeGraceModal();
          this.loadMyGraceRequests();
        }, 2000);
      },
      error: (err) => {
        this.graceLoading = false;
        this.graceError = err.error?.message || 'An error occurred. Please try again.';
        this.cdr.detectChanges();
      },
    });
  }

  get hasPendingGraceRequest(): boolean {
    return this.myGraceRequests.some(r => r.status === 'PENDING');
  }

  // ── Spinning counter helpers ──────────────────────────
  incrementGraceDays(): void {
    if (this.graceRequestedDays < 15) this.graceRequestedDays++;
  }
  decrementGraceDays(): void {
    if (this.graceRequestedDays > 1) this.graceRequestedDays--;
  }
  incrementAffectedCount(): void {
    if (this.graceAffectedCount < this.maxAffectedInstallments) this.graceAffectedCount++;
  }
  decrementAffectedCount(): void {
    if (this.graceAffectedCount > 1) this.graceAffectedCount--;
  }

  // ── Export PDF ────────────────────────────────────────
  exportPdf(): void {
    if (!this.contract) return;

    const c = this.contract;

    const amortRows = this.amortizationRows.map(r => {
      const isPaid    = r.status === 'PAID';
      const isOverdue = r.status === 'OVERDUE';
      const bg     = isPaid ? '#f0fdf4;' : (isOverdue ? 'background:#fef2f2;' : '');
      const label  = isPaid ? 'Paid' : (isOverdue ? 'Overdue' : 'Pending');
      const color  = isPaid ? '#16a34a' : (isOverdue ? '#dc2626' : '#64748b');
      return `
        <tr style="${bg}">
          <td>#${r.num}</td>
          <td>${r.date}</td>
          <td>${r.mensualite.toFixed(2)} TND</td>
          <td>${r.interet.toFixed(2)} TND</td>
          <td>${r.capital.toFixed(2)} TND</td>
          <td>${r.restant.toFixed(2)} TND</td>
          <td style="color:${color};font-weight:600">${label}</td>
        </tr>`;
    }).join('');

    const histRows = this.paymentHistory.length === 0
      ? '<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:1rem">No payments recorded.</td></tr>'
      : this.paymentHistory.map(p => {
          const t = this.getPaymentTiming(p);
          const tLabel = t === 'ontime' ? 'On Time' : t === 'tolerance' ? 'Tolerance' : 'Late';
          const tColor = t === 'ontime' ? '#16a34a' : t === 'tolerance' ? '#f59e0b' : '#ef4444';
          const payDate = p.paymentDate ? new Date(p.paymentDate).toLocaleDateString('fr-FR') : '—';
          const pen = this.getAnyPenaltyForInstallment(p.installmentNumber);
          const penCell = pen
            ? `<span style="font-size:11px;font-weight:600;color:#dc2626">${pen.totalPenalty.toFixed(2)} TND</span><br><small style="color:#94a3b8">${pen.tierLabel} · ${pen.daysOverdue}d · ${pen.status}</small>`
            : '<span style="color:#94a3b8">—</span>';
          return `
            <tr>
              <td>#PAY-${p.id}</td>
              <td>Installment #${p.installmentNumber}<br><small style="color:#94a3b8">${p.numeroContrat ?? ''}</small></td>
              <td>${Number(p.amountPaid).toFixed(2)} TND</td>
              <td>${penCell}</td>
              <td>${payDate}</td>
              <td>${p.paymentMethod ?? '—'}</td>
              <td style="color:${tColor};font-weight:600">${tLabel}</td>
            </tr>`;
        }).join('');

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Repayment Report — ${c.numeroContrat ?? ''}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 32px; font-size: 13px; }
    h1 { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
    .sub { color: #64748b; font-size: 12px; margin-bottom: 24px; }
    .kpis { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
    .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px; min-width: 130px; }
    .kpi-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
    .kpi-val { font-size: 16px; font-weight: 700; color: #1e293b; }
    h2 { font-size: 14px; font-weight: 700; color: #334155; margin: 24px 0 10px; border-left: 3px solid #3b82f6; padding-left: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    th { background: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: .5px; padding: 8px 10px; text-align: left; border-bottom: 2px solid #e2e8f0; }
    td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
    .footer { margin-top: 32px; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    @media print { body { padding: 16px; } button { display: none; } }
  </style>
</head>
<body>
  <h1>Repayment Report</h1>
  <div class="sub">Contract: ${c.numeroContrat ?? 'N/A'} &nbsp;|&nbsp; Generated on ${new Date().toLocaleDateString('fr-FR')}</div>

  <div class="kpis">
    <div class="kpi"><div class="kpi-label">Capital Borrowed</div><div class="kpi-val">${Number(c.montantCredit).toFixed(0)} TND</div></div>
    <div class="kpi"><div class="kpi-label">Total to Repay</div><div class="kpi-val">${Number(c.montantTotalRembourse).toFixed(0)} TND</div></div>
    <div class="kpi"><div class="kpi-label">Monthly Payment</div><div class="kpi-val">${this.mensualite.toFixed(2)} TND</div></div>
    <div class="kpi"><div class="kpi-label">Annual Rate</div><div class="kpi-val">${c.tauxInteret}%</div></div>
    <div class="kpi"><div class="kpi-label">Duration</div><div class="kpi-val">${c.dureeMois} months</div></div>
    <div class="kpi"><div class="kpi-label">Payments Made</div><div class="kpi-val">${this.paymentHistory.length} / ${c.dureeMois}</div></div>
  </div>

  <h2>Amortization Schedule</h2>
  <table>
    <thead><tr><th>#</th><th>Due Date</th><th>Installment</th><th>Interests</th><th>Principal</th><th>Remaining</th><th>Status</th></tr></thead>
    <tbody>${amortRows}</tbody>
  </table>

  <h2>Payment History</h2>
  <table>
    <thead><tr><th>Reference</th><th>Installment</th><th>Amount</th><th>Penalty</th><th>Payment Date</th><th>Method</th><th>Timing</th></tr></thead>
    <tbody>${histRows}</tbody>
  </table>

  <div class="footer">FINIX — Repayment Report &nbsp;|&nbsp; ${c.numeroContrat ?? ''} &nbsp;|&nbsp; ${new Date().toLocaleString('fr-FR')}</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, '_blank', 'width=960,height=750');
    if (!win) return;
    win.focus();
    win.addEventListener('load', () => {
      setTimeout(() => { win.print(); URL.revokeObjectURL(url); }, 400);
    });
  }
}
