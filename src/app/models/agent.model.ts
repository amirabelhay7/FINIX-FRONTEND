/**
 * Agent module – static UI models (MVVM).
 */
export interface AgentKpis {
  topUpsToday: string;
  verificationsPending: string;
  commissionMonth: string;
}

export interface AgentQuickAction {
  title: string;
  route: string;
  icon: string;
}

export interface AgentActivityItem {
  title: string;
  subtitle: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
}

/** Client row for agent clients list. */
export interface AgentClientRow {
  initials: string;
  initialsBgClass: string;
  initialsColorClass: string;
  name: string;
  meta: string;
  status: string;
  statusClass: string;
  actionRoute?: string;
  actionLabel?: string;
}

/** Pending verification row. */
export interface AgentVerificationRow {
  name: string;
  meta: string;
}

/** Client detail profile key-value. */
export interface ClientDetailProfileItem {
  label: string;
  value: string;
  valueClass?: string;
}

/** Client detail loan row. */
export interface ClientDetailLoanRow {
  label: string;
  amount: string;
  status: string;
  statusClass: string;
}
