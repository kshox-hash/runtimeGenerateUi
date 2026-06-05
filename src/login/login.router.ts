import { Router } from "express";
import { loginController, googleLoginController } from "./login.controller";

const router = Router();

router.post("/login", loginController);
router.post("/google", googleLoginController);

export default router;