import "./config/env"; // valida variables de entorno al arrancar

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import mpWebhookRouter from "./modules/webhook/mp-webhook.router";
import mpConnectRouter from "./modules/mp-connect/mp-connect.router";
import adminRouter from "./modules/admin/admin.router";
import servicesRouter from "./modules/services/services.router";
import clientsRouter from "./modules/clients/clients.router";
import blocksRouter from "./modules/blocks/blocks.router";
import { startReminderCron } from "./modules/reminders/reminder.cron";
import { PORT, CORS_ORIGINS } from "./config/env";
import { GENERATED_PDFS_DIR } from "./modules/quotes/quote.service";

import companyProfileRoutes from "./modules/profiles/company-profile.router";
import loginRoutes from "./login/login.router";
import calendarAdminRoutes from "./modules/appointments/appointments-admin.routes";
import calendarProvidersRoutes from "./modules/appointments/calendar-providers.routes";
import calendarPublicRouter from "./modules/calendar/calendar-public.router";
import chatAdminRouter from "./modules/chat/chat-admin.router";
import chatPublicRouter from "./modules/chat/chat-public.router";
import chatConfigRouter from "./modules/chat/chat-config.router";
import notificationRoutes from "./modules/notifications/notification.routes";
import passport from "passport";
import "./login/strategies/google.strategy";
import slugRoutes from "./modules/slug/slug.router";
import { errorMiddleware } from "./middlewares/error_middleware";
import publicPortalRouter from "./modules/menus/public-portal/public-portal.routes";
import { portalSessionMiddleware } from "./modules/menus/public-portal/portal-session.middleware";
import productsRouter from "./modules/quotes/quotes.router";
import statisticsRouter from "./modules/stadistics/stadistics.router";
import quotesExtendedRouter from "./modules/quotes/quotes-extended.routes";
import { initQuoteServicesTable } from "./modules/quotes/quote-services/quote-services.repository";
import { initQuoteHistoryTable } from "./modules/quotes/quote-history/quote-history.repository";
import { initCalendarBookingPriceColumn } from "./modules/appointments/appointments-admin.repository";
import { initCalendarServicesTable } from "./modules/appointments/calendar-services.repository";
import { initReviewsGoogleColumns } from "./modules/stadistics/reviews.repository";
import calendarServicesRoutes from "./modules/appointments/calendar-services.routes";
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

// Render (y cualquier proxy reverso) pone la IP real del cliente en X-Forwarded-For.
// Sin trust proxy, req.ip devuelve la IP del proxy → todos parecen el mismo visitante.
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src":  ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
        "frame-src":   ["https://accounts.google.com"],
        "connect-src": ["'self'", "https://accounts.google.com", "https://accounts.googleapis.com", "https://oauth2.googleapis.com"],
        "img-src":     ["'self'", "data:", "https://lh3.googleusercontent.com", "https://*.googleusercontent.com"],
      },
    },
  })
);

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
app.use(mpWebhookRouter);
app.use(mpConnectRouter);
app.use(adminRouter);
app.use(companyProfileRoutes);
app.use(calendarAdminRoutes);
app.use(calendarProvidersRoutes);
app.use(calendarServicesRoutes);
app.use("/auth", authLimiter, loginRoutes);
app.use("/api/public", portalSessionMiddleware);
app.use(calendarPublicRouter);
app.use("/api", chatAdminRouter);
app.use("/api", chatConfigRouter);
app.use("/api", chatPublicRouter);
app.use("/api", notificationRoutes);
app.use("/api", slugRoutes);
app.use(publicPortalRouter);
app.use("/products", productsRouter);
app.use("/api", statisticsRouter);
app.use("/api", quotesExtendedRouter);
app.use("/api", servicesRouter);
app.use("/api", clientsRouter);
app.use("/api", blocksRouter);
app.use(errorMiddleware);

// ─── Arranque ─────────────────────────────────────────────────────────────────
const server = app.listen(PORT, async () => {
  console.log(`[server] Escuchando en puerto ${PORT}`);
  startReminderCron();
  await Promise.all([
    initQuoteServicesTable().catch((e) => console.error("[init] quote_services:", e)),
    initQuoteHistoryTable().catch((e) => console.error("[init] quote_history:", e)),
    initCalendarBookingPriceColumn().catch((e) => console.error("[init] calendar_booking_price:", e)),
    initCalendarServicesTable().catch((e) => console.error("[init] calendar_services:", e)),
    initReviewsGoogleColumns().catch((e) => console.error("[init] reviews_google:", e)),
  ]);
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
