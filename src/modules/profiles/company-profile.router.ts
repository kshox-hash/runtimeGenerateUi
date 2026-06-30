import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../middlewares/auth_middleware";
import { companyProfileController } from "./company_profile.controller";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se aceptan imágenes (JPEG, PNG, WEBP, GIF)."));
    }
  },
});

// Pública — no requiere auth
router.get("/public/business/:slug", companyProfileController.getByPublicSlug);

// Rutas privadas
router.get("/company-profile/me", authMiddleware, companyProfileController.getMe);
router.post("/company-profile/me", authMiddleware, companyProfileController.upsertMe);
router.post("/company-profile/me/cover-image", authMiddleware, upload.single("photo"), companyProfileController.uploadCoverImage);
router.get("/company-profile/:userId", authMiddleware, companyProfileController.getByUserId);
router.post("/company-profile", authMiddleware, companyProfileController.upsert);

export default router;