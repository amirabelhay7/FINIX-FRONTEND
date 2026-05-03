import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

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

  private readonly API = 'http://localhost:8081/api';

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

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('finix_theme') as 'light' | 'dark' | null;
    this.currentTheme = saved || 'dark';
    this.applyTheme();
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('finix_theme', this.currentTheme);
    this.applyTheme();
  }

  switchPage(page: string): void {
    this.selectedPage = page;
    if (page === 'remboursements') this.loadAgentHistory();
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
        this.historyError = 'Erreur ' + (err?.status || '') + ' — ' + (err?.error?.message || err?.message || 'impossible de charger l\'historique');
      },
    });
  }

  logout(): void {
    localStorage.removeItem('finix_access_token');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  private applyTheme(): void {
    this.renderer.setAttribute(document.documentElement, 'data-theme', this.currentTheme);
  }

  get currentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', {
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

    this.http.get<any>(`${this.API}/payment-history/next-installment/by-user/${c.id}`).subscribe({
      next: (res) => {
        this.installmentLoading = false;
        this.nextInstallment = res;
      },
      error: (err) => {
        this.installmentLoading = false;
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
}
