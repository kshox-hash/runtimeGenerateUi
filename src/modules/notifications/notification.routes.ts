import express from "express";
import { authMiddleware } from "../../middlewares/auth_middleware";
import {
  getNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
} from "./notification.controller";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/notifications/:userId",
  getNotificationsController
);

router.patch(
  "/notifications/:userId/read-all",
  markAllNotificationsReadController
);

router.patch(
  "/notifications/:userId/:notificationId/read",
  markNotificationReadController
);

export default router;