import express from "express";
import { runtimeController } from "./runtime.controller";
import { paymentsController } from '../modules/payments/mercadopago_api/mercadopago.controller'
const router = express.Router();

router.post("/api/runtime-links", runtimeController.createRuntimeLink);
router.get("/api/runtime-links/:token", runtimeController.getRuntimeLink);
router.post("/api/runtime-links/:token/submit", runtimeController.submitRuntimeLink);
router.get("/api/runtime-links/:token/submissions", runtimeController.getSubmissions);

router.get("/debug/tokens", runtimeController.debugTokens);
router.get("/open/reservas/:leadId", runtimeController.openReservas);
router.get(
  "/api/runtime-links/:token/slots",
  runtimeController.getCalendarSlots
);
router.get(
  "/open/:publicSlug/reservas",
  runtimeController.openPublicReservas
);

router.get(
  "/api/public/:publicSlug/slots",
  runtimeController.getPublicCalendarSlots
);

router.post(
  "/api/public/:publicSlug/bookings",
  runtimeController.createPublicBooking
);

//payments
router.post(
  "/api/public/:publicSlug/bookings/:bookingId/pay",
  runtimeController.createPublicBookingPayment
);

router.post(
  "/api/payments/webhook",
  runtimeController.mercadoPagoWebhook
);
router.get("/payment/success", runtimeController.paymentSuccess);
router.get("/payment/failure", runtimeController.paymentFailure);
router.get("/payment/pending", runtimeController.paymentPending);
//example payment

router.get(
  "/api/payments/test",
  paymentsController.test
);

export default router;