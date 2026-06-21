import express from "express";
import { authMiddleware } from "../../middlewares/auth_middleware";
import { calendarAdminController } from "./appointments-admin.controller";

const router = express.Router();

router.put("/api/calendar/settings",                  authMiddleware, calendarAdminController.saveSettings);
router.get("/api/calendar/settings/:userId",          authMiddleware, calendarAdminController.getSettings);
router.get("/api/calendar/bookings/:userId",          authMiddleware, calendarAdminController.getBookings);
router.get("/api/calendar/bookings/:userId/export",   authMiddleware, calendarAdminController.exportPayments);
router.patch("/api/calendar/bookings/:id/status",     authMiddleware, calendarAdminController.updateBookingStatus);
router.patch("/api/calendar/bookings/:id/reschedule", authMiddleware, calendarAdminController.rescheduleBooking);

export default router;