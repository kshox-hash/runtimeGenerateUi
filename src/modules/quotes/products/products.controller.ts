import { Request, Response } from "express";
import { productsService } from "./products.service";

export const productsController = {

  async create(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.userId!;
      const product = await productsService.create(userId, req.body);
      return res.status(201).json({ ok: true, product });
    } catch (err: any) {
      return res.status(err.status || 500).json({ ok: false, message: err.message || "Error creando producto." });
    }
  },

  async getAll(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.userId!;
      const products = await productsService.getAll(userId);
      return res.json({ ok: true, products });
    } catch (err: any) {
      return res.status(err.status || 500).json({ ok: false, message: err.message || "Error obteniendo productos." });
    }
  },

  async getById(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.userId!;
      const product = await productsService.getById(userId, req.params.productId as string);
      return res.json({ ok: true, product });
    } catch (err: any) {
      return res.status(err.status || 500).json({ ok: false, message: err.message || "Error obteniendo producto." });
    }
  },

  async update(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.userId!;
      const product = await productsService.update(userId, req.params.productId as string, req.body);
      return res.json({ ok: true, product });
    } catch (err: any) {
      return res.status(err.status || 500).json({ ok: false, message: err.message || "Error actualizando producto." });
    }
  },

  async delete(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = req.user?.userId!;
      await productsService.delete(userId, req.params.productId as string);
      return res.json({ ok: true, message: "Producto eliminado." });
    } catch (err: any) {
      return res.status(err.status || 500).json({ ok: false, message: err.message || "Error eliminando producto." });
    }
  },

  // Ruta pública — para el cotizador
  async getActivePublic(req: Request, res: Response): Promise<Response | void> {
    try {
      const { userId } = req.params;
      const products = await productsService.getActiveProducts(userId as string);
      return res.json({ ok: true, products });
    } catch (err: any) {
      return res.status(err.status || 500).json({ ok: false, message: err.message || "Error obteniendo productos." });
    }
  },
};