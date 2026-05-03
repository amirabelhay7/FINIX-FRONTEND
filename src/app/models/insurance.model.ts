
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

/** Select option for quote/claim forms. */
export interface InsuranceOption {
  value: string;
  label: string;
}

/** Claim row for my-claims list. */
export interface ClaimRow {
  id: number;
  policy: string;
  amount: string;
  status: string;
  statusClass: string;
  date: string;
  viewRoute: string;
}

/** Policy detail key-value. */
export interface PolicyDetailItem {
  label: string;
  value: string;
}

/* ========== Backend DTOs (/api/insurance) ========== */

export type ProductStatusDto = 'ACTIVE' | 'AVAILABLE' | 'PENDING_APPROVAL';
export type PolicyStatusDto = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
export type PaymentFrequencyDto = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type QuoteStatusDto = 'DRAFT' | 'ISSUED' | 'EXPIRED';
export type SubscriptionStatusDto = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type InsurancePartnerStatusDto = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type InsuranceCreditRequestStatusDto = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

/** Vehicle category for pricing / eligibility (matches backend). */
export type VehicleTypeDto = 'CAR' | 'MOTORCYCLE' | 'TRUCK';
export type UsageTypeDto = 'PRIVATE' | 'COMMERCIAL';

export interface InsurancePartnerDto {
  id: number;
  companyName: string;
  commissionPct: number;
  rating: number | null;
  totalPoliciesSold: number;
  contactPhone: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  status: InsurancePartnerStatusDto;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsurancePartnerRequestDto {
  companyName: string;
  commissionPct: number;
  rating?: number | null;
  totalPoliciesSold?: number | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  logoUrl?: string | null;
  status: InsurancePartnerStatusDto;
}

export interface ProductCoverageRuleDto {
  id: number;
  insuranceProductId: number;
  insuranceProductName: string;
  coverageId: number;
  coverageCode: string;
  coveragePct: number;
  deductibleAmount: number | null;
  limitAmount: number | null;
  ruleCode: string | null;
  ruleDescription: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoverageRequestDto {
  code: string;
  name: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface InsuranceProductDto {
  id: number;
  name: string;
  description: string | null;
  conditionsPdfUrl: string | null;
  status: ProductStatusDto;
  popular: boolean;
  recommended: boolean;
  baseRatePct: number;
  partnerId: number;
  partnerCompanyName: string;
  /** Empty = all vehicle types allowed. */
  allowedVehicleTypes: VehicleTypeDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InsuranceProductRequestDto {
  name: string;
  description?: string | null;
  conditionsPdfUrl?: string | null;
  status: ProductStatusDto;
  popular: boolean;
  recommended: boolean;
  baseRatePct: number;
  partnerId: number;
  allowedVehicleTypes?: VehicleTypeDto[] | null;
}

export interface QuoteRequestDto {
  insuranceProductId: number;
  vehicleType: VehicleTypeDto;
  vehiclePrice: number;
  estimatedVehicleValue: number;
  vehicleAgeYears: number;
  durationMonths: number;
  usageType?: UsageTypeDto | null;
  status: QuoteStatusDto;
}

export interface QuoteDto {
  id: number;
  insuranceProductId: number;
  insuranceProductName: string;
  vehicleType: VehicleTypeDto;
  vehiclePrice: number;
  estimatedVehicleValue: number;
  vehicleAgeYears: number;
  durationMonths: number;
  usageType: UsageTypeDto | null;
  estimatedPremiumTotal: number;
  pricingExplanation: string | null;
  status: QuoteStatusDto;
  createdAt?: string;
  updatedAt?: string;
}

export interface CoverageSimulationRequestDto {
  insuranceProductId: number;
  vehicleType: VehicleTypeDto;
  vehiclePrice: number;
  estimatedVehicleValue: number;
  vehicleAgeYears: number;
  durationMonths: number;
  paymentFrequency: PaymentFrequencyDto;
  usageType?: UsageTypeDto | null;
  currencyCode?: string | null;
}

export interface CoverageSimulationDto {
  id: number;
  insuranceProductId: number;
  insuranceProductName: string;
  vehicleType: VehicleTypeDto;
  vehiclePrice: number;
  estimatedVehicleValue: number;
  vehicleAgeYears: number;
  durationMonths: number;
  paymentFrequency: PaymentFrequencyDto;
  usageType: UsageTypeDto | null;
  estimatedPremiumTotal: number;
  estimatedInstallmentAmount: number;
  currencyCode: string;
  pricingExplanation: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsurancePolicyDto {
  id: number;
  policySubscriptionId: number;
  insuranceProductId: number;
  insuranceProductName: string;
  partnerCompanyName: string;
  policyNumber: string;
  effectiveDate: string;
  expirationDate: string;
  premiumTotal: number;
  installmentAmount: number;
  currencyCode: string;
  cancellationAllowedUntil: string | null;
  status: PolicyStatusDto;
  paymentFrequency: PaymentFrequencyDto;
  vehicleType: VehicleTypeDto | null;
  subscriptionDurationMonths: number | null;
  daysRemaining: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsurancePolicyRequestDto {
  policySubscriptionId: number;
  policyNumber: string;
  effectiveDate: string;
  expirationDate: string;
  premiumTotal: number;
  installmentAmount: number;
  currencyCode?: string | null;
  cancellationAllowedUntil?: string | null;
  status: PolicyStatusDto;
}

export interface PolicySubscriptionRequestDto {
  insuranceProductId: number;
  insuranceCreditRequestId?: number | null;
  loanContractId?: number | null;
  startDate: string;
  durationMonths: number;
  paymentFrequency: PaymentFrequencyDto;
  status: SubscriptionStatusDto;
  vehicleType?: VehicleTypeDto | null;
}

export interface PolicySubscriptionDto {
  id: number;
  insuranceProductId: number;
  insuranceProductName: string;
  insuranceCreditRequestId: number | null;
  loanContractId: number | null;
  startDate: string;
  durationMonths: number;
  paymentFrequency: PaymentFrequencyDto;
  status: SubscriptionStatusDto;
  vehicleType: VehicleTypeDto | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPricingRuleDto {
  id: number;
  insuranceProductId: number;
  insuranceProductName: string;
  vehicleType: VehicleTypeDto;
  minVehicleAge: number | null;
  maxVehicleAge: number | null;
  minVehicleValue: number | null;
  maxVehicleValue: number | null;
  rateMultiplier: number;
  fixedSurcharge: number;
  eligible: boolean;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductPricingRuleRequestDto {
  insuranceProductId: number;
  vehicleType: VehicleTypeDto;
  minVehicleAge?: number | null;
  maxVehicleAge?: number | null;
  minVehicleValue?: number | null;
  maxVehicleValue?: number | null;
  rateMultiplier: number;
  fixedSurcharge: number;
  eligible: boolean;
  description?: string | null;
}

export interface VehicleTypeStatisticsDto {
  vehicleType: VehicleTypeDto;
  quoteCount: number;
  coverageSimulationCount: number;
  policyCount: number;
  totalPremiumFromQuotes: number;
  totalPremiumFromSimulations: number;
}

export interface CoverageDto {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCoverageRuleRequestDto {
  insuranceProductId: number;
  coverageId: number;
  coveragePct: number;
  deductibleAmount?: number | null;
  limitAmount?: number | null;
  ruleCode?: string | null;
  ruleDescription?: string | null;
}

export interface ClaimSimulationDto {
  id: number;
  insurancePolicyId: number;
  policyNumber: string;
  coverageId: number;
  coverageCode: string;
  incidentDate: string;
  estimatedDamageAmount: number;
  estimatedPayoutAmount: number;
  explanation: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsuranceCreditRequestCreateRequestDto {
  insuranceProductId: number;
  vehicleType: VehicleTypeDto;
  insuredValue: number;
  vehicleAgeYears: number;
  durationMonths: number;
  paymentFrequency: PaymentFrequencyDto;
  currencyCode?: string | null;
}

export interface InsuranceCreditRequestRejectRequestDto {
  rejectionReason: string;
  adminNote?: string | null;
}

export interface InsuranceCreditRequestDto {
  id: number;
  clientId: number | null;
  clientFullName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  purchasePropensityScore?: number | null;
  claimRiskScore?: number | null;
  aiDecision?: string | null;
  aiReason?: string | null;
  isAnomaly?: boolean | null;
  scoredAt?: string | null;
  insuranceProductId: number;
  insuranceProductName: string;
  partnerCompanyName: string;
  vehicleType: VehicleTypeDto;
  insuredValue: number;
  vehicleAgeYears: number;
  durationMonths: number;
  paymentFrequency: PaymentFrequencyDto;
  estimatedPremiumTotal: number;
  estimatedInstallmentAmount: number;
  currencyCode: string;
  status: InsuranceCreditRequestStatusDto;
  adminDecisionDate: string | null;
  rejectionReason: string | null;
  adminNote: string | null;
  createdAt?: string | null;
  updatedAt?: string;
  /** Backward compatibility with older backend payloads. */
  userId?: number | null;
}

/* ========== Advanced dashboard/statistics DTOs (/api/insurance/dashboard, /api/insurance/statistics) ========== */

export interface DashboardKpisDto {
  totalPolicies: number;
  activePolicies: number;
  suspendedPolicies: number;
  cancelledPolicies: number;
  expiredPolicies: number;
  expiringIn7Days: number;
  expiringIn30Days: number;
  dueIn7DaysCount: number;
  dueIn30DaysCount: number;
  overdueCount: number;
  dueIn7DaysAmount: number;
  dueIn30DaysAmount: number;
  overdueAmount: number;
  totalPremiumAmount: number;
  averagePremiumPerPolicy: number;
  totalQuoteCount: number;
  totalSubscriptionsCount: number;
  conversionRateQuotesToSubscriptionsPct: number;
  conversionRateSubscriptionsToActivePoliciesPct: number;
  totalClaimSimulations: number;
  totalEstimatedPayoutAmount: number;
  averageEstimatedPayout: number;
  payoutRatio: number;
}

export type InstallmentStatusDto = 'PENDING' | 'PAID' | 'LATE' | 'MISSED';

export interface InsuranceInstallmentDto {
  id: number;
  insurancePolicyId: number;
  policyNumber: string;
  insuranceProductName: string;
  partnerCompanyName: string;
  paymentFrequency: PaymentFrequencyDto | null;
  amountDue: number;
  dueDate: string;
  paidAmount: number | null;
  paidAt: string | null;
  status: InstallmentStatusDto;
  installmentNumber: number;
  clientFullName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RenewalPolicyRowDto {
  policyId: number;
  policyNumber: string;
  productName: string;
  expirationDate: string;
  status: PolicyStatusDto;
  premiumTotal: number;
  currencyCode: string | null;
}

export type AlertSeverityDto = 'INFO' | 'WARNING' | 'CRITICAL';

export interface DashboardAlertDto {
  code: string;
  severity: AlertSeverityDto | string;
  title: string;
  description: string;
  entityType: string;
  entityId: number | null;
}

export interface PartnerStatisticsDto {
  partnerId: number;
  companyName: string;
  productsCount: number;
  activePoliciesCount: number;
  expiringPoliciesCount: number;
  totalPremiumAmount: number;
  averagePremium: number;
  quoteCount: number;
  claimSimulationCount: number;
  totalSimulatedPayout: number;
  averagePayoutRatio: number;
}

export interface ProductStatisticsDto {
  productId: number;
  productName: string;
  partnerId: number | null;
  partnerCompanyName: string;
  quoteCount: number;
  subscriptionCount: number;
  activePoliciesCount: number;
  conversionRateQuotesToSubscriptionsPct: number;
  averagePremium: number;
  averageEstimatedInstallmentAmount: number;
  claimSimulationCount: number;
  averageEstimatedPayout: number;
}

export interface PortfolioStatisticsDto {
  totalQuoteCount: number;
  totalSubscriptionsCount: number;
  totalPoliciesCount: number;
  activePoliciesCount: number;
  conversionRateQuotesToSubscriptionsPct: number;
  conversionRateSubscriptionsToActivePoliciesPct: number;
  totalPremiumAmount: number;
  totalEstimatedPayoutAmount: number;
  payoutRatio: number;
}

export interface CoverageStatisticsDto {
  coverageId: number;
  coverageCode: string;
  coverageName: string;
  productsUsingCount: number;
  claimSimulationCount: number;
  averageEstimatedPayout: number;
}
