import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth_middleware";
import {
  insertSlugController,
  getMySlugController,
} from "./slug.controller";

const router = Router();

router.get("/slugs/me", authMiddleware, getMySlugController);

router.post("/slugs", authMiddleware, insertSlugController);

export default router;