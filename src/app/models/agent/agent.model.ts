/**
 * Agent (backend module).
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

export interface AgentVerificationRow {
  name: string;
  meta: string;
}

export interface ClientDetailProfileItem {
  label: string;
  value: string;
  valueClass?: string;
}

export interface ClientDetailLoanRow {
  label: string;
  amount: string;
  status: string;
  statusClass: string;
}
