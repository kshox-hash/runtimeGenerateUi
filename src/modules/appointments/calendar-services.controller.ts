import { Request, Response } from "express";
import cloudinary from "../../config/cloudinary.config";
import {
  getServicesByUserId,
  getActiveServicesByUserId,
  createService,
  updateService,
  deleteService,
  addPhotoToService,
  removePhotoFromService,
} from "./calendar-services.repository";

const MAX_PHOTOS = 3;

export const calendarServicesController = {

  async list(req: Request, res: Response) {
    try {
      const userId = String(req.user?.userId ?? "").trim();
      const services = await getServicesByUserId(userId);
      return res.json({ ok: true, services });
    } catch (err) {
      console.error("[calendar-services] list:", err);
      return res.status(500).json({ ok: false, message: "No se pudieron cargar los servicios." });
    }
  },

  async listPublic(req: Request, res: Response) {
    try {
      const userId = String(req.params["userId"] || "").trim();
      const services = await getActiveServicesByUserId(userId);
      return res.json({ ok: true, services });
    } catch (err) {
      console.error("[calendar-services] listPublic:", err);
      return res.status(500).json({ ok: false, message: "No se pudieron cargar los servicios." });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const userId = String(req.user?.userId ?? "").trim();
      const body   = req.body || {};
      const name        = String(body.name  || "").trim();
      const description = body.description != null ? String(body.description).trim() || null : null;
      const unit        = String(body.unit  || "unidad").trim();
      const price       = Number(body.price ?? 0);
      const color       = String(body.color || "#63ACF1").trim();
      const durationMinutes = body.durationMinutes != null ? Number(body.durationMinutes) : null;

      if (!name) return res.status(400).json({ ok: false, message: "El nombre es obligatorio." });
      if (price < 0) return res.status(400).json({ ok: false, message: "El precio no puede ser negativo." });

      const service = await createService({ userId, name, description, unit, price, durationMinutes, color });
      return res.status(201).json({ ok: true, service });
    } catch (err) {
      console.error("[calendar-services] create:", err);
      return res.status(500).json({ ok: false, message: "No se pudo crear el servicio." });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const userId   = String(req.user?.userId ?? "").trim();
      const id       = String(req.params["id"] || "").trim();
      const body     = req.body || {};
      const name     = String(body.name  || "").trim();
      const price    = Number(body.price ?? 0);
      const color    = String(body.color || "#63ACF1").trim();
      const isActive = body.isActive !== false;
      const durationMinutes = body.durationMinutes != null ? Number(body.durationMinutes) : null;

      if (!name) return res.status(400).json({ ok: false, message: "El nombre es obligatorio." });

      const service = await updateService({ id, userId, name, price, durationMinutes, color, isActive });
      if (!service) return res.status(404).json({ ok: false, message: "Servicio no encontrado." });

      return res.json({ ok: true, service });
    } catch (err) {
      console.error("[calendar-services] update:", err);
      return res.status(500).json({ ok: false, message: "No se pudo actualizar el servicio." });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const userId = String(req.user?.userId ?? "").trim();
      const id     = String(req.params["id"] || "").trim();
      const deleted = await deleteService(id, userId);
      if (!deleted) return res.status(404).json({ ok: false, message: "Servicio no encontrado." });
      return res.json({ ok: true });
    } catch (err) {
      console.error("[calendar-services] remove:", err);
      return res.status(500).json({ ok: false, message: "No se pudo eliminar el servicio." });
    }
  },

  async uploadPhoto(req: Request, res: Response) {
    try {
      const userId = String(req.user?.userId ?? "").trim();
      const id     = String(req.params["id"] || "").trim();

      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) return res.status(400).json({ ok: false, message: "No se recibió ninguna imagen." });

      // Verificar límite de 3 fotos antes de subir
      const services = await getServicesByUserId(userId);
      const svc = services.find(s => s.id === id);
      if (!svc) return res.status(404).json({ ok: false, message: "Servicio no encontrado." });
      if (svc.photos.length >= MAX_PHOTOS) {
        return res.status(400).json({ ok: false, message: `Máximo ${MAX_PHOTOS} fotos por servicio.` });
      }

      // Subir a Cloudinary con compresión máxima para app de ventas
      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `services/${userId}`,
            transformation: [
              { width: 1200, height: 900, crop: "fill", gravity: "auto" },
              { quality: 85, fetch_format: "auto" },
            ],
          },
          (err, result) => {
            if (err || !result) return reject(err ?? new Error("Upload failed"));
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      const photos = await addPhotoToService(id, userId, uploadResult.secure_url);
      return res.json({ ok: true, photos });
    } catch (err) {
      console.error("[calendar-services] uploadPhoto:", err);
      return res.status(500).json({ ok: false, message: "No se pudo subir la foto." });
    }
  },

  async deletePhoto(req: Request, res: Response) {
    try {
      const userId = String(req.user?.userId ?? "").trim();
      const id     = String(req.params["id"] || "").trim();
      const url    = String(req.body?.url || "").trim();

      if (!url) return res.status(400).json({ ok: false, message: "URL requerida." });

      // Borrar de Cloudinary usando el public_id extraído de la URL
      const publicId = url.split("/upload/")[1]?.replace(/\.[^.]+$/, "");
      if (publicId) {
        await cloudinary.uploader.destroy(publicId).catch(() => {});
      }

      const photos = await removePhotoFromService(id, userId, url);
      if (photos === null) return res.status(404).json({ ok: false, message: "Servicio no encontrado." });
      return res.json({ ok: true, photos });
    } catch (err) {
      console.error("[calendar-services] deletePhoto:", err);
      return res.status(500).json({ ok: false, message: "No se pudo eliminar la foto." });
    }
  },
};
