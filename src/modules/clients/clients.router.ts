import express from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../middlewares/auth_middleware";
import { clientsController } from "./clients.controller";

const router = express.Router();

const emailSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => String(req.user?.userId ?? req.ip),
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Límite de emails alcanzado. Intenta en una hora." },
});

router.use(authMiddleware);

router.get("/clients/:userId",                  clientsController.list);
router.get("/clients/:userId/:email/bookings",  clientsController.bookings);
router.post("/clients/:userId/email",           emailSendLimiter, clientsController.sendEmail);

export default router;
