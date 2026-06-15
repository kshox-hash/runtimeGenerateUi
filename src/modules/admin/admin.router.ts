import express from "express";
import { authMiddleware } from "../../middlewares/auth_middleware";
import { adminController } from "./admin.controller";

const router = express.Router();

router.get("/api/admin/is-admin",              authMiddleware, adminController.checkIsAdmin);
router.get("/api/admin/users",                 authMiddleware, adminController.getUsers);
router.patch("/api/admin/users/:userId/fee",   authMiddleware, adminController.updateFee);

export default router;
