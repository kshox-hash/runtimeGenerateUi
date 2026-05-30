import { NotificationRepository } from "./notification.repository";
import {
  CreateNotificationDTO,
  NotificationItem,
} from "./notification.types";

export class NotificationService {
  constructor(
    private readonly repository = new NotificationRepository()
  ) {}

  async create(data: CreateNotificationDTO): Promise<NotificationItem> {
    return this.repository.create(data);
  }

  async findByUserId(userId: string, limit = 30): Promise<NotificationItem[]> {
    return this.repository.findByUserId(userId, limit);
  }

  async countUnread(userId: string): Promise<number> {
    return this.repository.countUnread(userId);
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    return this.repository.markAsRead(notificationId, userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    return this.repository.markAllAsRead(userId);
  }

  async bookingCreated(params: {
    userId: string;
    bookingId: string;
    customerName: string;
    startText?: string;
  }): Promise<NotificationItem> {
    return this.create({
      userId: params.userId,
      type: "booking",
      priority: "normal",
      title: "Nueva reserva",
      message: params.startText
        ? `${params.customerName} reservó una hora para ${params.startText}.`
        : `${params.customerName} reservó una hora.`,
      entityId: params.bookingId,
      entityType: "booking",
      action: "open_booking",
    });
  }

  async quoteCreated(params: {
    userId: string;
    quoteId: string;
    customerName?: string;
  }): Promise<NotificationItem> {
    return this.create({
      userId: params.userId,
      type: "quote",
      priority: "normal",
      title: "Nueva cotización",
      message: params.customerName
        ? `Se creó una cotización para ${params.customerName}.`
        : "Se creó una nueva cotización.",
      entityId: params.quoteId,
      entityType: "quote",
      action: "open_quote",
    });
  }

  async systemAlert(params: {
    userId: string;
    title: string;
    message: string;
    priority?: "low" | "normal" | "high" | "critical";
  }): Promise<NotificationItem> {
    return this.create({
      userId: params.userId,
      type: "system",
      priority: params.priority ?? "normal",
      title: params.title,
      message: params.message,
      entityId: null,
      entityType: null,
      action: null,
    });
  }
}

export const notificationService = new NotificationService();