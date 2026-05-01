import { Component, OnInit, OnDestroy, Renderer2, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface PipelineCard {
  name: string;
  ref: string;
  amount: string;
  type: string;
  warn?: boolean;
}

interface PipelineColumn {
  title: string;
  class: string;
  count: number;
  cards: PipelineCard[];
}

@Component({
  selector: 'app-backoffice',
  standalone: false,
  templateUrl: './backoffice.component.html',
  styleUrl: './backoffice.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class BackofficeComponent implements OnInit, OnDestroy {
  selectedPage = 'dashboard';
  hover = false;
  showModal = false;
  decisionNote = '';
  currentTheme: 'light' | 'dark' = 'light';

  /* ── Users management ── */
  private readonly API = 'http://localhost:8081/api';
  usersList: any[] = [];
  usersLoading = false;
  showUserModal = false;
  editingUserId: number | null = null;
  addUserError = '';
  addUserLoading = false;
  newUser: any = { firstName: '', lastName: '', email: '', password: '', role: 'AGENT', phoneNumber: '', cin: '', address: '', city: '', agenceCode: '', region: '', insurerName: '', insurerEmail: '' };
  showViewUserModal = false;
  viewUser: any = null;

  /* ── Logs ── */
  logsList: any[] = [];
  logsLoading = false;
  usersTab: 'users' | 'logs' = 'users';
  activeSettingsSection: string = 'general';

  /* ── Dashboard KPIs ── */
  dash = {
    activeClients: 0,
    totalOutstanding: 0,
    activeContracts: 0,
    collectedThisMonth: 0,
    openDelinquencyCases: 0,
    totalOverdueAmount: 0,
    pendingGraceRequests: 0,
    clientsWithPenalties: 0,
    totalPenaltyAmount: 0,
    dueThisMonth: 0,
    pendingInstallmentsCount: 0,
    recoveryRate: 0,
    defaultRate: 0,
  };
  dashLoading = false;

  constructor(private renderer: Renderer2, private router: Router, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  logout(): void {
    localStorage.removeItem('finix_access_token');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('finix_theme') as 'light' | 'dark' | null;
    this.currentTheme = saved || 'light';
    this.applyTheme();

    const savedPage = sessionStorage.getItem('finix_page');
    if (savedPage) this.selectedPage = savedPage;

    this.loadDashboardKpi();
  }

  loadDashboardKpi(): void {
    this.dashLoading = true;
    this.http.get<any>(`${this.API}/dashboard/kpi`).subscribe({
      next: (res) => {
        this.dash = {
          activeClients:          Number(res.activeClients ?? 0),
          totalOutstanding:       Number(res.totalOutstanding ?? 0),
          activeContracts:        Number(res.activeContracts ?? 0),
          collectedThisMonth:     Number(res.collectedThisMonth ?? 0),
          openDelinquencyCases:   Number(res.openDelinquencyCases ?? 0),
          totalOverdueAmount:     Number(res.totalOverdueAmount ?? 0),
          pendingGraceRequests:   Number(res.pendingGraceRequests ?? 0),
          clientsWithPenalties:   Number(res.clientsWithPenalties ?? 0),
          totalPenaltyAmount:     Number(res.totalPenaltyAmount ?? 0),
          dueThisMonth:           Number(res.dueThisMonth ?? 0),
          pendingInstallmentsCount: Number(res.pendingInstallmentsCount ?? 0),
          recoveryRate:           Number(res.recoveryRate ?? 0),
          defaultRate:            Number(res.defaultRate ?? 0),
        };
        this.dashLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Dashboard] KPI error:', err);
        this.dashLoading = false;
      }
    });
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('finix_theme', this.currentTheme);
    this.applyTheme();
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
  }

  private applyTheme(): void {
    this.renderer.setAttribute(document.documentElement, 'data-theme', this.currentTheme);
  }

  navigateTo(page: string) {
    this.selectedPage = page;
    sessionStorage.setItem('finix_page', page);
  }

  onPageChange(page: string) {
    if (page === 'users') {
      this.setSettingsSection('users-roles');
      return;
    }
    this.navigateTo(page);
    if (page === 'settings') {
      this.activeSettingsSection = 'general';
    }
    if (page === 'clients') {
      this.loadClients();
    }
  }

  setSettingsSection(section: string): void {
    this.activeSettingsSection = section;
    this.navigateTo('settings');
    if (section === 'users-roles') {
      this.usersTab = 'users';
      this.loadUsers();
      this.loadLogs();
    }
  }

  switchUsersTab(tab: 'users' | 'logs'): void {
    this.usersTab = tab;
  }


  dossiers = [
    {
      ref: '#CR-2025-043',
      initials: 'BM',
      client: 'Bilel Mrabet',
      clientSince: 'Client depuis 2021',
      type: 'Immobilier',
      amount: '85 000 TND',
      score: '742',
      scoreColor: '#2ECC71',
      status: 'En analyse',
      statusClass: 'b-review'
    },
    {
      ref: '#CR-2025-051',
      initials: 'LB',
      client: 'Leila Bourguiba',
      clientSince: 'Client depuis 2023',
      type: 'Automobile',
      amount: '32 500 TND',
      score: '610',
      scoreColor: '#F39C12',
      status: 'En analyse',
      statusClass: 'b-review'
    },
    {
      ref: '#CR-2025-059',
      initials: 'KH',
      client: 'Karim Hadj',
      clientSince: 'Nouveau client',
      type: 'Consommation',
      amount: '8 000 TND',
      score: '520',
      scoreColor: '#E74C3C',
      status: 'En attente',
      statusClass: 'b-pending'
    }
  ];

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

  clients: any[] = [];
  clientsLoading = false;


  pipelineColumns: PipelineColumn[] = [
    {
      title: "New",
      class: "ph-new",
      count: 8,
      cards: [
        { name: "Karim Hadj", ref: "#CR-2025-059", amount: "8 000 TND", type: "Consumption" },
        { name: "Marwa Ferchichi", ref: "#CR-2025-062", amount: "15 000 TND", type: "Car loan" },
        { name: "Nizar Jlassi", ref: "#CR-2025-064", amount: "6 500 TND", type: "Consumption" }
      ]
    },

    {
      title: "Analysis",
      class: "ph-analysis",
      count: 12,
      cards: [
        { name: "Bilel Mrabet", ref: "#CR-2025-043", amount: "85 000 TND", type: "Real estate · 48h+", warn: true },
        { name: "Leila Bourguiba", ref: "#CR-2025-051", amount: "32 500 TND", type: "Car loan · 48h+", warn: true },
        { name: "Sonia Karray", ref: "#CR-2025-055", amount: "12 000 TND", type: "Consumption" }
      ]
    }
  ];

  analysisFiles = [
    {
      ref: "#CR-2025-043",
      initials: "BM",
      name: "Bilel Mrabet",
      clientInfo: "Loyal client · 5 years",
      type: "Real estate",
      amount: "85 000 TND",
      duration: "180 months",
      score: 742,
      debtRatio: 28,
      seniority: "5 years",
      recommendation: "Favorable"
    },
    {
      ref: "#CR-2025-051",
      initials: "LB",
      name: "Leila Bourguiba",
      clientInfo: "Client · 2 years",
      type: "Car loan",
      amount: "32 500 TND",
      duration: "60 months",
      score: 610,
      debtRatio: 41,
      seniority: "2 years",
      recommendation: "To analyze"
    }
  ];

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

  notificationsCritical = [
    {
      title: "Critical overdue — Hanen Gharbi — J+14",
      meta: "2 hours ago · #CR-2023-092 · 890 TND · Action required",
      type: "danger"
    },
    {
      title: "File waiting > 48h — #CR-2025-043 — Bilel Mrabet",
      meta: "3 hours ago · Real estate · 85,000 TND · Decision required",
      type: "warning"
    },
    {
      title: "Insurance expired — Toyota Corolla — Bilel Mrabet",
      meta: "5 hours ago · STAR-2025-048291 · Expire in 2 days",
      type: "danger"
    }
  ];

  notificationsRecent = [
    {
      title: "Payment received — Bilel Mrabet — 850 TND",
      meta: "4 min ago · Bank transfer · #PAY-2026-028",
      color: "success"
    },
    {
      title: "New file submitted — Karim Hadj",
      meta: "18 min ago · Consumption · 8,000 TND",
      color: "blue"
    },
    {
      title: "New client registered — Marwa Ferchichi",
      meta: "3 hours ago · Web channel · Sfax · KYC pending",
      color: "purple"
    },
    {
      title: "File approved — Amira Selmi — #CR-2025-037",
      meta: "Yesterday 16:42 · Automobile · 45,000 TND",
      color: "success"
    },
    {
      title: "Monthly report January 2026 available",
      meta: "Yesterday 08:00 · Auto generated",
      color: "blue"
    }
  ];

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
    reference: '#CR-2025-043',
    status: 'In analysis',
    submittedDate: '26/02/2026',
    client: {
      name: 'Bilel Mrabet',
      cin: '08 123 456',
      phone: '+216 20 123 456',
      email: 'bilel.mrabt@email.com'
    }
  };




  goToBusinessRules() {
    this.navigateTo('penalty-tiers');
  }

  goCredits() {
    console.log('Navigate credits');
  }



  selectedFile:any;

  openModal(file:any){
    this.selectedFile = file;
    console.log(file);
    this.showModal = true;
  }
  toggleConfig(key: string): void {
    if (this.notificationsConfig && key in this.notificationsConfig) {
      this.notificationsConfig[key] = !this.notificationsConfig[key];
    }
  }




  closeModal(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showModal = false;
  }

  approveCase() {
    console.log("Approved", this.decisionNote);
    this.closeModal();
  }

  rejectCase() {
    console.log("Rejected", this.decisionNote);
    this.closeModal();
  }

  requestMoreInfo() {
    console.log("More info requested", this.decisionNote);
  }

  /* ── Clients API ── */
  loadClients(): void {
    this.clientsLoading = true;
    this.http.get<any[]>(`${this.API}/users`).subscribe({
      next: (users) => {
        this.clients = users
          .filter((u: any) => u.role === 'CLIENT')
          .map((u: any) => ({
            id: u.id,
            initials: ((u.firstName?.[0] || '') + (u.lastName?.[0] || '')).toUpperCase(),
            name: (u.firstName || '') + ' ' + (u.lastName || ''),
            email: u.email || '—',
            phone: u.phoneNumber ? '+216 ' + u.phoneNumber : '—',
            cin: u.cin || '—',
            city: u.city || '—',
            status: 'Active',
            statusClass: 'b-actif'
          }));
        this.clientsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.clientsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /* ── Logs API ── */
  loadLogs(): void {
    this.logsLoading = true;
    this.http.get<any[]>(`${this.API}/users/logs`).subscribe({
      next: (logs) => {
        this.logsList = logs;
        this.logsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.logsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /* ── Users API ── */
  loadUsers(): void {
    this.usersLoading = true;
    this.http.get<any[]>(`${this.API}/users`).subscribe({
      next: (users) => {
        this.usersList = users.filter((u: any) => u.role === 'AGENT' || u.role === 'INSURER');
        this.usersLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('[loadUsers] Erreur chargement utilisateurs:', err);
        this.usersLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  /* Create */
  openAddUser(): void {
    this.editingUserId = null;
    this.newUser = { firstName: '', lastName: '', email: '', password: '', role: 'AGENT', phoneNumber: '', cin: '', address: '', city: '', agenceCode: '', region: '', insurerName: '', insurerEmail: '' };
    this.addUserError = '';
    this.showUserModal = true;
  }

  /* Edit */
  openEditUser(user: any): void {
    this.editingUserId = user.id;
    this.newUser = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '',
      role: user.role || 'AGENT',
      phoneNumber: user.phoneNumber || '',
      cin: user.cin || '',
      address: user.address || '',
      city: user.city || '',
      agenceCode: user.agenceCode || '',
      region: user.region || '',
      insurerName: user.insurerName || '',
      insurerEmail: user.insurerEmail || '',
    };
    this.addUserError = '';
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
  }

  /* View */
  openViewUser(user: any): void {
    this.viewUser = user;
    this.showViewUserModal = true;
  }

  closeViewUser(): void {
    this.showViewUserModal = false;
  }

  /* Submit create or update */
  submitUser(): void {
    console.log('[ADMIN] submitUser() called');
    console.log('[ADMIN] newUser:', JSON.stringify(this.newUser));
    this.addUserError = '';
    if (!this.newUser.firstName || !this.newUser.lastName || !this.newUser.email) {
      this.addUserError = 'Veuillez remplir tous les champs obligatoires.';
      console.log('[ADMIN] Validation failed: champs obligatoires manquants');
      return;
    }
    if (!this.editingUserId && !this.newUser.password) {
      this.addUserError = 'Le mot de passe est obligatoire pour un nouveau compte.';
      console.log('[ADMIN] Validation failed: password manquant');
      return;
    }
    console.log('[ADMIN] Validation passed, sending request...');
    this.addUserLoading = true;

    if (this.editingUserId) {
      // UPDATE
      const payload: any = {
        firstName: this.newUser.firstName,
        lastName: this.newUser.lastName,
        email: this.newUser.email,
        phoneNumber: this.newUser.phoneNumber ? Number(this.newUser.phoneNumber) : null,
        cin: this.newUser.cin || null,
        address: this.newUser.address || null,
        city: this.newUser.city || null,
        role: this.newUser.role,
      };
      if (this.newUser.password) {
        payload.password = this.newUser.password;
      }
      if (this.newUser.role === 'AGENT') {
        payload.agenceCode = this.newUser.agenceCode ? Number(this.newUser.agenceCode) : null;
        payload.region = this.newUser.region ? Number(this.newUser.region) : null;
      } else if (this.newUser.role === 'INSURER') {
        payload.insurerName = this.newUser.insurerName;
        payload.insurerEmail = this.newUser.insurerEmail;
      }
      this.http.put(`${this.API}/users/${this.editingUserId}`, payload).subscribe({
        next: () => {
          this.addUserLoading = false;
          this.showUserModal = false;
          this.cdr.detectChanges();
          setTimeout(() => this.loadUsers(), 0);
        },
        error: (err: any) => {
          this.addUserLoading = false;
          this.addUserError = err.error?.message || 'Erreur lors de la mise à jour.';
          this.cdr.detectChanges();
        }
      });
    } else {
      // CREATE — uses /api/users/register (no JWT generation, password hashed server-side)
      const payload: any = {
        firstName: this.newUser.firstName,
        lastName: this.newUser.lastName,
        email: this.newUser.email,
        password: this.newUser.password,
        role: this.newUser.role,
        phoneNumber: this.newUser.phoneNumber ? Number(this.newUser.phoneNumber) : null,
        cin: this.newUser.cin || null,
        address: this.newUser.address || null,
        city: this.newUser.city || null,
      };
      if (this.newUser.role === 'AGENT') {
        payload.agenceCode = this.newUser.agenceCode ? Number(this.newUser.agenceCode) : null;
        payload.region = this.newUser.region ? Number(this.newUser.region) : null;
      } else if (this.newUser.role === 'INSURER') {
        payload.insurerName = this.newUser.insurerName;
        payload.insurerEmail = this.newUser.insurerEmail;
      }
      console.log('[ADMIN] Creating user with payload:', JSON.stringify(payload));
      this.http.post(`${this.API}/users/register`, payload).subscribe({
        next: (res) => {
          console.log('[ADMIN] User created successfully:', res);
          this.addUserLoading = false;
          this.showUserModal = false;
          this.cdr.detectChanges();
          setTimeout(() => this.loadUsers(), 0);
        },
        error: (err: any) => {
          console.error('[ADMIN] Create user error:', err);
          this.addUserLoading = false;
          this.addUserError = err.error?.message || err.error || err.message || 'Erreur lors de la création.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  /* Delete */
  deleteUser(id: number): void {
    this.http.delete(`${this.API}/users/${id}`).subscribe({
      next: () => this.loadUsers(),
      error: (err: any) => console.error('[ADMIN] Delete error:', err)
    });
  }

  getUserInitials(user: any): string {
    return ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase();
  }

}
