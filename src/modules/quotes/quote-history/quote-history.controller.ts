import { Request, Response } from "express";
import * as repo from "./quote-history.repository";

export const quoteHistoryController = {
  async list(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ ok: false, message: "No autorizado" });
      const quotes = await repo.listQuoteHistory(userId);
      return res.json({ ok: true, quotes });
    } catch (e: any) {
      return res.status(500).json({ ok: false, message: e.message });
    }
  },

  async remove(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ ok: false, message: "No autorizado" });
      const deleted = await repo.deleteQuoteHistory(userId, String(req.params["quoteId"]));
      if (!deleted) return res.status(404).json({ ok: false, message: "No encontrado" });
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ ok: false, message: e.message });
    }
  },
};
