"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./config/env"); // valida variables de entorno al arrancar
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const mp_webhook_router_1 = __importDefault(require("./modules/webhook/mp-webhook.router"));
const mp_connect_router_1 = __importDefault(require("./modules/mp-connect/mp-connect.router"));
const admin_router_1 = __importDefault(require("./modules/admin/admin.router"));
const services_router_1 = __importDefault(require("./modules/services/services.router"));
const clients_router_1 = __importDefault(require("./modules/clients/clients.router"));
const blocks_router_1 = __importDefault(require("./modules/blocks/blocks.router"));
const reminder_cron_1 = require("./modules/reminders/reminder.cron");
const env_1 = require("./config/env");
const quote_service_1 = require("./modules/quotes/quote.service");
const company_profile_router_1 = __importDefault(require("./modules/profiles/company-profile.router"));
const login_router_1 = __importDefault(require("./login/login.router"));
const appointments_admin_routes_1 = __importDefault(require("./modules/appointments/appointments-admin.routes"));
const calendar_providers_routes_1 = __importDefault(require("./modules/appointments/calendar-providers.routes"));
const calendar_public_router_1 = __importDefault(require("./modules/calendar/calendar-public.router"));
const chat_admin_router_1 = __importDefault(require("./modules/chat/chat-admin.router"));
const chat_public_router_1 = __importDefault(require("./modules/chat/chat-public.router"));
const chat_config_router_1 = __importDefault(require("./modules/chat/chat-config.router"));
const notification_routes_1 = __importDefault(require("./modules/notifications/notification.routes"));
const passport_1 = __importDefault(require("passport"));
require("./login/strategies/google.strategy");
const slug_router_1 = __importDefault(require("./modules/slug/slug.router"));
const error_middleware_1 = require("./middlewares/error_middleware");
const public_portal_routes_1 = __importDefault(require("./modules/menus/public-portal/public-portal.routes"));
const portal_session_middleware_1 = require("./modules/menus/public-portal/portal-session.middleware");
const quotes_router_1 = __importDefault(require("./modules/quotes/quotes.router"));
const stadistics_router_1 = __importDefault(require("./modules/stadistics/stadistics.router"));
const quotes_extended_routes_1 = __importDefault(require("./modules/quotes/quotes-extended.routes"));
const quote_services_repository_1 = require("./modules/quotes/quote-services/quote-services.repository");
const quote_history_repository_1 = require("./modules/quotes/quote-history/quote-history.repository");
const appointments_admin_repository_1 = require("./modules/appointments/appointments-admin.repository");
const calendar_services_repository_1 = require("./modules/appointments/calendar-services.repository");
const reviews_repository_1 = require("./modules/stadistics/reviews.repository");
const calendar_services_routes_1 = __importDefault(require("./modules/appointments/calendar-services.routes"));
const db_configuration_1 = __importDefault(require("./db/db_configuration"));
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
const app = (0, express_1.default)();
// Render (y cualquier proxy reverso) pone la IP real del cliente en X-Forwarded-For.
// Sin trust proxy, req.ip devuelve la IP del proxy → todos parecen el mismo visitante.
app.set("trust proxy", 1);
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            ...helmet_1.default.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
            "frame-src": ["https://accounts.google.com"],
            "connect-src": ["'self'", "https://accounts.google.com", "https://accounts.googleapis.com", "https://oauth2.googleapis.com"],
            "img-src": ["'self'", "data:", "https://lh3.googleusercontent.com", "https://*.googleusercontent.com"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Permite peticiones sin origin (mobile, Postman, server-to-server)
        if (!origin)
            return callback(null, true);
        if (env_1.CORS_ORIGINS.includes(origin))
            return callback(null, true);
        callback(new Error(`Origin no permitido: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json({ limit: "1mb" }));
// ─── Rate limiting en rutas de auth ──────────────────────────────────────────
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 intentos por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, message: "Demasiados intentos. Intenta en 15 minutos." },
});
// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});
// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use("/generated-pdfs", express_1.default.static(quote_service_1.GENERATED_PDFS_DIR));
app.use(passport_1.default.initialize());
app.use(mp_webhook_router_1.default);
app.use(mp_connect_router_1.default);
app.use(admin_router_1.default);
app.use(company_profile_router_1.default);
app.use(appointments_admin_routes_1.default);
app.use(calendar_providers_routes_1.default);
app.use(calendar_services_routes_1.default);
app.use("/auth", authLimiter, login_router_1.default);
app.use("/api/public", portal_session_middleware_1.portalSessionMiddleware);
app.use(calendar_public_router_1.default);
app.use("/api", chat_admin_router_1.default);
app.use("/api", chat_config_router_1.default);
app.use("/api", chat_public_router_1.default);
app.use("/api", notification_routes_1.default);
app.use("/api", slug_router_1.default);
app.use(public_portal_routes_1.default);
app.use("/products", quotes_router_1.default);
app.use("/api", stadistics_router_1.default);
app.use("/api", quotes_extended_routes_1.default);
app.use("/api", services_router_1.default);
app.use("/api", clients_router_1.default);
app.use("/api", blocks_router_1.default);
app.use(error_middleware_1.errorMiddleware);
// ─── Arranque ─────────────────────────────────────────────────────────────────
const server = app.listen(env_1.PORT, async () => {
    console.log(`[server] Escuchando en puerto ${env_1.PORT}`);
    (0, reminder_cron_1.startReminderCron)();
    await Promise.all([
        (0, quote_services_repository_1.initQuoteServicesTable)().catch((e) => console.error("[init] quote_services:", e)),
        (0, quote_history_repository_1.initQuoteHistoryTable)().catch((e) => console.error("[init] quote_history:", e)),
        (0, appointments_admin_repository_1.initCalendarBookingPriceColumn)().catch((e) => console.error("[init] calendar_booking_price:", e)),
        (0, calendar_services_repository_1.initCalendarServicesTable)().catch((e) => console.error("[init] calendar_services:", e)),
        (0, reviews_repository_1.initReviewsGoogleColumns)().catch((e) => console.error("[init] reviews_google:", e)),
    ]);
});
// ─── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown(signal) {
    console.log(`[server] ${signal} recibido — cerrando...`);
    server.close(async () => {
        try {
            await db_configuration_1.default.getPool().end();
            console.log("[server] Pool de DB cerrado. Proceso terminado.");
        }
        catch (err) {
            console.error("[server] Error cerrando pool:", err);
        }
        process.exit(0);
    });
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
