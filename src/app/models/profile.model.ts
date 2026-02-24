/**
 * Profile & common – static UI models (MVVM).
 */
export interface ProfileUser {
  avatarUrl: string;
  fullName: string;
  email: string;
  role: string;
  roleClass: string;
  tier: string;
  tierClass: string;
  score: string;
}

export interface ProfilePersonal {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  cin: string;
}

export interface ProfileAddress {
  street: string;
  city: string;
  localisation: string;
}

/** KYC verification step (identity, address, income, selfie). */
export interface KycVerificationStep {
  title: string;
  subtitle: string;
  icon: string;
  bgClass: string;
  borderClass: string;
  iconBgClass: string;
  titleClass: string;
  subtitleClass: string;
}

/** KYC uploaded document row. */
export interface KycDocumentItem {
  title: string;
  detail: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  statusLabel?: string;
  statusClass?: string;
  isMissing?: boolean;
  uploadLabel?: string;
}

/** Login history summary card. */
export interface LoginSummaryCard {
  label: string;
  value: string;
  subValue?: string;
  valueClass?: string;
  borderClass?: string;
}

/** Login log table row. */
export interface LoginLogRow {
  dateTime: string;
  device: string;
  deviceIcon: string;
  deviceIconClass: string;
  ip: string;
  ipClass?: string;
  location: string;
  status: string;
  statusClass: string;
  rowClass?: string;
}
