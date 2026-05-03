export type NotificationModuleApi = 'VEHICLE' | 'VEHICLE_REPAYMENT' | 'INSURANCE' | 'GENERAL';

export type NotificationCategoryApi =
  | 'VEHICLE_SUBMITTED'
  | 'VEHICLE_APPROVED'
  | 'VEHICLE_REJECTED'
  | 'UPCOMING_DUE_DATE'
  | 'OVERDUE_PAYMENT'
  | 'PAYMENT_RECEIVED'
  | 'RISK_ALERT'
  | 'RESERVATION_PENDING_ADMIN'
  | 'RESERVATION_CONFIRMED_CLIENT'
  | 'RESERVATION_NEW_FOR_SELLER'
  | 'RESERVATION_APPROVED'
  | 'RESERVATION_REJECTED'
  | 'RESERVATION_AUTO_REJECTED'
  | 'RESERVATION_ACTION_REQUIRED'
  | 'RESERVATION_UNDER_REVIEW'
  | 'RESERVATION_CANCELLED_BY_CLIENT'
  | 'RESERVATION_CANCELLED_BY_ADMIN';

export interface AppNotificationDto {
  id: number;
  title: string;
  message: string;
  module: NotificationModuleApi;
  category: NotificationCategoryApi;
  read: boolean;
  createdAt: string;
  relatedEntityId: number | null;
  relatedEntityType: string | null;
}
