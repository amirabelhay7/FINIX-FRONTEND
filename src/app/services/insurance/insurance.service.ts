import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { INSURANCE_API_URL } from '../../core/api-base';
import type {
  ClaimSimulationDto,
  CoverageDto,
  CoverageRequestDto,
  CoverageSimulationDto,
  CoverageSimulationRequestDto,
  CoverageStatisticsDto,
  DashboardAlertDto,
  DashboardKpisDto,
  InsuranceInstallmentDto,
  InsurancePartnerDto,
  InsurancePartnerRequestDto,
  InsuranceCreditRequestCreateRequestDto,
  InsuranceCreditRequestDto,
  InsuranceCreditRequestRejectRequestDto,
  InsurancePolicyDto,
  InsurancePolicyRequestDto,
  InsuranceProductDto,
  InsuranceProductRequestDto,
  PartnerStatisticsDto,
  PortfolioStatisticsDto,
  ProductStatisticsDto,
  PolicySubscriptionDto,
  PolicySubscriptionRequestDto,
  ProductCoverageRuleDto,
  ProductCoverageRuleRequestDto,
  ProductPricingRuleDto,
  ProductPricingRuleRequestDto,
  QuoteDto,
  QuoteRequestDto,
  RenewalPolicyRowDto,
  VehicleTypeStatisticsDto,
  VehicleTypeDto,
} from '../../models/insurance.model';

@Injectable({ providedIn: 'root' })
export class InsuranceService {
  private readonly api = INSURANCE_API_URL;

  constructor(private readonly http: HttpClient) {}

  /* ---------- Partners (admin) ---------- */
  getPartners(): Observable<InsurancePartnerDto[]> {
    return this.http.get<InsurancePartnerDto[]>(`${this.api}/partners`);
  }

  getPartnerById(id: number): Observable<InsurancePartnerDto> {
    return this.http.get<InsurancePartnerDto>(`${this.api}/partners/${id}`);
  }

  createPartner(body: InsurancePartnerRequestDto): Observable<InsurancePartnerDto> {
    return this.http.post<InsurancePartnerDto>(`${this.api}/partners`, body);
  }

  updatePartner(id: number, body: InsurancePartnerRequestDto): Observable<InsurancePartnerDto> {
    return this.http.put<InsurancePartnerDto>(`${this.api}/partners/${id}`, body);
  }

