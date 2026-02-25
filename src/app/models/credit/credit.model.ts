/**
 * Credit (backend module).
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
