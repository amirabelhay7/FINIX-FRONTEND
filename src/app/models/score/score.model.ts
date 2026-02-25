/**
 * Scoring (backend module).
 */

/** API: user score summary */
export interface UserScoreApi {
  userId: number;
  userEmail: string;
  userName: string;
  totalScore: number;
  documentScore: number;
  profileScore: number;
  walletScore: number;
  guaranteeScore: number;
  isEligibleForLoan: boolean;
  minimumRequiredScore: number;
  activeGuaranteesGiven?: number;
  activeGuaranteesReceived?: number;
}

/** API: detailed score + next steps */
export interface ScoringResultApi {
  userId: number;
  userEmail: string;
  totalScore: number;
  documentScore: number;
  profileScore: number;
  walletScore: number;
  guaranteeScore: number;
  isEligibleForLoan: boolean;
  minimumRequiredScore: number;
  eligibilityReason?: string;
  nextSteps?: string;
}

/** API: tier (from /me/tier) */
export interface UserTierApi {
  id: number;
  tierName: string;
  minScore: number;
  maxScore: number;
  tierColor: string;
  benefits: string;
  nextTierMinScore?: number;
  progressionRequired?: string;
  status: string;
  isActive: boolean;
}

export interface UserTierRequest {
  tierName: string;
  minScore: number;
  maxScore: number;
  tierColor?: string;
  benefits?: string;
  iconUrl?: string;
  nextTierMinScore?: number;
  progressionRequired?: string;
}

/** API: score history entry */
export interface ScoreHistoryEntryApi {
  id: number;
  userId: number;
  userName: string;
  previousScore: number;
  newScore: number;
  scoreChange: number;
  reason: string;
  ruleType: string;
  changeType: string;
  changedAt: string;
  triggeredBy?: string;
  referenceId?: string;
}

export interface SavingsMonthRow {
  month: string;
  detail: string;
  statusLabel: string;
  statusClass: string;
}

export interface VerifiedDocumentRow {
  title: string;
  detail: string;
  pointsLabel?: string;
}

export interface DocumentTypeOption {
  value: string;
  label: string;
}

// --- Score config (rules) ---
export interface ScoreConfigApi {
  id: number;
  ruleName: string;
  ruleType: string;
  points: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  depositThreshold?: number;
  maxGuaranteesPerUser?: number;
  guaranteePoints?: number;
  documentType?: string;
}

export interface ScoreConfigRequest {
  ruleName: string;
  ruleType: string;
  points: number;
  description?: string;
  depositThreshold?: number;
  maxGuaranteesPerUser?: number;
  guaranteePoints?: number;
}

// --- Tutorials ---
export interface TutorialApi {
  id: number;
  title: string;
  description: string;
  pointsAwarded: number;
  tutorialType: string;
  status: string;
  tutorialUrl?: string;
  iconUrl?: string;
  estimatedMinutes?: number;
  difficulty?: string;
  prerequisites?: string;
  isCompleted?: boolean;
  completedAt?: string;
  userId?: number;
  userName?: string;
}

export interface TutorialRequest {
  title: string;
  description: string;
  pointsAwarded: number;
  tutorialType: string;
  tutorialUrl?: string;
  iconUrl?: string;
  estimatedMinutes: number;
  difficulty: string;
  prerequisites?: string;
}

// --- Achievements ---
export interface AchievementApi {
  id: number;
  title: string;
  description: string;
  pointsAwarded: number;
  achievementType: string;
  status: string;
  iconUrl?: string;
  tutorialUrl?: string;
  tierRequired?: number;
  badgeColor?: string;
  isSecret?: boolean;
  isCompleted?: boolean;
  unlockedAt?: string;
  userId?: number;
  userName?: string;
}

export interface AchievementRequest {
  title: string;
  description: string;
  pointsAwarded: number;
  achievementType: string;
  iconUrl?: string;
  tutorialUrl?: string;
  tierRequired?: number;
  badgeColor?: string;
  isSecret?: boolean;
}

// --- Guarantees ---
export interface GuaranteeApi {
  id: number;
  guarantorId: number;
  guarantorName: string;
  beneficiaryId: number;
  beneficiaryName: string;
  pointsOffered: number;
  reason: string;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  isAccepted: boolean;
  acceptedAt?: string;
}

export interface GuaranteeRequest {
  guarantorId: number;
  beneficiaryId: number;
  pointsOffered: number;
  reason: string;
  validityMonths?: number;
}

// --- User documents (for scoring / verification) ---
export interface UserDocumentApi {
  id: number;
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  fileSize?: number;
  verified: boolean;
  uploadedAt?: string;
  dateVerification?: string;
  verificationNotes?: string;
  documentType: string;
  userId: number;
  userName?: string;
  verifiedByName?: string;
  category?: string;
  description?: string;
}

export interface DocumentVerificationLogApi {
  id: number;
  documentId: number;
  action: string;
  performedByName: string;
  notes?: string;
  createdAt: string;
}
