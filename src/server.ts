import express from "express";
import cors from "cors";

import runtimeLinksRouter from "./runtime/runtime-links.routes";
import { PORT, BASE_URL } from "./config/env";
import { GENERATED_PDFS_DIR } from "./modules/quotes/quote.service";

import generatePdfRouter from "./modules/quotes/quote-config.routes";
import companyProfileRoutes from "./modules/profiles/company-profile.router";
import loginRoutes from "./login/login.router";
import calendarAdminRoutes from "./modules/appointments/appointments-admin.routes";

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

app.use(runtimeLinksRouter);
app.use(generatePdfRouter);
app.use(companyProfileRoutes);
app.use(calendarAdminRoutes);
app.use("/auth", loginRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${BASE_URL}`);
  console.log(`Demo disponible en: ${BASE_URL}/demo/create`);
});