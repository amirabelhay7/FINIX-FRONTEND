import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  Credit,
  LoanContractDto,
  PaymentHistoryResponseDto,
  StripePaymentIntentRequestDto,
} from '../../../services/credit/credit.service';
import { AuthService } from '../../../services/auth/auth.service';

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
}

@Component({
  selector: 'app-client-repayments',
  standalone: false,
  templateUrl: './repayments.html',
  styleUrl: './repayments.css',
})
export class ClientRepayments implements OnInit {
  activeTab: 'history' | 'amortization' = 'history';

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
  // ──────────────────────────────────────────────────────

  readonly monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  constructor(
    private creditService: Credit,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.creditService.getMyContract().subscribe({
      next: (c) => {
        this.isLoading = false;
        if (!c) { this.cdr.detectChanges(); return; }
        this.contract = c;
        this.amortizationRows = this.computeAmortization(c);
        this.findCurrentInstallment();
        this.loadPaymentHistory();
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); },
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

    const req: StripePaymentIntentRequestDto = {
      amount:            Math.round(this.currentInstallment.mensualite * 100),
      currency:          'eur',
      installmentNumber: this.currentInstallment.num,
      userId,
      loanContractId:    this.contract.id,
      dueDate,
      description:       `Mensualité #${this.currentInstallment.num} — ${this.contract.numeroContrat ?? ''}`,
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
        setTimeout(() => this.mountCardElement(), 120);
      },
      error: () => {
        this.stripeLoadingIntent = false;
        this.stripeError = 'Impossible d\'initialiser le paiement. Réessayez.';
        this.stripeStep  = 'confirm';
        this.cdr.detectChanges();
      },
    });
  }

  // ── Montage du CardElement ────────────────────────────
  private mountCardElement(): void {
    if (!this.stripeInstance) return;
    const container = document.getElementById('stripe-card-element');
    if (!container) return;

    // Détruire l'ancien si existant
    if (this.stripeCardElement) {
      this.stripeCardElement.destroy();
      this.stripeCardElement = null;
    }

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

    this.stripeCardElement.mount('#stripe-card-element');
    this.stripeCardElement.on('ready', () => {
      this.stripeReady = true;
      this.cdr.detectChanges();
    });
    this.stripeCardElement.on('change', (e) => {
      this.stripeError = e.error?.message ?? null;
      this.cdr.detectChanges();
    });
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
      amountPaid:        this.currentInstallment.mensualite,
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
    this.stripeInstance       = null;
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

  // ── Calcul du tableau d'amortissement ─────────────────
  private computeAmortization(c: LoanContractDto): AmortizationRow[] {
    const C   = c.montantTotalRembourse;
    const i   = c.tauxInteret / 100 / 12;
    const n   = c.dureeMois;
    const pow = Math.pow(1 + i, n);
    const M   = C * (i * pow) / (pow - 1);
    this.mensualite = Math.round(M * 100) / 100;

    const rows: AmortizationRow[] = [];
    let capitalRestant = C;
    const startDate = new Date(c.firstPaymentDate || c.datePremiereEcheance);

    for (let k = 1; k <= n; k++) {
      const interet  = capitalRestant * i;
      const capital  = M - interet;
      capitalRestant = Math.max(0, capitalRestant - capital);

      const echeanceDate = new Date(startDate);
      echeanceDate.setMonth(echeanceDate.getMonth() + (k - 1));

      rows.push({
        num:             k,
        date:            echeanceDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
        dateObj:         new Date(echeanceDate),
        mensualite:      Math.round(M * 100) / 100,
        interet:         Math.round(interet * 100) / 100,
        capital:         Math.round(capital * 100) / 100,
        restant:         Math.round(capitalRestant * 100) / 100,
        penalite:        null,
        penaliteMontant: 0,
      });
    }
    return rows;
  }

  // ── Calendrier tracker ────────────────────────────────
  calExpanded  = false;
  calViewMonth = new Date().getMonth();
  calViewYear  = new Date().getFullYear();
  readonly weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  prevCalMonth() {
    if (this.calViewMonth === 0) { this.calViewMonth = 11; this.calViewYear--; }
    else this.calViewMonth--;
  }

  nextCalMonth() {
    if (this.calViewMonth === 11) { this.calViewMonth = 0; this.calViewYear++; }
    else this.calViewMonth++;
  }

  private cellStatus(d: number, m: number, y: number): string {
    // 1. Mark the ACTUAL payment date cell (from payment history)
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

    // 2. Check due date cell (unpaid installments only)
    const dueRow = this.amortizationRows.find(
      r => r.dateObj.getDate() === d && r.dateObj.getMonth() === m && r.dateObj.getFullYear() === y
    );
    if (!dueRow || this.isRowPaid(dueRow.num)) return '';

    const now   = new Date();
    const cell  = new Date(y, m, d);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (cell.getTime() === today.getTime()) return 'due-today';
    return cell < today ? 'past-unpaid' : 'future-due';
  }

  getCalGrid(): { day: number; inMonth: boolean; status: string }[][] {
    const first  = new Date(this.calViewYear, this.calViewMonth, 1);
    const offset = (first.getDay() + 6) % 7;
    const cur    = new Date(first);
    cur.setDate(cur.getDate() - offset);
    const grid: { day: number; inMonth: boolean; status: string }[][] = [];
    for (let w = 0; w < 6; w++) {
      const week: { day: number; inMonth: boolean; status: string }[] = [];
      for (let dd = 0; dd < 7; dd++) {
        week.push({
          day:     cur.getDate(),
          inMonth: cur.getMonth() === this.calViewMonth,
          status:  this.cellStatus(cur.getDate(), cur.getMonth(), cur.getFullYear()),
        });
        cur.setDate(cur.getDate() + 1);
      }
      grid.push(week);
    }
    return grid;
  }
}
