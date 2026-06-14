import { Request, Response } from "express";
import {
  createSource,
  updateSourceChunkCount,
  insertChunks,
  getSourcesByUserId,
  deleteSource,
} from "./chat.repository";
import { extractChunksFromPdf } from "./chat.service";

export const chatAdminController = {

  async uploadPdf(req: Request, res: Response): Promise<Response> {
    try {
      const userId = String(req.params["userId"] || "").trim();
      const jwtUserId = req.user?.userId;

      if (jwtUserId !== userId) {
        return res.status(403).json({ ok: false, message: "Acceso no autorizado." });
      }

      const file = (req as any).file as { buffer: Buffer; mimetype: string; originalname: string } | undefined;

      if (!file) {
        return res.status(400).json({ ok: false, message: "No se recibió ningún archivo PDF." });
      }

      if (file.mimetype !== "application/pdf") {
        return res.status(400).json({ ok: false, message: "Solo se aceptan archivos PDF." });
      }

      const chunks = await extractChunksFromPdf(file.buffer);

      if (chunks.length === 0) {
        return res.status(400).json({ ok: false, message: "No se pudo extraer texto del PDF." });
      }

      const source = await createSource(userId, file.originalname);
      await insertChunks(userId, source.id, chunks);
      await updateSourceChunkCount(source.id, chunks.length);

      return res.status(201).json({
        ok: true,
        message: `PDF procesado correctamente. ${chunks.length} fragmentos indexados.`,
        source: { ...source, chunk_count: chunks.length },
      });
    } catch (error) {
      console.error("[chat] Error procesando PDF:", error);
      return res.status(500).json({ ok: false, message: "No se pudo procesar el PDF." });
    }
  },

  async listSources(req: Request, res: Response): Promise<Response> {
    try {
      const userId = String(req.params["userId"] || "").trim();
      const jwtUserId = req.user?.userId;

      if (jwtUserId !== userId) {
        return res.status(403).json({ ok: false, message: "Acceso no autorizado." });
      }

      const sources = await getSourcesByUserId(userId);
      return res.json({ ok: true, sources });
    } catch (error) {
      console.error("[chat] Error listando fuentes:", error);
      return res.status(500).json({ ok: false, message: "No se pudieron obtener las fuentes." });
    }
  },

  async deleteSource(req: Request, res: Response): Promise<Response> {
    try {
      const userId   = String(req.params["userId"]   || "").trim();
      const sourceId = String(req.params["sourceId"] || "").trim();
      const jwtUserId = req.user?.userId;

      if (jwtUserId !== userId) {
        return res.status(403).json({ ok: false, message: "Acceso no autorizado." });
      }

      const deleted = await deleteSource(sourceId, userId);

      if (!deleted) {
        return res.status(404).json({ ok: false, message: "Fuente no encontrada." });
      }

      return res.json({ ok: true, message: "Fuente eliminada correctamente." });
    } catch (error) {
      console.error("[chat] Error eliminando fuente:", error);
      return res.status(500).json({ ok: false, message: "No se pudo eliminar la fuente." });
    }
  },
};
