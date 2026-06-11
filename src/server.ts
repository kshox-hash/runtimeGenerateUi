import dotenv from 'dotenv'
dotenv.config();

import express from "express";
import cors from "cors";

import runtimeLinksRouter from "./runtime/runtime.routes";
import { PORT} from "./config/env";
import { GENERATED_PDFS_DIR } from "./modules/quotes/quote.service";

import companyProfileRoutes from "./modules/profiles/company-profile.router";
import loginRoutes from "./login/login.router";
import calendarAdminRoutes from "./modules/appointments/appointments-admin.routes";
import bookingConfirmationRoutes from "./runtime/booking/routes/bookingConfirmationRoutes";
import notificationRoutes from "./modules/notifications/notification.routes";
import passport from "passport";
import "./login/strategies/google.strategy";
import slugRoutes from "./modules/slug/slug.router";
import { errorMiddleware } from './middlewares/error_middleware';
import publicPortalRouter from "./modules/menus/public-portal/public-portal.routes"


const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options(/.*/, cors());

app.use(express.json({ limit: "1mb" }));

app.use("/generated-pdfs", express.static(GENERATED_PDFS_DIR));
app.use(passport.initialize());
app.use(runtimeLinksRouter);
app.use(companyProfileRoutes);
app.use(calendarAdminRoutes);
app.use("/auth", loginRoutes);
app.use(bookingConfirmationRoutes);
app.use("/api", notificationRoutes);
app.use("/api", slugRoutes);
app.use(publicPortalRouter)
app.use(errorMiddleware);

app.listen(PORT, () => {
 console.log("server up")
});