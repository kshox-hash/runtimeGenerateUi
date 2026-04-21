import { Router } from "express";
import { companyProfileController } from "../controller/company_profile.controller";

const router = Router();

router.get("/company-profile/:userId", companyProfileController.getByUserId);
router.post("/company-profile", companyProfileController.upsert);

export default router;