  deletePartner(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/partners/${id}`);
  }

  /* ---------- Products ---------- */
  getProducts(params?: {
    partnerId?: number;
    status?: string;
    popular?: boolean;
    recommended?: boolean;
    vehicleType?: VehicleTypeDto;
  }): Observable<InsuranceProductDto[]> {
    let hp = new HttpParams();
    if (params?.partnerId != null) hp = hp.set('partnerId', String(params.partnerId));
    if (params?.status) hp = hp.set('status', params.status);
    if (params?.popular != null) hp = hp.set('popular', String(params.popular));
    if (params?.recommended != null) hp = hp.set('recommended', String(params.recommended));
    if (params?.vehicleType) hp = hp.set('vehicleType', params.vehicleType);
    return this.http.get<InsuranceProductDto[]>(`${this.api}/products`, { params: hp });
  }

  getProductById(id: number): Observable<InsuranceProductDto> {
    return this.http.get<InsuranceProductDto>(`${this.api}/products/${id}`);
  }

  createProduct(body: InsuranceProductRequestDto): Observable<InsuranceProductDto> {
    return this.http.post<InsuranceProductDto>(`${this.api}/products`, body);
  }

  updateProduct(id: number, body: InsuranceProductRequestDto): Observable<InsuranceProductDto> {
    return this.http.put<InsuranceProductDto>(`${this.api}/products/${id}`, body);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/products/${id}`);
  }

  /* ---------- Coverages ---------- */
  getCoverages(): Observable<CoverageDto[]> {
    return this.http.get<CoverageDto[]>(`${this.api}/coverages`);
  }

  getCoverageById(id: number): Observable<CoverageDto> {
    return this.http.get<CoverageDto>(`${this.api}/coverages/${id}`);
  }

  createCoverage(body: CoverageRequestDto): Observable<CoverageDto> {
    return this.http.post<CoverageDto>(`${this.api}/coverages`, body);
  }

  updateCoverage(id: number, body: CoverageRequestDto): Observable<CoverageDto> {
    return this.http.put<CoverageDto>(`${this.api}/coverages/${id}`, body);
  }

  deleteCoverage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/coverages/${id}`);
  }

  /* ---------- Product coverage rules ---------- */
  getProductCoverageRules(productId?: number, coverageId?: number): Observable<ProductCoverageRuleDto[]> {
    let hp = new HttpParams();
    if (productId != null) hp = hp.set('productId', String(productId));
    if (coverageId != null) hp = hp.set('coverageId', String(coverageId));
    return this.http.get<ProductCoverageRuleDto[]>(`${this.api}/product-coverage-rules`, { params: hp });
  }

  getProductCoverageRuleById(id: number): Observable<ProductCoverageRuleDto> {
    return this.http.get<ProductCoverageRuleDto>(`${this.api}/product-coverage-rules/${id}`);
  }

  createProductCoverageRule(body: ProductCoverageRuleRequestDto): Observable<ProductCoverageRuleDto> {
    return this.http.post<ProductCoverageRuleDto>(`${this.api}/product-coverage-rules`, body);
  }

  updateProductCoverageRule(id: number, body: ProductCoverageRuleRequestDto): Observable<ProductCoverageRuleDto> {
    return this.http.put<ProductCoverageRuleDto>(`${this.api}/product-coverage-rules/${id}`, body);
  }

  deleteProductCoverageRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/product-coverage-rules/${id}`);
  }

  /* ---------- Quotes ---------- */
  createQuote(body: QuoteRequestDto): Observable<QuoteDto> {
    return this.http.post<QuoteDto>(`${this.api}/quotes`, body);
  }

  /* ---------- Policies / subscriptions ---------- */
  getPolicies(): Observable<InsurancePolicyDto[]> {
    return this.http.get<InsurancePolicyDto[]>(`${this.api}/policies`);
  }

  /** Front-office: current user’s policies only (JWT). */
  getMyPolicies(): Observable<InsurancePolicyDto[]> {
    return this.http.get<InsurancePolicyDto[]>(`${this.api}/me/policies`);
  }

  getPolicyById(id: number): Observable<InsurancePolicyDto> {
    return this.http.get<InsurancePolicyDto>(`${this.api}/policies/${id}`);
  }

  /** Front-office: one policy if it belongs to the current user (JWT). */
  getMyPolicyById(id: number): Observable<InsurancePolicyDto> {
    return this.http.get<InsurancePolicyDto>(`${this.api}/me/policies/${id}`);
  }

  getPolicyInstallments(policyId: number): Observable<InsuranceInstallmentDto[]> {
    return this.http.get<InsuranceInstallmentDto[]>(`${this.api}/installments/policy/${policyId}`);
  }

  createPolicySubscription(body: PolicySubscriptionRequestDto): Observable<PolicySubscriptionDto> {
    return this.http.post<PolicySubscriptionDto>(`${this.api}/policy-subscriptions`, body);
  }

  createPolicy(body: InsurancePolicyRequestDto): Observable<InsurancePolicyDto> {
    return this.http.post<InsurancePolicyDto>(`${this.api}/policies`, body);
  }

  /* ---------- Insurance credit requests ---------- */
  createMyCreditRequest(body: InsuranceCreditRequestCreateRequestDto): Observable<InsuranceCreditRequestDto> {
    return this.http.post<InsuranceCreditRequestDto>(`${this.api}/me/credit-requests`, body);
  }

  getMyCreditRequests(): Observable<InsuranceCreditRequestDto[]> {
    return this.http.get<InsuranceCreditRequestDto[]>(`${this.api}/me/credit-requests`);
  }

  getMyCreditRequestById(id: number): Observable<InsuranceCreditRequestDto> {
    return this.http.get<InsuranceCreditRequestDto>(`${this.api}/me/credit-requests/${id}`);
  }

  cancelMyCreditRequest(id: number): Observable<InsuranceCreditRequestDto> {
    return this.http.put<InsuranceCreditRequestDto>(`${this.api}/me/credit-requests/${id}/cancel`, {});
  }

  getCreditRequests(): Observable<InsuranceCreditRequestDto[]> {
    return this.http.get<InsuranceCreditRequestDto[]>(`${this.api}/credit-requests`);
  }

  getCreditRequestById(id: number): Observable<InsuranceCreditRequestDto> {
    return this.http.get<InsuranceCreditRequestDto>(`${this.api}/credit-requests/${id}`);
  }

  approveCreditRequest(id: number): Observable<InsuranceCreditRequestDto> {
    return this.http.put<InsuranceCreditRequestDto>(`${this.api}/credit-requests/${id}/approve`, {});
  }

  rejectCreditRequest(id: number, body: InsuranceCreditRequestRejectRequestDto): Observable<InsuranceCreditRequestDto> {
    return this.http.put<InsuranceCreditRequestDto>(`${this.api}/credit-requests/${id}/reject`, body);
  }

  /* ---------- Simulations ---------- */
  createCoverageSimulation(body: CoverageSimulationRequestDto): Observable<CoverageSimulationDto> {
    return this.http.post<CoverageSimulationDto>(`${this.api}/coverage-simulations`, body);
  }

  createClaimSimulation(body: {
    insurancePolicyId: number;
    coverageId: number;
    incidentDate: string;
    estimatedDamageAmount: number;
  }): Observable<ClaimSimulationDto> {
    return this.http.post<ClaimSimulationDto>(`${this.api}/claim-simulations`, body);
  }

  /** Front-office: creates a simulation only for a policy owned by the current user (JWT). */
  createMyClaimSimulation(body: {
    insurancePolicyId: number;
    coverageId: number;
    incidentDate: string;
    estimatedDamageAmount: number;
  }): Observable<ClaimSimulationDto> {
    return this.http.post<ClaimSimulationDto>(`${this.api}/me/claim-simulations`, body);
  }

  getClaimSimulations(insurancePolicyId?: number): Observable<ClaimSimulationDto[]> {
    let hp = new HttpParams();
    if (insurancePolicyId != null) hp = hp.set('insurancePolicyId', String(insurancePolicyId));
    return this.http.get<ClaimSimulationDto[]>(`${this.api}/claim-simulations`, { params: hp });
  }

  getMyClaimSimulations(insurancePolicyId?: number): Observable<ClaimSimulationDto[]> {
    let hp = new HttpParams();
    if (insurancePolicyId != null) hp = hp.set('insurancePolicyId', String(insurancePolicyId));
    return this.http.get<ClaimSimulationDto[]>(`${this.api}/me/claim-simulations`, { params: hp });
  }

  getClaimSimulationById(id: number): Observable<ClaimSimulationDto> {
    return this.http.get<ClaimSimulationDto>(`${this.api}/claim-simulations/${id}`);
  }

  getMyClaimSimulationById(id: number): Observable<ClaimSimulationDto> {
    return this.http.get<ClaimSimulationDto>(`${this.api}/me/claim-simulations/${id}`);
  }

  /* ---------- Dashboard / renewals / alerts ---------- */
  getDashboardKpis(): Observable<DashboardKpisDto> {
    return this.http.get<DashboardKpisDto>(`${this.api}/dashboard/kpis`);
  }

  getRenewals(days: number): Observable<RenewalPolicyRowDto[]> {
    const hp = new HttpParams().set('days', String(days));
    return this.http.get<RenewalPolicyRowDto[]>(`${this.api}/dashboard/renewals`, { params: hp });
  }

  getDashboardAlerts(): Observable<DashboardAlertDto[]> {
    return this.http.get<DashboardAlertDto[]>(`${this.api}/dashboard/alerts`);
  }

  /* ---------- Installments (admin monitoring) ---------- */
  getInstallmentsDueSoon(days = 7): Observable<InsuranceInstallmentDto[]> {
    const hp = new HttpParams().set('days', String(days));
    return this.http.get<InsuranceInstallmentDto[]>(`${this.api}/installments/due-soon`, { params: hp });
  }

  getOverdueInstallments(): Observable<InsuranceInstallmentDto[]> {
    return this.http.get<InsuranceInstallmentDto[]>(`${this.api}/installments/overdue`);
  }

  markInstallmentPaid(id: number, paidAmount?: number | null): Observable<InsuranceInstallmentDto> {
    return this.http.put<InsuranceInstallmentDto>(`${this.api}/installments/${id}/mark-paid`, { paidAmount: paidAmount ?? null });
  }

  markInstallmentMissed(id: number): Observable<InsuranceInstallmentDto> {
    return this.http.put<InsuranceInstallmentDto>(`${this.api}/installments/${id}/mark-missed`, {});
  }

  generateMissingInstallments(): Observable<string> {
    return this.http.post(`${this.api}/installments/generate-missing`, {}, { responseType: 'text' as const });
  }

  /* ---------- Statistics ---------- */
  getPartnerStatistics(): Observable<PartnerStatisticsDto[]> {
    return this.http.get<PartnerStatisticsDto[]>(`${this.api}/statistics/partners`);
  }

  getProductStatistics(): Observable<ProductStatisticsDto[]> {
    return this.http.get<ProductStatisticsDto[]>(`${this.api}/statistics/products`);
  }

  getPortfolioStatistics(): Observable<PortfolioStatisticsDto> {
    return this.http.get<PortfolioStatisticsDto>(`${this.api}/statistics/portfolio`);
  }

  getCoverageStatistics(): Observable<CoverageStatisticsDto[]> {
    return this.http.get<CoverageStatisticsDto[]>(`${this.api}/statistics/coverages`);
  }

  getVehicleTypeStatistics(): Observable<VehicleTypeStatisticsDto[]> {
    return this.http.get<VehicleTypeStatisticsDto[]>(`${this.api}/statistics/by-vehicle-type`);
  }

  /* ---------- Product pricing rules (admin) ---------- */
  getProductPricingRules(productId: number): Observable<ProductPricingRuleDto[]> {
    const hp = new HttpParams().set('productId', String(productId));
    return this.http.get<ProductPricingRuleDto[]>(`${this.api}/product-pricing-rules`, { params: hp });
  }

  createProductPricingRule(body: ProductPricingRuleRequestDto): Observable<ProductPricingRuleDto> {
    return this.http.post<ProductPricingRuleDto>(`${this.api}/product-pricing-rules`, body);
  }

  updateProductPricingRule(id: number, body: ProductPricingRuleRequestDto): Observable<ProductPricingRuleDto> {
    return this.http.put<ProductPricingRuleDto>(`${this.api}/product-pricing-rules/${id}`, body);
  }

  deleteProductPricingRule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/product-pricing-rules/${id}`);
  }

  /* ---------- Extra endpoints ---------- */
  getExpiringPolicies(days = 30): Observable<InsurancePolicyDto[]> {
    const hp = new HttpParams().set('days', String(days));
    return this.http.get<InsurancePolicyDto[]>(`${this.api}/policies/expiring`, { params: hp });
  }

  getTopExpensiveClaimSimulations(): Observable<ClaimSimulationDto[]> {
    return this.http.get<ClaimSimulationDto[]>(`${this.api}/claim-simulations/top-expensive`);
  }
}
