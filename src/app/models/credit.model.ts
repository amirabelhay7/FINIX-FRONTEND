/**
 * Credit module – static UI models (MVVM).
 */
export interface LoanRequest {
  id: number;
  amount: string;
  duration: string;
  status: 'approved' | 'pending' | 'rejected';
  submittedAt: string;
  note: string;
  actionRoute?: string;
  actionLabel: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
}

export interface LoanSummary {
  activeContracts: number;
  pendingRequests: number;
  totalBorrowed: string;
}

export interface ActiveContractSummary {
  contractNumber: string;
  amount: string;
  duration: string;
  rate: string;
  nextPaymentDate: string;
  nextPaymentAmount: string;
  contractRoute: string;
}

export interface CreditDurationOption {
  value: number;
  label: string;
  selected?: boolean;
}

export interface UpcomingPaymentRow {
  date: string;
  subtitle: string;
  amount: string;
  isNext: boolean;
}

export interface ApplicationStep {
  title: string;
  subtitle: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
  isActive: boolean;
  isDone: boolean;
  linkRoute?: string;
  linkLabel?: string;
}

export interface ContractTermItem {
  label: string;
  value: string;
}

export interface ContractDocumentRow {
  title: string;
  uploadedAt: string;
}

/* ===== BACKEND REQUEST LOAN MODELS ===== */

export interface RequestLoanDto {
  idDemande: number;
  montantDemande: number;
  apportPersonnel: number;
  dureeMois: number;
  mensualiteEstimee: number;
  objectifCredit: string;
  fullName?: string;
  dateOfBirth?: string;
  cinNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  situationFamiliale?: string;
  typeEmploi?: string;
  revenuMensuelEstime?: number;
  tauxAnnuel?: number;
  revenuMensuelBrut?: number;
  revenuMensuelNet?: number;
  chargesMensuelles?: number;
  garantieType?: 'VEHICULE' | 'IMMOBILIERE' | 'CAUTION' | 'AUCUNE';
  garantieValeurEstimee?: number;
  typeRemboursementSouhaite?: string;
  demandePeriodeGrace?: boolean;
  confirmExactitudeInformations?: boolean;
  autorisationVerificationDocuments?: boolean;
  acceptationConditionsGenerales?: boolean;
  consentementTraitementDonnees?: boolean;
  docCinFourni?: boolean;
  docFichePaieFournie?: boolean;
  docReleveBancaireFourni?: boolean;
  docAttestationTravailFournie?: boolean;
  docJustificatifDomicileFourni?: boolean;
  nombreDocumentsOptionnels?: number;
  dateCreation: string;
  dateSoumission: string;
  dateDecision: string;
  statutDemande: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONDITIONAL';
  riskScore?: number;
  riskDecision?: 'ACCEPTE_AUTO' | 'REVUE_AGENT' | 'COMITE_CREDIT' | 'REFUSE_AUTO';
  decisionSource?: 'SYSTEM' | 'ADMIN' | string;
  riskBreakdown?: string;
  /** Rule-based X1/X4/X5 text; present when riskBreakdown holds ML output (EXTERNAL_PKL). */
  internalRiskBreakdown?: string;
  /** EXTERNAL_PKL | INTERNAL_FALLBACK | string */
  riskSource?: string;
  mlDecision?: string;
  mlProbability?: number;
  mlAlerts?: string;
  mlScoringSource?: string;
  userId?: number;
  vehiculeId?: number;

  // "Joined" fields returned by the backend.
  // Your API returns: user.firstName/lastName and vehicle.marque/modele/prixTnd.
  user?: { firstName: string; lastName: string; email?: string };

  vehicle?: { marque: string; modele: string; prixTnd: number };

  // Backward-compatible optional aliases (in case some endpoints use different naming).
  userEmail?: string;
  vehicule?: { marque: string; modele: string; prix_tnd: number };
  // Flat alternatives (in case backend sends them without nesting)
  vehiculeMarque?: string;
  vehiculeModele?: string;
  vehiculePrixTnd?: number;
  prix_tnd?: number;
  marque?: string;
  modele?: string;
  prixTnd?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreateRequestLoanPayload {
  montantDemande: number;
  apportPersonnel: number;
  dureeMois: number;
  mensualiteEstimee: number;
  objectifCredit: string;
  fullName?: string;
  dateOfBirth?: string;
  cinNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  situationFamiliale?: string;
  typeEmploi?: string;
  revenuMensuelEstime?: number;
  tauxAnnuel?: number;
  revenuMensuelBrut?: number;
  revenuMensuelNet?: number;
  chargesMensuelles?: number;
  garantieType?: 'VEHICULE' | 'IMMOBILIERE' | 'CAUTION' | 'AUCUNE';
  garantieValeurEstimee?: number;
  typeRemboursementSouhaite?: string;
  demandePeriodeGrace?: boolean;
  confirmExactitudeInformations?: boolean;
  autorisationVerificationDocuments?: boolean;
  acceptationConditionsGenerales?: boolean;
  consentementTraitementDonnees?: boolean;
  docCinFourni?: boolean;
  docFichePaieFournie?: boolean;
  docReleveBancaireFourni?: boolean;
  docAttestationTravailFournie?: boolean;
  docJustificatifDomicileFourni?: boolean;
  nombreDocumentsOptionnels?: number;
  statutDemande: 'DRAFT' | 'PENDING';
  userId: number;
  vehiculeId?: number;
  dateCreation?: string;

}

/** Corps optionnel pour POST approve / reject (si le backend accepte une note). */
export interface RequestLoanDecisionPayload {
  note?: string;
}

/** Mirrors backend LoanContractResponse; statutContrat enum as string from JSON. */
export interface LoanContractDto {
  idContrat: number;
  numeroContrat: string;
  montantCredit?: number;
  tauxInteret?: number;
  dureeMois?: number;
  montantTotalRembourse?: number;
  datePremiereEcheance?: string;
  dateSignature?: string;
  dateDebutCredit?: string;
  dateFinPrevue?: string;
  statutContrat?: string;
  assuranceObligatoire?: boolean;
  montantPrimeAssurance?: number;
  traceurGPSObligatoire?: boolean;
  requestLoanId?: number;
  clientFirstName?: string;
  clientLastName?: string;
}

/** Mirrors backend LoanContractDetailsResponse. */
export interface LoanContractDetailsDto {
  idContrat: number;
  numeroContrat: string;
  montantCredit?: number;
  tauxInteret?: number;
  dureeMois?: number;
  mensualite?: number;
  montantTotalRembourse?: number;
  dateDebutCredit?: string;
  dateFinPrevue?: string;
  datePremiereEcheance?: string;
  dateSignature?: string;
  statutContrat?: string;
  assuranceObligatoire?: boolean;
  montantPrimeAssurance?: number;
  traceurGPSObligatoire?: boolean;
  idDemande?: number;
  montantDemande?: number;
  apportPersonnel?: number;
  objectifCredit?: string;
  dateCreation?: string;
  statutDemande?: string;
  clientPrenom?: string;
  clientNom?: string;
  vehiculeMarque?: string;
  vehiculeModele?: string;
  vehiculePrixTnd?: number;
}

export interface LoanDocumentDto {
  idDocument: number;
  typeDocument: string;
  nomFichier: string;
  urlFichier: string;
  formatFichier: 'PDF' | 'JPG' | 'PNG';
  dateUpload: string;
  statutVerification: 'PENDING' | 'APPROVED' | 'REJECTED';
  methodeVerification: 'AUTOMATIC' | 'MANUAL';
  requestLoanId: number;
}
