import { Request, Response } from "express";
import * as repo from "./quote-services.repository";

export const quoteServicesController = {
  async list(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ ok: false, message: "No autorizado" });
      const services = await repo.listQuoteServices(userId);
      return res.json({ ok: true, services });
    } catch (e: any) {
      return res.status(500).json({ ok: false, message: e.message });
    }
  },

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ ok: false, message: "No autorizado" });
      const { name, description, unit = "unidad", price } = req.body;
      if (!name?.trim()) return res.status(400).json({ ok: false, message: "Nombre es requerido" });
      if (price == null || isNaN(Number(price)) || Number(price) < 0)
        return res.status(400).json({ ok: false, message: "Precio inválido" });
      const service = await repo.createQuoteService(userId, {
        name: name.trim(),
        description: description?.trim() || undefined,
        unit: unit || "unidad",
        price: Number(price),
      });
      return res.status(201).json({ ok: true, service });
    } catch (e: any) {
      return res.status(500).json({ ok: false, message: e.message });
    }
  },

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ ok: false, message: "No autorizado" });
      const serviceId = String(req.params["serviceId"]);
      const { name, description, unit, price, isActive } = req.body;
      const service = await repo.updateQuoteService(userId, serviceId, {
        name: name?.trim(),
        description: description !== undefined ? (description?.trim() || null) : undefined,
        unit: unit?.trim(),
        price: price != null ? Number(price) : undefined,
        isActive,
      });
      if (!service) return res.status(404).json({ ok: false, message: "Servicio no encontrado" });
      return res.json({ ok: true, service });
    } catch (e: any) {
      return res.status(500).json({ ok: false, message: e.message });
    }
  },

  async remove(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ ok: false, message: "No autorizado" });
      const deleted = await repo.deleteQuoteService(userId, String(req.params["serviceId"]));
      if (!deleted) return res.status(404).json({ ok: false, message: "Servicio no encontrado" });
      return res.json({ ok: true });
    } catch (e: any) {
      return res.status(500).json({ ok: false, message: e.message });
    }
  },
};
