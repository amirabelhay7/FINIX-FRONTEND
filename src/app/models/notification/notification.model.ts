export interface NotificationApi {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  referenceType?: string;
  referenceId?: string;
}

export interface NotificationUnreadCountApi {
  count: number;
}
