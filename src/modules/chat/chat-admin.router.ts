import express from "express";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const multer = require("multer");
import { authMiddleware } from "../../middlewares/auth_middleware";
import { chatAdminController } from "./chat-admin.controller";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req: any, file: any, cb: any) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo se aceptan archivos PDF."));
    }
  },
});

router.post("/chat/:userId/upload", authMiddleware, upload.single("pdf"), chatAdminController.uploadPdf);
router.get("/chat/:userId/sources", authMiddleware, chatAdminController.listSources);
router.delete("/chat/:userId/sources/:sourceId", authMiddleware, chatAdminController.deleteSource);

export default router;
