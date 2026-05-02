import { FinancingRequestStatus, ReservationStatus, VehicleStatus } from '../../models';

export const VEHICLE_STATUS_LABELS_EN: Record<VehicleStatus, string> = {
  DISPONIBLE: 'Available',
  RESERVE: 'Reserved',
  VENDU: 'Sold',
  INACTIF: 'Inactive',
};

export const RESERVATION_STATUS_LABELS_EN: Record<ReservationStatus, string> = {
  PENDING_ADMIN_APPROVAL: 'Pending admin approval',
  WAITING_CUSTOMER_ACTION: 'Customer action required',
  UNDER_REVIEW: 'Under review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED_BY_CLIENT: 'Cancelled by you',
  CANCELLED_BY_ADMIN: 'Cancelled by platform',
  EXPIRED: 'Expired',
};

export const FINANCING_STATUS_LABELS_EN: Record<FinancingRequestStatus, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};
