/**
 * Repayment module – static UI models (MVVM).
 */
export interface PaymentHistoryItem {
  contractRef: string;
  date: string;
  note: string;
  amount: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
}

export interface ScheduleSummary {
  contractNumber: string;
  totalToRepay: string;
  remaining: string;
  progress: string;
  monthly: string;
}

export interface ScheduleItem {
  label: string;
  statusNote?: string;
  amount: string;
  status: 'paid' | 'due' | 'upcoming';
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  rowBgClass?: string;
  payRoute?: string;
}

/** Payment detail view data. */
export interface PaymentDetailData {
  pageTitle: string;
  refLabel: string;
  amount: string;
  method: string;
  date: string;
  status: string;
  statusClass: string;
  installmentLabel: string;
  backRoute: string;
  backLabel: string;
}
