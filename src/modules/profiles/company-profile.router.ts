import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth_middleware";
import { companyProfileController } from "./company_profile.controller";

const router = Router();

// Pública — no requiere auth
router.get("/public/business/:slug", companyProfileController.getByPublicSlug);

// Rutas privadas
router.get("/company-profile/me", authMiddleware, companyProfileController.getMe);
router.post("/company-profile/me", authMiddleware, companyProfileController.upsertMe);
router.get("/company-profile/:userId", authMiddleware, companyProfileController.getByUserId);
router.post("/company-profile", authMiddleware, companyProfileController.upsert);

export default router;