import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Credit } from '../../services/credit/credit.service';
import { RequestLoanDto, PageResponse } from '../../models/credit.model';
import { finalize } from 'rxjs';
import { CreateEventPayload, EventDto, EventPageResponse, EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';

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
}

@Component({
  selector: 'app-backoffice',
  standalone: false,
  templateUrl: './backoffice.component.html',
  styleUrls: ['./backoffice.component.css']
})
export class BackofficeComponent implements OnInit, OnDestroy {
  selectedPage = 'dashboard';
  currentTheme: 'light' | 'dark' = 'dark';
  hover = false;
  showModal = false;
  decisionNote = '';
  private ignoreNextOverlayClose = false;
  private readonly themeStorageKey = 'finix_theme';

  requestLoans: RequestLoanDto[] = [];
  loansLoading = false;
  loansError = '';

  decisionSubmitting = false;
  decisionError = '';

  showEventModal = false;
  isCreatingEvent = false;
  eventCreateError = '';
  eventCreateSuccess = '';
  hasRegistrationFee = false;
  events: EventDto[] = [];
  eventsLoading = false;
  eventsError = '';

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
    paidEvent: false,
    registrationFee: 0,
    imageUrl: '',
    externalUrl: '',
    status: 'PUBLISHED',
    publicEvent: true,
    userId: 0,
  };

  constructor(
    private creditService: Credit,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    this.currentTheme = this.readSavedTheme();
    this.applyTheme(this.currentTheme);
    this.loadRequestLoans();
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(document.documentElement, 'data-theme');
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
    this.events = [];
    this.eventService
      .getEvents(page, size)
      .pipe(finalize(() => (this.eventsLoading = false)))
      .subscribe({
        next: (response: EventPageResponse) => {
          this.events = Array.isArray(response?.content) ? response.content : [];
        },
        error: () => {
          this.eventsError = 'Impossible de charger les événements.';
        },
      });
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
        },
        error: (error: unknown) => {
          console.error('Error while loading request loans', error);
          this.loansError = 'Impossible de charger les demandes de crédit.';
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
      const fullName = `${firstName} ${lastName}`.trim() || 'Client inconnu';
      const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase() || 'NA';
      return {
        ref: `#CR-${loan.idDemande}`,
        initials,
        client: fullName,
        clientSince: 'Source: base de donnees',
        type: loan.objectifCredit || 'N/A',
        amount: `${loan.montantDemande ?? 0} TND`,
        score: 'N/A',
        scoreColor: '#64748B',
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
        title: 'New',
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
            `Demande #${loan.idDemande}`,
          ref: `#CR-${loan.idDemande}`,
          amount: `${loan.montantDemande ?? 0} TND`,
          type: loan.objectifCredit || 'N/A',
          warn: this.isOlderThan48h(loan.dateCreation),
        })),
      },
      {
        title: 'Analysis',
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
            `Demande #${loan.idDemande}`,
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
      name: `${loan.user?.firstName ?? ''} ${loan.user?.lastName ?? ''}`.trim() || 'Client inconnu',
      clientInfo: 'Source: base de donnees',
      type: loan.objectifCredit || 'N/A',
      amount: `${loan.montantDemande ?? 0} TND`,
      duration: `${loan.dureeMois ?? 0} months`,
      score: 0,
      debtRatio: 0,
      seniority: 'N/A',
      recommendation: 'To analyze',
    }));
  }




  goCredits() {
    this.onPageChange('credits');
  }

  openCreateEventModal(): void {
    this.resetEventForm();
    this.showEventModal = true;
  }

  closeCreateEventModal(resetMessages = true): void {
    this.showEventModal = false;
    if (resetMessages) {
      this.eventCreateError = '';
      this.eventCreateSuccess = '';
    }
    this.isCreatingEvent = false;
  }

  onPaidEventToggle(checked: boolean): void {
    this.eventForm.paidEvent = checked;
    if (!checked) {
      this.hasRegistrationFee = false;
      this.eventForm.registrationFee = 0;
    }
  }

  onRegistrationFeeToggle(checked: boolean): void {
    this.hasRegistrationFee = checked;
    if (checked) {
      this.eventForm.paidEvent = true;
      if (!this.eventForm.registrationFee) {
        this.eventForm.registrationFee = 1;
      }
    } else {
      this.eventForm.registrationFee = 0;
      this.eventForm.paidEvent = false;
    }
  }

  createEvent(): void {
    const userId = this.getConnectedUserId();
    if (!userId) {
      this.eventCreateError = 'Utilisateur connecté introuvable.';
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
      paidEvent: this.eventForm.paidEvent,
      registrationFee: this.hasRegistrationFee ? Number(this.eventForm.registrationFee) || 0 : 0,
      imageUrl: this.eventForm.imageUrl.trim(),
      externalUrl: this.eventForm.externalUrl.trim(),
      status: this.eventForm.status || 'PUBLISHED',
      publicEvent: this.eventForm.publicEvent,
      userId,
    };

    if (!payload.title || !payload.city || !payload.address || !payload.startDate || !payload.endDate) {
      this.isCreatingEvent = false;
      this.eventCreateError = 'Veuillez remplir les champs obligatoires.';
      return;
    }

    this.eventService
      .createEvent(payload)
      .pipe(finalize(() => (this.isCreatingEvent = false)))
      .subscribe({
        next: () => {
          this.eventCreateSuccess = 'Evenement créé avec succès.';
          this.closeCreateEventModal(false);
          this.loadEvents();
        },
        error: (err: any) => {
          if (err?.status === 403) {
            this.eventCreateError = 'Accès refusé par le backend pour la création d’événement.';
            return;
          }
          this.eventCreateError = err?.error?.message || "Echec de la création de l'evenement.";
        },
      });
  }

  private resetEventForm(): void {
    this.hasRegistrationFee = false;
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
      paidEvent: false,
      registrationFee: 0,
      imageUrl: '',
      externalUrl: '',
      status: 'PUBLISHED',
      publicEvent: true,
      userId: this.getConnectedUserId() || 0,
    };
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



  selectedFile: (RequestLoanDto & { vehicle?: any; vehicule?: any; user?: any }) | null = null;

  openModal(file: RequestLoanDto | PipelineCard | DossierItem | AnalysisFileItem | Record<string, unknown>): void {
    this.selectedFile = file as (RequestLoanDto & { vehicle?: any; vehicule?: any; user?: any }) | null;
    this.decisionNote = '';
    this.decisionError = '';
    this.ignoreNextOverlayClose = true;
    this.showModal = true;
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
            this.decisionError = "Impossible d'approuver la demande.";
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
            this.decisionError = 'Impossible de rejeter la demande.';
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

  /** Fermeture du modal sans être bloquée par ignoreNextOverlayClose (dossiers mock hors API). */
  private closeDecisionModalUi(): void {
    this.ignoreNextOverlayClose = false;
    this.showModal = false;
  }

  requestMoreInfo() {
    console.log("More info requested", this.decisionNote);
  }

  onLogout(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
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

}





