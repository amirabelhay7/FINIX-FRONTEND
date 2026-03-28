import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  clientSearch = '';
  clientResults: any[] = [];
  selectedClient: any = null;
  paymentForm = {
    amountPaid: '',
    paymentDate: '',
    paymentMethod: '',
    paymentStatus: '',
    delinquencyCaseId: '',
    recoveryActionId: '',
  };
  paymentLoading = false;
  paymentError = '';
  paymentSuccess = false;
  recentPayments: any[] = [];

  constructor(
    private renderer: Renderer2,
    private router: Router,
    private http: HttpClient,
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

  /* ── Client search ── */
  searchClients(): void {
    const q = this.clientSearch.trim();
    if (q.length < 2) { this.clientResults = []; return; }
    this.http.get<any[]>(`${this.API}/users/search?q=${encodeURIComponent(q)}`).subscribe({
      next: (res) => this.clientResults = res,
      error: () => this.clientResults = [],
    });
  }

  selectClient(c: any): void {
    this.selectedClient = c;
    this.paymentForm = { amountPaid: '', paymentDate: '', paymentMethod: '', paymentStatus: '', delinquencyCaseId: '', recoveryActionId: '' };
    this.clientResults = [];
    this.clientSearch = '';
    this.paymentError = '';
    this.paymentSuccess = false;
  }

  resetPaymentForm(): void {
    this.selectedClient = null;
    this.clientSearch = '';
    this.clientResults = [];
    this.paymentForm = { amountPaid: '', paymentDate: '', paymentMethod: '', paymentStatus: '', delinquencyCaseId: '', recoveryActionId: '' };
    this.paymentError = '';
    this.paymentSuccess = false;
  }

  submitPayment(): void {
    if (!this.selectedClient) { this.paymentError = 'Veuillez sélectionner un client.'; return; }
    if (!this.paymentForm.amountPaid || !this.paymentForm.paymentDate || !this.paymentForm.paymentMethod || !this.paymentForm.paymentStatus) {
      this.paymentError = 'Veuillez remplir tous les champs obligatoires.'; return;
    }
    this.paymentLoading = true;
    this.paymentError = '';
    const payload: any = {
      amountPaid:        Number(this.paymentForm.amountPaid),
      paymentDate:       this.paymentForm.paymentDate,
      paymentMethod:     this.paymentForm.paymentMethod,
      paymentStatus:     this.paymentForm.paymentStatus,
      userId:            this.selectedClient.id,
      delinquencyCaseId: this.paymentForm.delinquencyCaseId ? Number(this.paymentForm.delinquencyCaseId) : null,
      recoveryActionId:  this.paymentForm.recoveryActionId  ? Number(this.paymentForm.recoveryActionId)  : null,
    };
    this.http.post<any>(`${this.API}/payments`, payload).subscribe({
      next: (res) => {
        this.paymentLoading = false;
        this.paymentSuccess = true;
        this.recentPayments = [res, ...this.recentPayments].slice(0, 10);
        this.paymentForm = { amountPaid: '', paymentDate: '', paymentMethod: '', paymentStatus: '', delinquencyCaseId: '', recoveryActionId: '' };
      },
      error: (err) => {
        this.paymentLoading = false;
        this.paymentError = err?.error?.message || 'Erreur lors de l\'enregistrement du paiement.';
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
