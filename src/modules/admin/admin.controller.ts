import { Request, Response } from "express";
import { getAllUsersWithFee, updateUserFeePct } from "./admin.repository";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID ?? "";

function getRequestUserId(req: Request): string {
  return String(req.user?.userId ?? "").trim();
}

function isAdmin(req: Request): boolean {
  return !!ADMIN_USER_ID && getRequestUserId(req) === ADMIN_USER_ID;
}

export const adminController = {

  async checkIsAdmin(req: Request, res: Response): Promise<Response> {
    return res.json({ ok: true, isAdmin: isAdmin(req) });
  },

  async getUsers(req: Request, res: Response): Promise<Response> {
    if (!isAdmin(req)) {
      return res.status(403).json({ ok: false, message: "Acceso denegado" });
    }
    try {
      const users = await getAllUsersWithFee();
      return res.json({ ok: true, users });
    } catch {
      return res.status(500).json({ ok: false, message: "Error al obtener usuarios" });
    }
  },

  async updateFee(req: Request, res: Response): Promise<Response> {
    if (!isAdmin(req)) {
      return res.status(403).json({ ok: false, message: "Acceso denegado" });
    }
    try {
      const userId = String(req.params["userId"] ?? "").trim();
      const pct = Number(req.body?.fee_pct);

      if (!userId) return res.status(400).json({ ok: false, message: "userId requerido" });
      if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
        return res.status(400).json({ ok: false, message: "Porcentaje inválido (0–100)" });
      }

      await updateUserFeePct(userId, pct);
      return res.json({ ok: true, message: "Comisión actualizada" });
    } catch {
      return res.status(500).json({ ok: false, message: "Error actualizando comisión" });
    }
  },
};
