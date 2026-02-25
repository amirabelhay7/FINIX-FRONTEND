/**
 * Admin (backend module).
 */
export interface AdminHubCard {
  title: string;
  subtitle: string;
  route: string;
  icon: string;
  iconColorClass?: string;
}

export interface TreasuryRow {
  id: number;
  account: string;
  balance: string;
}

export interface WalletAdminRow {
  id: number;
  account: string;
  clientEmail: string;
  balance: string;
  status: string;
  statusClass: string;
  viewRoute: string;
}

export interface IndicatorKpi {
  label: string;
  value: string;
  valueClass?: string;
}

export interface SimulationRow {
  id: number;
  name: string;
  created: string;
}

export interface PaymentAdminRow {
  id: number;
  method: string;
  amount: string;
  remaining: string;
  date: string;
  status: string;
  statusClass: string;
  viewRoute: string;
}

export interface AdminScheduleRow {
  id: number;
  totalAmount: string;
  status: string;
  statusClass: string;
  created: string;
  viewRoute: string;
}

export interface AdminDelinquencyRow {
  id: number;
  riskLevel: string;
  riskClass: string;
  category: string;
  status: string;
  statusClass: string;
  opened: string;
  viewRoute: string;
}

export interface AdminFilterOption {
  value: string;
  label: string;
}

export interface AdminGraceRow {
  id: number;
  graceDays: number;
  startEnd: string;
  type: string;
  status: string;
  statusClass: string;
  viewRoute: string;
}

export interface AdminRecoveryRow {
  id: number;
  actionType: string;
  result: string;
  resultClass: string;
  description: string;
  date: string;
  viewRoute: string;
}

export interface AdminPenaltyRow {
  id: number;
  amount: string;
  status: string;
  statusClass: string;
  viewRoute: string;
}

export interface AdminPaymentDetailData {
  pageTitle: string;
  pageSubtitle: string;
  backRoute: string;
  id: string;
  method: string;
  amountPaid: string;
  remainingAmount: string;
  paymentDate: string;
  status: string;
  statusClass: string;
  linkedDelinquency: string;
  linkedRecovery: string;
  backToListRoute: string;
  backToListLabel: string;
}

export interface AdminVehicleRow {
  id: number;
  makeModel: string;
  vin: string;
  status: string;
  statusClass: string;
  viewRoute: string;
}

export interface AdminDeliveryRow {
  id: number;
  vehicle: string;
  seller: string;
  status: string;
  statusClass: string;
  viewRoute: string;
}

export interface AdminClaimRow {
  id: number;
  policy: string;
  amount: string;
  status: string;
  statusClass: string;
  actionLabel: string;
  viewRoute: string;
}

export interface AdminPolicyRow {
  id: number;
  client: string;
  product: string;
  status: string;
  statusClass: string;
  viewRoute: string;
}

export interface AdminInsuranceProductRow {
  id: number;
  name: string;
  type: string;
  premium: string;
  editRoute: string;
}

export interface AdminScoringRuleRow {
  id: number;
  ruleName: string;
  type: string;
  points: string;
  status: string;
  statusClass: string;
  editRoute: string;
  actionLabel: string;
  actionButtonClass: string;
}

export interface AdminTierRow {
  id: number;
  tierName: string;
  scoreRange: string;
  status: string;
  statusClass: string;
  editRoute: string;
}

export interface AdminTutorialRow {
  id: number;
  title: string;
  type: string;
  points: string;
  difficulty: string;
  difficultyClass: string;
  estMin: number;
  editRoute: string;
}

export interface AdminAchievementRow {
  id: number;
  title: string;
  type: string;
  points: string;
  status: string;
  statusClass: string;
  editRoute: string;
}

export interface AdminGuaranteeRow {
  id: number;
  guarantor: string;
  beneficiary: string;
  points: string;
  created: string;
  accepted: string;
  acceptedClass: string;
  viewRoute: string;
}

export interface AdminWalletDetailData {
  backRoute: string;
  pageTitle: string;
  pageSubtitle: string;
  status: string;
  statusClass: string;
  balanceLabel: string;
  balance: string;
  currencyLabel: string;
  currency: string;
  accountLabel: string;
  accountNumber: string;
  recentTitle: string;
  viewAllRoute: string;
  viewAllLabel: string;
  recentTransactions: AdminWalletRecentTx[];
}

export interface AdminWalletRecentTx {
  title: string;
  subtitle: string;
  amount: string;
  amountClass: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  route: string;
}

export interface AdminTransactionLedgerRow {
  id: number;
  ref: string;
  type: string;
  amount: string;
  amountClass: string;
  status: string;
  statusClass: string;
  date: string;
  viewRoute: string;
}

export interface AdminTransactionDetailData {
  backRoute: string;
  pageTitle: string;
  pageSubtitle: string;
  fields: { label: string; value: string; valueClass?: string; isBadge?: boolean }[];
}

export interface AdminUserDetailData {
  backRoute: string;
  pageTitle: string;
  pageSubtitle: string;
  editLabel: string;
  editRoute: string;
  identityTitle: string;
  identityFields: { label: string; value: string; valueClass?: string }[];
  loginHistoryTitle: string;
  loginHistoryItems: { date: string; ip: string }[];
}

export interface AdminUserFormLabels {
  pageTitle: string;
  backRoute: string;
  labelFirstName: string;
  labelLastName: string;
  labelEmail: string;
  labelPhone: string;
  labelCin: string;
  labelRole: string;
  labelAddress: string;
  labelCity: string;
  saveLabel: string;
  cancelLabel: string;
  cancelRoute: string;
  roleOptions: AdminFilterOption[];
}
