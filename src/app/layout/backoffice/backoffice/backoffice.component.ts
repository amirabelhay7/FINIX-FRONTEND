import { Component } from '@angular/core';

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

})
export class BackofficeComponent {
  selectedPage = 'dashboard';
  hover = false;
  showModal = false;
  decisionNote = '';

  onPageChange(page: string) {
    this.selectedPage = page;
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




}
