export type NotificationType =
  | "booking"
  | "quote"
  | "customer"
  | "inventory"
  | "payment"
  | "system";

export type NotificationPriority = "low" | "normal" | "high" | "critical";

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  entityId?: string | null;
  entityType?: string | null;
  action?: string | null;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  entityId: string | null;
  entityType: string | null;
  action: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}