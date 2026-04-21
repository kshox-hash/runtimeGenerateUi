import express from "express";
import cors from "cors";

import runtimeLinksRouter from "./routes/runtime-links.routes";
import { PORT, BASE_URL } from "./config/env";
import { GENERATED_PDFS_DIR } from "./services/pdf.service";

//routes 
import generatePdfRouter from "./routes/pdf-config.routes";
import companyProfileRoutes from "./routes/company-profile.router";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/generated-pdfs", express.static(GENERATED_PDFS_DIR));
app.use(runtimeLinksRouter);
app.use(generatePdfRouter);
app.use(companyProfileRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en ${BASE_URL}`);
  console.log(`Demo disponible en: ${BASE_URL}/demo/create`);
});