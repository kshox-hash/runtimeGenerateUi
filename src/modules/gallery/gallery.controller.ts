import { Request, Response } from "express";
import cloudinary from "../../config/cloudinary.config";
import { getSlugByValueService } from "../slug/slug.service";
import {
  addGalleryPhoto,
  getGalleryPhotosByUserId,
  getOrphanPhotosPaginated,
  updateGalleryPhotoDescription,
  deleteGalleryPhoto,
  createFolder,
  listFolders,
  updateFolder,
  deleteFolder,
  listFoldersWithPhotos,
} from "./gallery.repository";

export const galleryController = {

  // ── Photos ──────────────────────────────────────────────────────────────────

  async upload(req: Request, res: Response) {
    try {
      const userId   = String(req.user?.userId ?? "").trim();
      const file     = (req as any).file as Express.Multer.File | undefined;
      if (!file) return res.status(400).json({ ok: false, message: "No se recibió ninguna imagen." });

      const description = req.body?.description
        ? String(req.body.description).trim() || null
        : null;
      const folderId = req.body?.folderId
        ? String(req.body.folderId).trim() || null
        : null;

      const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `gallery/${userId}`,
            transformation: [
              { width: 2400, height: 1800, crop: "fill", gravity: "auto" },
              { quality: 88, fetch_format: "auto" },
            ],
          },
          (err, result) => {
            if (err || !result) return reject(err ?? new Error("Upload failed"));
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      const photo = await addGalleryPhoto(userId, uploadResult.secure_url, description, folderId);
      return res.json({ ok: true, photo });
    } catch (err) {
      console.error("[gallery] upload:", err);
      return res.status(500).json({ ok: false, message: "No se pudo subir la foto." });
    }
  },

  async list(req: Request, res: Response) {
    try {
      const userId = String(req.user?.userId ?? "").trim();
      const photos = await getGalleryPhotosByUserId(userId);
      return res.json({ ok: true, photos });
    } catch (err) {
      console.error("[gallery] list:", err);
      return res.status(500).json({ ok: false, message: "Error al obtener la galería." });
    }
  },

  async updateDescription(req: Request, res: Response) {
    try {
      const userId      = String(req.user?.userId ?? "").trim();
      const id          = String(req.params["id"] || "").trim();
      const description = req.body?.description
        ? String(req.body.description).trim() || null
        : null;

      const photo = await updateGalleryPhotoDescription(id, userId, description);
      if (!photo) return res.status(404).json({ ok: false, message: "Foto no encontrada." });
      return res.json({ ok: true, photo });
    } catch (err) {
      console.error("[gallery] updateDescription:", err);
      return res.status(500).json({ ok: false, message: "Error al actualizar." });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      const userId = String(req.user?.userId ?? "").trim();
      const id     = String(req.params["id"] || "").trim();

      const url = await deleteGalleryPhoto(id, userId);
      if (!url) return res.status(404).json({ ok: false, message: "Foto no encontrada." });

      const publicId = url.split("/upload/")[1]?.replace(/\.[^.]+$/, "");
      if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});

      return res.json({ ok: true });
    } catch (err) {
      console.error("[gallery] remove:", err);
      return res.status(500).json({ ok: false, message: "Error al eliminar." });
    }
  },

  async listPublic(req: Request, res: Response) {
    try {
      const publicSlug = String(req.params["publicSlug"] || "").trim();
      const limit  = Math.min(Math.max(parseInt(String(req.query["limit"]  || "20"), 10) || 20, 1), 50);
      const offset = Math.max(parseInt(String(req.query["offset"] || "0"),  10) || 0, 0);
      const slug = await getSlugByValueService(publicSlug);
      if (!slug) return res.status(404).json({ ok: false, message: "Negocio no encontrado." });
      const { photos, total } = await getOrphanPhotosPaginated(slug.user_id, limit, offset);
      return res.json({ ok: true, photos, total });
    } catch (err) {
      console.error("[gallery] listPublic:", err);
      return res.status(500).json({ ok: false, message: "Error al obtener la galería." });
    }
  },

  // ── Folders ─────────────────────────────────────────────────────────────────

  async createFolder(req: Request, res: Response) {
    try {
      const userId      = String(req.user?.userId ?? "").trim();
      const name        = String(req.body?.name || "").trim();
      const description = req.body?.description
        ? String(req.body.description).trim() || null
        : null;

      if (!name) return res.status(400).json({ ok: false, message: "El nombre es obligatorio." });

      const folder = await createFolder(userId, name, description);
      return res.status(201).json({ ok: true, folder });
    } catch (err) {
      console.error("[gallery] createFolder:", err);
      return res.status(500).json({ ok: false, message: "Error al crear la carpeta." });
    }
  },

  async listFolders(req: Request, res: Response) {
    try {
      const userId = String(req.user?.userId ?? "").trim();
      const folders = await listFolders(userId);
      return res.json({ ok: true, folders });
    } catch (err) {
      console.error("[gallery] listFolders:", err);
      return res.status(500).json({ ok: false, message: "Error al obtener las carpetas." });
    }
  },

  async listFoldersWithPhotos(req: Request, res: Response) {
    try {
      const userId = String(req.user?.userId ?? "").trim();
      const result = await listFoldersWithPhotos(userId);
      return res.json({ ok: true, ...result });
    } catch (err) {
      console.error("[gallery] listFoldersWithPhotos:", err);
      return res.status(500).json({ ok: false, message: "Error al obtener la galería." });
    }
  },

  async updateFolder(req: Request, res: Response) {
    try {
      const userId      = String(req.user?.userId ?? "").trim();
      const id          = String(req.params["id"] || "").trim();
      const name        = String(req.body?.name || "").trim();
      const description = req.body?.description
        ? String(req.body.description).trim() || null
        : null;

      if (!name) return res.status(400).json({ ok: false, message: "El nombre es obligatorio." });

      const folder = await updateFolder(id, userId, name, description);
      if (!folder) return res.status(404).json({ ok: false, message: "Carpeta no encontrada." });
      return res.json({ ok: true, folder });
    } catch (err) {
      console.error("[gallery] updateFolder:", err);
      return res.status(500).json({ ok: false, message: "Error al actualizar la carpeta." });
    }
  },

  async deleteFolder(req: Request, res: Response) {
    try {
      const userId = String(req.user?.userId ?? "").trim();
      const id     = String(req.params["id"] || "").trim();

      const deleted = await deleteFolder(id, userId);
      if (!deleted) return res.status(404).json({ ok: false, message: "Carpeta no encontrada." });
      return res.json({ ok: true });
    } catch (err) {
      console.error("[gallery] deleteFolder:", err);
      return res.status(500).json({ ok: false, message: "Error al eliminar la carpeta." });
    }
  },

  async listFoldersPublic(req: Request, res: Response) {
    try {
      const publicSlug = String(req.params["publicSlug"] || "").trim();
      const slug = await getSlugByValueService(publicSlug);
      if (!slug) return res.status(404).json({ ok: false, message: "Negocio no encontrado." });
      const result = await listFoldersWithPhotos(slug.user_id);
      return res.json({ ok: true, ...result });
    } catch (err) {
      console.error("[gallery] listFoldersPublic:", err);
      return res.status(500).json({ ok: false, message: "Error al obtener la galería." });
    }
  },
};
