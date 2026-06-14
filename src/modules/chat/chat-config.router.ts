import express, { Request, Response } from "express";
import { authMiddleware } from "../../middlewares/auth_middleware";
import { getBusinessChatConfig, upsertBusinessChatConfig, FaqItem } from "./chat-config.repository";

const router = express.Router();

router.get("/chat/:userId/config", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId    = String(req.params["userId"] || "").trim();
    const requester = req.user?.userId ?? "";

    if (userId !== requester) {
      return res.status(403).json({ ok: false, message: "Sin permisos." });
    }

    const config = await getBusinessChatConfig(userId);

    return res.json({
      ok: true,
      config: config ?? { description: null, faq: [], extraInfo: null },
    });
  } catch {
    return res.status(500).json({ ok: false, message: "Error cargando configuración." });
  }
});

router.put("/chat/:userId/config", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId    = String(req.params["userId"] || "").trim();
    const requester = req.user?.userId ?? "";

    if (userId !== requester) {
      return res.status(403).json({ ok: false, message: "Sin permisos." });
    }

    const { description, faq, extraInfo } = req.body ?? {};

    const safeFaq: FaqItem[] = Array.isArray(faq)
      ? faq.filter(
          (f): f is FaqItem =>
            typeof f?.question === "string" && typeof f?.answer === "string"
        )
      : [];

    await upsertBusinessChatConfig(userId, {
      description: description ? String(description).slice(0, 2000) : null,
      faq:         safeFaq,
      extraInfo:   extraInfo ? String(extraInfo).slice(0, 3000) : null,
    });

    return res.json({ ok: true, message: "Configuración guardada." });
  } catch {
    return res.status(500).json({ ok: false, message: "Error guardando configuración." });
  }
});

export default router;
