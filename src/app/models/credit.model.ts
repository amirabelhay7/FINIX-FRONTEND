/**
 * Credit module – static UI models (MVVM).
 */
export interface LoanRequest {
  id: number;
  amount: string;
  duration: string;
  status: 'approved' | 'pending' | 'rejected';
  submittedAt: string;
  note: string;
  actionRoute?: string;
  actionLabel: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
}

export interface LoanSummary {
  activeContracts: number;
  pendingRequests: number;
  totalBorrowed: string;
}

export interface ActiveContractSummary {
  contractNumber: string;
  amount: string;
  duration: string;
  rate: string;
  nextPaymentDate: string;
  nextPaymentAmount: string;
  contractRoute: string;
}

export interface CreditDurationOption {
  value: number;
  label: string;
  selected?: boolean;
}

export interface UpcomingPaymentRow {
  date: string;
  subtitle: string;
  amount: string;
  isNext: boolean;
}

export interface ApplicationStep {
  title: string;
  subtitle: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  isActive: boolean;
  isDone: boolean;
  linkRoute?: string;
  linkLabel?: string;
}

export interface ContractTermItem {
  label: string;
  value: string;
}

export interface ContractDocumentRow {
  title: string;
  uploadedAt: string;
}

/* ===== BACKEND REQUEST LOAN MODELS ===== */

export interface RequestLoanDto {
  idDemande: number;
  montantDemande: number;
  apportPersonnel: number;
  dureeMois: number;
  mensualiteEstimee: number;
  objectifCredit: string;
  dateCreation: string;
  dateSoumission: string;
  dateDecision: string;
  statutDemande: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONDITIONAL';
  userId?: number;
  vehiculeId?: number;

  // "Joined" fields returned by the backend.
  // Your API returns: user.firstName/lastName and vehicle.marque/modele/prixTnd.
  user?: { firstName: string; lastName: string; email?: string };

  vehicle?: { marque: string; modele: string; prixTnd: number };

  // Backward-compatible optional aliases (in case some endpoints use different naming).
  userEmail?: string;
  vehicule?: { marque: string; modele: string; prix_tnd: number };
  // Flat alternatives (in case backend sends them without nesting)
  vehiculeMarque?: string;
  vehiculeModele?: string;
  vehiculePrixTnd?: number;
  prix_tnd?: number;
  marque?: string;
  modele?: string;
  prixTnd?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateRequestLoanPayload {
  montantDemande: number;
  apportPersonnel: number;
  dureeMois: number;
  mensualiteEstimee: number;
  objectifCredit: string;
  statutDemande: 'PENDING';
  userId: number;
  vehiculeId: number;
  dateCreation?: string;
}

/** Corps optionnel pour POST approve / reject (si le backend accepte une note). */
export interface RequestLoanDecisionPayload {
  note?: string;
}
