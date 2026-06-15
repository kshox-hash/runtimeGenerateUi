import { Request, Response } from "express";
import { companyProfileService } from "./company_profile.service";

type GetByUserIdParams = {
  userId: string;
};

type GetByPublicSlugParams = {
  slug: string;
};

type UpsertBody = {
  user_id: string;
  business_name: string;
  rut?: string | null;
  city?: string;
  address?: string;
  phone?: string;
  brand_color?: string | null;
};

type UpsertMeBody = {
  business_name: string;
  rut?: string | null;
  city?: string;
  address?: string;
  phone?: string;
  brand_color?: string | null;
};

export const companyProfileController = {
  async getMe(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
      }

      const profile = await companyProfileService.getByUserId(userId);

      return res.json({
        ok: true,
        profile,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Error obteniendo perfil de empresa",
      });
    }
  },

  async getByUserId(
    req: Request<GetByUserIdParams>,
    res: Response,
  ): Promise<Response> {
    try {
      const userId = req.params.userId;

      if (!userId || !userId.trim()) {
        return res.status(400).json({
          ok: false,
          message: "userId es obligatorio",
        });
      }

      const profile = await companyProfileService.getByUserId(userId);

      return res.json({
        ok: true,
        profile,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Error obteniendo perfil de empresa",
      });
    }
  },

  async getByPublicSlug(
    req: Request<GetByPublicSlugParams>,
    res: Response,
  ): Promise<Response> {
    try {
      const slug = req.params.slug;

      if (!slug || !slug.trim()) {
        return res.status(400).json({
          ok: false,
          message: "slug es obligatorio",
        });
      }

      const profile = await companyProfileService.getByPublicSlug(slug);

      if (!profile) {
        return res.status(404).json({
          ok: false,
          message: "Perfil público no encontrado",
        });
      }

      return res.json({
        ok: true,
        profile,
      });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Error obteniendo perfil público",
      });
    }
  },

  async upsert(
    req: Request<unknown, unknown, UpsertBody>,
    res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ ok: false, message: "Usuario no autenticado" });
      }

      const profile = await companyProfileService.upsert({
        ...req.body,
        user_id: userId,
      });

      return res.json({ ok: true, profile });
    } catch (error) {
      return res.status(400).json({
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Error guardando perfil de empresa",
      });
    }
  },

  async upsertMe(
    req: Request<unknown, unknown, UpsertMeBody>,
    res: Response,
  ): Promise<Response> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          ok: false,
          message: "Usuario no autenticado",
        });
      }

      const profile = await companyProfileService.upsert({
        ...req.body,
        user_id: userId,
      });

      return res.json({
        ok: true,
        profile,
      });
    } catch (error) {
      return res.status(400).json({
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Error guardando perfil de empresa",
      });
    }
  },
};