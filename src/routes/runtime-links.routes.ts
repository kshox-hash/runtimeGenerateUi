import express from "express";
import { runtimeController } from "../controller/runtime.controller";

const router = express.Router();

router.post("/api/runtime-links", runtimeController.createRuntimeLink);
router.get("/api/runtime-links/:token", runtimeController.getRuntimeLink);
router.post("/api/runtime-links/:token/submit", runtimeController.submitRuntimeLink);
router.get("/api/runtime-links/:token/submissions", runtimeController.getSubmissions);

router.get("/debug/tokens", runtimeController.debugTokens);

router.get("/v/:token", runtimeController.renderRuntimeView);

router.get("/demo/create", runtimeController.createDemo);

router.get("/open/cotizador/:leadId", runtimeController.openCotizador);
router.get("/open/reservas/:leadId", runtimeController.openReservas);
router.get("/open/chatbot/:leadId", runtimeController.openChatbot);
router.get(
  "/open/cotizador-dinamico/:userId/:leadId",
  runtimeController.openCotizadorDinamico
);

export default router;