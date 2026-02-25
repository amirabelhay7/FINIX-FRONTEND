/**
 * Insurance (backend module).
 */
export interface InsuranceProductBadge {
  label: string;
  class: string;
}

export interface InsuranceProduct {
  id: number;
  name: string;
  description: string;
  priceNote: string;
  route: string;
  accentColor: string;
  icon: string;
  iconBgClass: string;
  iconColorClass?: string;
  badges?: InsuranceProductBadge[];
}

export interface InsurancePolicy {
  id: number;
  productName: string;
  policyNumber: string;
  detail: string;
  route: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  statusLabel?: string;
}

export interface InsuranceOption {
  value: string;
  label: string;
}

export interface ClaimRow {
  id: number;
  policy: string;
  amount: string;
  status: string;
  statusClass: string;
  date: string;
  viewRoute: string;
}

export interface PolicyDetailItem {
  label: string;
  value: string;
}
