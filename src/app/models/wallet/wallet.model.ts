/**
 * Wallet (backend module).
 */

/** API response: wallet from backend */
export interface WalletApi {
  id: number;
  balance: number;
  currency: string;
  accountNumber: string;
  isActive: boolean;
  clientEmail: string;
}

/** API response: single transaction from backend */
export interface TransactionApi {
  id: number;
  amount: number;
  transactionType: string;
  status: string;
  description: string;
  transactionDate: string;
  referenceNumber: string;
}

/** API request: deposit / withdraw / transfer / agent top-up */
export interface TransactionRequestApi {
  amount: number;
  description?: string;
  targetEmail?: string;
}

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
  id?: number;
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
  /** Optional: timestamp (ms) for date-range filtering */
  dateMs?: number;
}

export interface WalletFormOption {
  value: string;
  label: string;
}

export interface AgentLocation {
  name: string;
  address: string;
  distance: string;
  distanceClass: string;
}

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
