import express from "express";
import rateLimit from "express-rate-limit";
import { calendarPublicController } from "./calendar-public.controller";
import { confirmBookingByToken } from "./booking/services/bookingConfirmation.service";
import { renderBookingConfirmationSuccessHtml } from "./booking/views/bookingConfirmationSuccessHtml";
import { renderBookingConfirmationErrorHtml } from "./booking/views/bookingConfirmationErrorHtml";
import { getSlugByValueService } from "../slug/slug.service";
import { getActiveServicesPaginated } from "../appointments/calendar-services.repository";

const router = express.Router();

const bookingRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => `${req.ip}-${req.params["publicSlug"] ?? ""}`,
  message: { ok: false, message: "Demasiadas solicitudes. Intenta más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limita intentos de fuerza bruta sobre tokens de un solo uso (cancelar/confirmar por email)
const tokenRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => `${req.ip}`,
  message: { ok: false, message: "Demasiadas solicitudes. Intenta más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Servicios de reserva públicos (para el selector en el portal)
router.get("/api/public/:publicSlug/booking-services", async (req, res) => {
  try {
    const publicSlug = String(req.params["publicSlug"] || "").trim();
    const profile = await getSlugByValueService(publicSlug);
    if (!profile) return res.status(404).json({ ok: false, message: "Negocio no encontrado." });
    const limit = Math.min(Math.max(parseInt(String(req.query["limit"] || "50"), 10) || 50, 1), 100);
    const offset = Math.max(parseInt(String(req.query["offset"] || "0"), 10) || 0, 0);
    const result = await getActiveServicesPaginated(profile.user_id, limit, offset);
    return res.json({ ok: true, services: result.rows, total: result.total });
  } catch (err) {
    console.error("[calendar] Error obteniendo servicios:", err);
    return res.status(500).json({ ok: false, message: "No se pudieron cargar los servicios." });
  }
});

// Página pública de reservas
router.get("/open/:publicSlug/reservas", calendarPublicController.openReservas);

// Equipo/proveedores públicos
router.get("/api/public/:publicSlug/providers", calendarPublicController.getProviders);

// Slots disponibles (acepta ?providerId=xxx)
router.get("/api/public/:publicSlug/slots", calendarPublicController.getSlots);

// Crear reserva
router.post("/api/public/:publicSlug/bookings", bookingRateLimit, calendarPublicController.createBooking);

// Crear pago para una reserva
router.post(
  "/api/public/:publicSlug/bookings/:bookingId/pay",
  calendarPublicController.createPayment
);

// Cancelar reserva pendiente (desde el portal, vía fetch DELETE)
router.delete(
  "/api/public/:publicSlug/bookings/:bookingId",
  calendarPublicController.cancelBooking
);

// Cancelar reserva por token (desde el link del email)
router.get("/api/bookings/cancel/:token", tokenRateLimit, calendarPublicController.cancelBookingByToken);

// Confirmación de reserva por token (email)
router.get("/api/bookings/confirm/:token", tokenRateLimit, async (req, res) => {
  try {
    const token = String(req.params["token"] || "");
    const result = await confirmBookingByToken(token);

    if (!result.ok) {
      return res.status(400).send(renderBookingConfirmationErrorHtml(result.message));
    }

    return res.send(renderBookingConfirmationSuccessHtml());
  } catch (error) {
    console.error("[calendar] Error confirmando reserva:", error);
    return res.status(500).send(
      renderBookingConfirmationErrorHtml("Ocurrió un error confirmando la reserva.")
    );
  }
});

export default router;
