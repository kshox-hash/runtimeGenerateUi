import express from "express";
import {
  getPdfConfigController,
  savePdfConfigController,
} from "../controller/pdf-config.controller";

const router = express.Router();

router.get("/api/pdf-config/:userId", getPdfConfigController);
router.post("/api/pdf-config", savePdfConfigController);

export default router;