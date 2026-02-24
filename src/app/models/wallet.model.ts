/**
 * Wallet module – static UI models (MVVM).
 */
export interface WalletBalance {
  amountWhole: string;
  amountDecimals: string;
  currency: string;
  inflow30d: string;
  outflow30d: string;
  accountMask: string;
}

export interface QuickAction {
  title: string;
  description: string;
  route: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
}

export interface WalletTransaction {
  title: string;
  subtitle: string;
  amount: string;
  amountPositive: boolean;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
}

export interface TransactionsPageKpis {
  totalIn: string;
  totalOut: string;
  net: string;
  count: string;
  countLabel?: string;
}

export interface TransactionRow {
  ref: string;
  type: string;
  typeClass: string;
  description: string;
  amount: string;
  amountPositive: boolean;
  status: string;
  statusDotClass: string;
  statusTextClass: string;
  date: string;
}

/** Form option for payment/withdrawal method. */
export interface WalletFormOption {
  value: string;
  label: string;
}

/** Agent location for top-up. */
export interface AgentLocation {
  name: string;
  address: string;
  distance: string;
  distanceClass: string;
}

/** Transaction detail (single view). */
export interface TransactionDetailData {
  pageTitle: string;
  refLabel: string;
  type: string;
  amount: string;
  date: string;
  status: string;
  statusClass: string;
  reference: string;
}
