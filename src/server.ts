import "./config/env"; // valida variables de entorno al arrancar

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import runtimeLinksRouter from "./runtime/runtime.routes";
import { PORT, CORS_ORIGINS } from "./config/env";
import { GENERATED_PDFS_DIR } from "./modules/quotes/quote.service";

import companyProfileRoutes from "./modules/profiles/company-profile.router";
import loginRoutes from "./login/login.router";
import calendarAdminRoutes from "./modules/appointments/appointments-admin.routes";
import bookingConfirmationRoutes from "./runtime/booking/routes/bookingConfirmationRoutes";
import notificationRoutes from "./modules/notifications/notification.routes";
import passport from "passport";
import "./login/strategies/google.strategy";
import slugRoutes from "./modules/slug/slug.router";
import { errorMiddleware } from "./middlewares/error_middleware";
import publicPortalRouter from "./modules/menus/public-portal/public-portal.routes";
import productsRouter from "./modules/quotes/quotes.router";
import statisticsRouter from "./modules/stadistics/stadistics.router";
import DB from "./db/db_configuration";

// ─── Proceso ────────────────────────────────────────────────────────────────
process.on("uncaughtException", (err) => {
  console.error("[process] uncaughtException:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("[process] unhandledRejection:", reason);
  process.exit(1);
});

// ─── App ─────────────────────────────────────────────────────────────────────
const app = express();

app.use(helmet());

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite peticiones sin origin (mobile, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (CORS_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`Origin no permitido: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

// ─── Rate limiting en rutas de auth ──────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20,                   // máximo 20 intentos por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Demasiados intentos. Intenta en 15 minutos." },
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use("/generated-pdfs", express.static(GENERATED_PDFS_DIR));
app.use(passport.initialize());
app.use(runtimeLinksRouter);
app.use(companyProfileRoutes);
app.use(calendarAdminRoutes);
app.use("/auth", authLimiter, loginRoutes);
app.use(bookingConfirmationRoutes);
app.use("/api", notificationRoutes);
app.use("/api", slugRoutes);
app.use(publicPortalRouter);
app.use("/products", productsRouter);
app.use("/api", statisticsRouter);
app.use(errorMiddleware);

// ─── Arranque ─────────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`[server] Escuchando en puerto ${PORT}`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown(signal: string) {
  console.log(`[server] ${signal} recibido — cerrando...`);
  server.close(async () => {
    try {
      await DB.getPool().end();
      console.log("[server] Pool de DB cerrado. Proceso terminado.");
    } catch (err) {
      console.error("[server] Error cerrando pool:", err);
    }
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
