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

/** Option for duration select. */
export interface CreditDurationOption {
  value: number;
  label: string;
  selected?: boolean;
}

/** Upcoming payment row for active contract. */
export interface UpcomingPaymentRow {
  date: string;
  subtitle: string;
  amount: string;
  isNext: boolean;
}

/** Application pipeline step. */
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

/** Contract term key-value. */
export interface ContractTermItem {
  label: string;
  value: string;
}

/** Document row for contract detail. */
export interface ContractDocumentRow {
  title: string;
  uploadedAt: string;
}
