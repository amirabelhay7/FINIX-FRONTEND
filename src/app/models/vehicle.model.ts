/**
 * Vehicle module – static UI models (MVVM).
 */

/** Label / value row for vehicle detail screens. */
export interface VehicleDetailItem {
  label: string;
  value: string;
  valueClass?: string;
}

export type VehicleCondition = 'NEUF' | 'TRES_BON' | 'BON' | 'MOYEN' | 'MAUVAIS';


export interface VehicleListItem {
  id: number;
  name: string;
  subtitlePrefix: string;
  status: string;
  statusClass: string;
  route: string;
  icon: string;
  iconBgClass: string;
  iconColorClass: string;
}

/** AI-powered vehicle recommendation returned by GET /api/vehicles/recommendations/me */
export interface RecommendedVehicleDto {
  id: number;
  marque: string;
  modele: string;
  prixTnd: number;
  status: VehicleStatus;
  active: boolean;
  phoneNumber?: string | null;
  localisation?: string | null;
  serieVehicule?: string | null;
  imageUrl?: string | null;
  ownerUserId?: number | null;
  createdAt: string;
  updatedAt: string;
  etatVehicule?: VehicleCondition | null;
  matchScore: number;
  recommendationReason: string;
}

/** Payload for PUT /api/users/me/vehicle-preferences */
export interface VehiclePreferencesPayload {
  budgetMax?: number | null;
  preferredVehicleType?: string | null;
  preferredBrands?: string | null;
  city?: string | null;
  vehicleUsage?: string | null;
}

/** Document row for vehicle detail. */
export interface VehicleDocumentRow {
  title: string;
  uploadedAt: string;
}

export type VehicleStatus = 'DISPONIBLE' | 'RESERVE' | 'VENDU' | 'INACTIF';

export type VehicleWorkspaceMode = 'client' | 'seller' | 'admin';

/** Aligné sur `VehicleModerationStatus` côté Spring. */
export type VehicleModerationStatus =
  | 'PENDING_AI_REVIEW'
  | 'APPROVED_BY_AI'
  | 'REJECTED_BY_AI'
  | 'PENDING_ADMIN_REVIEW'
  | 'APPROVED_BY_ADMIN'
  | 'REJECTED_BY_ADMIN';

export interface VehicleStatsDto {
  total: number;
  disponibles: number;
  reserves: number;
  vendus: number;
  inactifs: number;
  actifs: number;
  avecImage: number;
  prixMoyen: number;
  parMarque: Record<string, number>;
  parVendeur?: Record<string, number>;
  reservationsParStatut?: Record<string, number>;
  topClientsParReservation?: Record<string, number>;
  totalReservations?: number;
  clientsAvecReservation?: number;
}

export interface VehicleDto {
  id: number;
  marque: string;
  modele: string;
  prixTnd: number;
  status: VehicleStatus;
  active: boolean;
  moderationStatus?: VehicleModerationStatus | null;
  rejectionReason?: string | null;
  aiDecisionReason?: string | null;
  phoneNumber?: string | null;
  localisation?: string | null;
  serieVehicule?: string | null;
  imageUrl?: string | null;
  ownerUserId?: number | null;
  createdAt: string;
  updatedAt: string;
  etatVehicule?: VehicleCondition | null;
}

export interface VehiclePayload {
  marque: string;
  modele: string;
  prixTnd: number;
  status: VehicleStatus;
  active: boolean;
  phoneNumber: string;
  localisation: string;
  serieVehicule: string;
  imageUrl?: string | null;
  etatVehicule?: VehicleCondition | null;
}

/** Query params alignés sur l’API GET /api/vehicles et /mine */
export interface VehicleSearchQuery {
  q?: string;
  marque?: string;
  modele?: string;
  status?: VehicleStatus;
  sellerUserId?: number;
  reservationStatus?: ReservationStatus;
  active?: boolean;
  minPrice?: number;
  maxPrice?: number;
  hasImage?: boolean;
  recentOnly?: boolean;
  sort?: string;
}

export type TypeDocument = 'CARTE_GRISE' | 'CONTROLE_TECHNIQUE' | 'FACTURE_ACHAT' | 'PREUVE_ASSURANCE';
export type StatusDelivery = 'PLANNED' | 'PENDING' | 'DELIVERED' | 'CANCELLED';
export type StatusTracker = 'ASSIGNED' | 'INSTALLED' | 'ACTIVE' | 'INACTIVE';
export type StatusEscrowPayment = 'BLOCK' | 'RELEASE' | 'REIMBURSE';
export type FeedbackType = 'CLIENT_SERVICE' | 'SELLER_SERVICE';

export interface DocumentVehicleDto {
  id: number;
  type: TypeDocument;
  fileUrl: string;
  imageVeh: string | null;
  verified: boolean;
  uploadedAt: string;
  dateVerification: string | null;
  vehicleId: number;
}
export interface DocumentVehiclePayload {
  type: TypeDocument;
  fileUrl: string;
  imageVeh?: string;
  verified: boolean;
  vehicleId: number;
}

