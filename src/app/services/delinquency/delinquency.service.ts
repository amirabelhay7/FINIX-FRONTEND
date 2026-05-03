import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ─── DTOs Backend ────────────────────────────────────────────────────────────

export interface DelinquencyCaseDto {
  id: number;
  loanContractId: number;
  clientId: number;
  clientFullName: string;
  assignedAgentId: number | null;
  assignedAgentFullName: string | null;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  category: 'FRIENDLY' | 'PRE_LEGAL' | 'LEGAL' | 'WRITTEN_OFF';
  status: 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'PLAN_ACTIVE' | 'LEGAL' | 'RECOVERED' | 'CLOSED';
  totalOverdueAmount: number;
  totalPenaltyAmount: number;
  overdueInstallmentsCount: number;
  maxDaysOverdue: number;
  openedDate: string;
  lastEscalationDate: string | null;
  closedDate: string | null;
  closureReason: string | null;
  notes: string | null;
  recoveryActionsCount: number;
  clientDelinquencyCaseCount: number;  // historique total pour le score de risque
}

export interface RecoveryActionDto {
  id: number;
  actionType: string;
  result: string;
  description: string;
  actionDate: string;
  performedById: number | null;
  performedByFullName: string | null;
  nextActionNote: string | null;
  nextActionDate: string | null;
  delinquencyCaseId: number;
}

export interface CreateDelinquencyCaseDto {
  loanContractId: number;
  assignedAgentId?: number;
  riskLevel?: string;
  category?: string;
  status?: string;
  notes?: string;
}

export interface CreateRecoveryActionDto {
  delinquencyCaseId: number;
  actionType: string;
  result: string;
  description: string;
  nextActionNote?: string;
  nextActionDate?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class DelinquencyService {
  private readonly BASE = 'http://localhost:8081/api';
  private readonly CASE_API     = `${this.BASE}/delinquency-case`;
  private readonly RECOVERY_API = `${this.BASE}/recovery-action`;

  constructor(private http: HttpClient) {}

  // ── DelinquencyCase ─────────────────────────────────────────────────────

  /** Tous les dossiers (admin) */
  getAllCases(): Observable<DelinquencyCaseDto[]> {
    return this.http.get<DelinquencyCaseDto[]>(this.CASE_API);
  }

  /** Un dossier par ID */
  getCaseById(id: number): Observable<DelinquencyCaseDto> {
    return this.http.get<DelinquencyCaseDto>(`${this.CASE_API}/${id}`);
  }

  /** Dossiers d'un client (vue client) */
  getCasesByClient(clientId: number): Observable<DelinquencyCaseDto[]> {
    return this.http.get<DelinquencyCaseDto[]>(`${this.CASE_API}/client/${clientId}`);
  }

  /** Dossiers assignés à un agent */
  getCasesByAgent(agentId: number): Observable<DelinquencyCaseDto[]> {
    return this.http.get<DelinquencyCaseDto[]>(`${this.CASE_API}/agent/${agentId}`);
  }

  /** Filtrer par statut */
  getCasesByStatus(status: string): Observable<DelinquencyCaseDto[]> {
    return this.http.get<DelinquencyCaseDto[]>(`${this.CASE_API}/status/${status}`);
  }

  /** Filtrer par niveau de risque */
  getCasesByRisk(riskLevel: string): Observable<DelinquencyCaseDto[]> {
    return this.http.get<DelinquencyCaseDto[]>(`${this.CASE_API}/risk/${riskLevel}`);
  }

  /** Filtrer par catégorie */
  getCasesByCategory(category: string): Observable<DelinquencyCaseDto[]> {
    return this.http.get<DelinquencyCaseDto[]>(`${this.CASE_API}/category/${category}`);
  }

  /** Créer un dossier manuellement */
  createCase(dto: CreateDelinquencyCaseDto): Observable<DelinquencyCaseDto> {
    return this.http.post<DelinquencyCaseDto>(this.CASE_API, dto);
  }

  /** Mettre à jour un dossier */
  updateCase(id: number, dto: Partial<CreateDelinquencyCaseDto>): Observable<DelinquencyCaseDto> {
    return this.http.put<DelinquencyCaseDto>(`${this.CASE_API}/${id}`, dto);
  }

  /** Mettre à jour uniquement les notes */
  updateNotes(id: number, notes: string): Observable<DelinquencyCaseDto> {
    return this.http.patch<DelinquencyCaseDto>(`${this.CASE_API}/${id}/notes`, { notes });
  }

  /** Assigner un agent */
  assignAgent(caseId: number, agentId: number): Observable<DelinquencyCaseDto> {
    return this.http.put<DelinquencyCaseDto>(`${this.CASE_API}/${caseId}/assign/${agentId}`, {});
  }

  /** Escalader un dossier */
  escalateCase(caseId: number): Observable<DelinquencyCaseDto> {
    return this.http.put<DelinquencyCaseDto>(`${this.CASE_API}/${caseId}/escalate`, {});
  }

  /** Clôturer un dossier */
  closeCase(caseId: number, reason: string): Observable<DelinquencyCaseDto> {
    return this.http.put<DelinquencyCaseDto>(`${this.CASE_API}/${caseId}/close?reason=${reason}`, {});
  }

  /** Client paie en ligne → dossier passe à RECOVERED */
  payOverdue(caseId: number): Observable<DelinquencyCaseDto> {
    return this.http.post<DelinquencyCaseDto>(`${this.CASE_API}/${caseId}/pay-overdue`, {});
  }

  /** Agent enregistre un paiement en agence → dossier passe à RECOVERED */
  payByAgent(caseId: number): Observable<DelinquencyCaseDto> {
    return this.http.post<DelinquencyCaseDto>(`${this.CASE_API}/${caseId}/pay-by-agent`, {});
  }

  // ── RecoveryAction ───────────────────────────────────────────────────────

  /** Historique des actions d'un dossier */
  getActionsByCase(caseId: number): Observable<RecoveryActionDto[]> {
    return this.http.get<RecoveryActionDto[]>(`${this.RECOVERY_API}/case/${caseId}`);
  }

  /** Actions d'un agent (suivi performance) */
  getActionsByAgent(agentId: number): Observable<RecoveryActionDto[]> {
    return this.http.get<RecoveryActionDto[]>(`${this.RECOVERY_API}/agent/${agentId}`);
  }

  /** Créer une action de recouvrement */
  createAction(dto: CreateRecoveryActionDto): Observable<RecoveryActionDto> {
    return this.http.post<RecoveryActionDto>(this.RECOVERY_API, dto);
  }
}
