import DB from "../../db/db_configuration";
import {
  CreateNotificationDTO,
  NotificationItem,
} from "./notification.types";

function mapRow(row: any): NotificationItem {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    priority: row.priority,
    title: row.title,
    message: row.message,
    entityId: row.entity_id,
    entityType: row.entity_type,
    action: row.action,
    isRead: row.is_read,
    readAt: row.read_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class NotificationRepository {
  async create(data: CreateNotificationDTO): Promise<NotificationItem> {
    const pool = DB.getPool();

    const result = await pool.query(
      `
      INSERT INTO notifications (
        user_id,
        type,
        priority,
        title,
        message,
        entity_id,
        entity_type,
        action
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        data.userId,
        data.type,
        data.priority ?? "normal",
        data.title,
        data.message,
        data.entityId ?? null,
        data.entityType ?? null,
        data.action ?? null,
      ]
    );

    return mapRow(result.rows[0]);
  }

  async findByUserId(userId: string, limit = 30): Promise<NotificationItem[]> {
    const pool = DB.getPool();

    const result = await pool.query(
      `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      `,
      [userId, limit]
    );

    return result.rows.map(mapRow);
  }

  async countUnread(userId: string): Promise<number> {
    const pool = DB.getPool();

    const result = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM notifications
      WHERE user_id = $1
        AND is_read = false
      `,
      [userId]
    );

    return result.rows[0]?.total ?? 0;
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const pool = DB.getPool();

    await pool.query(
      `
      UPDATE notifications
      SET
        is_read = true,
        read_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
        AND user_id = $2
      `,
      [notificationId, userId]
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    const pool = DB.getPool();

    await pool.query(
      `
      UPDATE notifications
      SET
        is_read = true,
        read_at = NOW(),
        updated_at = NOW()
      WHERE user_id = $1
        AND is_read = false
      `,
      [userId]
    );
  }
}