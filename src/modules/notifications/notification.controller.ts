import { Request, Response } from "express";
import { notificationService } from "./notification.service";

function forbidden(req: Request<{ userId: string }>): boolean {
  return req.user?.userId !== String(req.params.userId);
}

export const getNotificationsController = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  if (forbidden(req)) return res.status(403).json({ ok: false, message: "Forbidden" });
  try {
    const userId = String(req.params.userId);
    const limit = Number(req.query.limit ?? 30);

    const notifications = await notificationService.findByUserId(userId, limit);
    const unreadCount = await notificationService.countUnread(userId);

    return res.json({ ok: true, unreadCount, notifications });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      message: error?.message || "No se pudieron cargar las notificaciones.",
    });
  }
};

export const markNotificationReadController = async (
  req: Request<{ userId: string; notificationId: string }>,
  res: Response
) => {
  if (req.user?.userId !== String(req.params.userId))
    return res.status(403).json({ ok: false, message: "Forbidden" });
  try {
    await notificationService.markAsRead(
      String(req.params.notificationId),
      String(req.params.userId)
    );
    return res.json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      message: error?.message || "No se pudo marcar como leída.",
    });
  }
};

export const markAllNotificationsReadController = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  if (forbidden(req)) return res.status(403).json({ ok: false, message: "Forbidden" });
  try {
    await notificationService.markAllAsRead(String(req.params.userId));
    return res.json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      message: error?.message || "No se pudieron marcar como leídas.",
    });
  }
};