export interface DeliveryVehicleDto {
  id: number;
  dateDeliveryPlanned: string;
  dateDeliveryRealized: string | null;
  dateDeliveryCancelled: string | null;
  addressDelivery: string;
  statusDelivery: StatusDelivery;
  confirmByImf: boolean;
  vehicleId: number;
}
export interface DeliveryVehiclePayload {
  dateDeliveryPlanned?: string;
  dateDeliveryRealized?: string;
  dateDeliveryCancelled?: string;
  addressDelivery: string;
  statusDelivery: StatusDelivery;
  confirmByImf: boolean;
  vehicleId: number;
}

export interface FeedbackVehicleDto {
  id: number;
  vehicleId: number | null;
  feedbackType: FeedbackType;
  noteGlobal: number;
  comment: string | null;
  visible: boolean;
  authorId: number | null;
  authorName: string | null;
  authorRole: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface FeedbackVehiclePayload {
  feedbackType: FeedbackType;
  noteGlobal: number;
  comment: string;
  visible?: boolean;
  /** Optionnel : envoyé au backend si le contrat API le supporte (association au véhicule). */
  vehicleId?: number;
}

export interface FeedbackSearchQuery {
  feedbackType?: FeedbackType;
  authorUserId?: number;
  visible?: boolean;
}

export interface EscrowPaymentDto {
  id: number;
  totalAmount: number;
  blockDate: string;
  releaseDate: string | null;
  statusEscrowPayment: StatusEscrowPayment;
}
export interface EscrowPaymentPayload {
  totalAmount: number;
  blockDate: string;
  releaseDate: string;
  statusEscrowPayment: StatusEscrowPayment;
}

export interface GpsTrackerDto {
  id: number;
  statusTracker: StatusTracker;
  serialNumber: string;
  installationDate: string;
  active: boolean;
}
export interface GpsTrackerPayload {
  statusTracker: StatusTracker;
  serialNumber: string;
  installationDate: string;
  active: boolean;
}

/** Réservation véhicule — cycle de vie complet (aligné backend). */
export type ReservationStatus =
  | 'PENDING_ADMIN_APPROVAL'
  | 'WAITING_CUSTOMER_ACTION'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED_BY_CLIENT'
  | 'CANCELLED_BY_ADMIN'
  | 'EXPIRED';

export interface VehicleReservationDto {
  id: number;
  vehicleId: number;
  /** Synthèse marque + modèle */
  vehicleTitle: string;
  clientUserId: number;
  clientName: string | null;
  sellerUserId: number | null;
  sellerEmail: string | null;
  status: ReservationStatus;
  clientNotes: string | null;
  desiredDate: string | null;
  requestedAt: string | null;
  createdAt: string;
  createdByUserId: number | null;
  createdByRole: string | null;
  approvedByUserId: number | null;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectedByUserId: number | null;
  rejectedByName: string | null;
  rejectedAt: string | null;
  rejectReason: string | null;
  cancelledByUserId: number | null;
  cancelledByName: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  lastActionByUserId: number | null;
  lastActionByRole: string | null;
  lastActionByName: string | null;
  adminComment: string | null;
}

export interface VehicleReservationPayload {
  vehicleId: number;
  phoneNumber?: number | null;
  clientNotes?: string | null;
  /** yyyy-MM-dd */
  desiredDate?: string | null;
}

export interface ReservationRejectPayload {
  reason: string;
}

export interface ReservationRequestDocumentsPayload {
  adminComment: string;
}

export interface ReservationCancelPayload {
  reason?: string | null;
}

/** Demande de financement IMF */
export type FinancingRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED';

export interface FinancingRequestDto {
  id: number;
  vehicleId: number;
  marque: string;
  modele: string;
  clientUserId: number;
  reservationId: number | null;
  requestedAmount: number;
  downPayment: number | null;
  preferredDurationMonths: number | null;
  preferredMonthlyPayment: number | null;
  financingType: string | null;
  purpose: string | null;
  notes: string | null;
  preferredImf: string | null;
  urgency: string | null;
  status: FinancingRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FinancingRequestPayload {
  vehicleId: number;
  reservationId?: number | null;
  requestedAmount: number;
  downPayment?: number | null;
  preferredDurationMonths?: number | null;
  preferredMonthlyPayment?: number | null;
  financingType?: string | null;
  purpose?: string | null;
  notes?: string | null;
  preferredImf?: string | null;
  urgency?: string | null;
}

/** Document client (dossier financement) */
export type ClientDocumentType = 'CIN' | 'PAYSLIP' | 'BANK_STATEMENT' | 'PROOF_OF_ADDRESS' | 'OTHER';
export type ClientDocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface ClientFinancingDocumentDto {
  id: number;
  vehicleId: number;
  financingRequestId: number | null;
  documentType: ClientDocumentType;
  originalFileName: string;
  downloadUrl: string;
  contentType: string | null;
  status: ClientDocumentStatus;
  uploadedAt: string;
}
