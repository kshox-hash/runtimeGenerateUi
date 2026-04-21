import { Request, Response } from "express";
import { companyProfileService } from "../services/company_profile.service";

type GetByUserIdParams = {
  userId: string;
};

type UpsertBody = {
  user_id: string;
  business_name: string;
  rut?: string | null;
  city?: string;
  address?: string;
  phone?: string;
};

export const companyProfileController = {
  async getByUserId(
    req: Request<GetByUserIdParams>,
    res: Response,
  ): Promise<Response> {
    try {
      const userId = req.params.userId;

      if (!userId || !userId.trim()) {
        return res.status(400).json({
          error: "userId es obligatorio",
        });
      }

      const profile = await companyProfileService.getByUserId(userId);

      if (!profile) {
        return res.status(404).json({
          error: "Perfil no encontrado",
        });
      }

      return res.status(200).json({
        data: profile,
      });
    } catch (error) {
      console.error("Error obteniendo perfil empresa:", error);

      const message =
        error instanceof Error ? error.message : "Error interno del servidor";

      if (message === "userId es obligatorio") {
        return res.status(400).json({ error: message });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
      });
    }
  },

  async upsert(
    req: Request<Record<string, never>, unknown, UpsertBody>,
    res: Response,
  ): Promise<Response> {
    try {
      const { user_id, business_name, rut, city, address, phone } = req.body;

      const profile = await companyProfileService.upsert({
        user_id,
        business_name,
        rut: rut ?? null,
        city: city ?? "",
        address: address ?? "",
        phone: phone ?? "",
      });

      return res.status(200).json({
        data: profile,
      });
    } catch (error) {
      console.error("Error guardando perfil empresa:", error);

      const message =
        error instanceof Error ? error.message : "Error interno del servidor";

      if (
        message === "user_id es obligatorio" ||
        message === "business_name es obligatorio"
      ) {
        return res.status(400).json({ error: message });
      }

      return res.status(500).json({
        error: "Error interno del servidor",
      });
    }
  },
};