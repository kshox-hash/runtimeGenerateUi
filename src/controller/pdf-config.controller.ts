import { Request, Response } from "express";
import { getPdfConfig, savePdfConfig } from "../services/pdf-config.service";
import { SavePdfConfigInput } from "../types/pdf-config";

export const getPdfConfigController = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        ok: false,
        message: "userId es obligatorio.",
      });
    }

    const config = await getPdfConfig(userId);

    if (!config) {
      return res.status(404).json({
        ok: false,
        message: "No existe configuración PDF para este usuario.",
      });
    }

    return res.json({
      ok: true,
      data: config,
    });
  } catch (error: any) {
    console.error("Error obteniendo configuración PDF:", error);
    return res.status(500).json({
      ok: false,
      message: error?.message || "No se pudo obtener la configuración PDF.",
    });
  }
};

export const savePdfConfigController = async (
  req: Request<{}, {}, SavePdfConfigInput>,
  res: Response
) => {
  try {
    const body = req.body;

    if (!body?.userId) {
      return res.status(400).json({
        ok: false,
        message: "userId es obligatorio.",
      });
    }

    if (!body?.templateCode?.trim()) {
      return res.status(400).json({
        ok: false,
        message: "templateCode es obligatorio.",
      });
    }

    if (!Array.isArray(body.products)) {
      return res.status(400).json({
        ok: false,
        message: "products debe ser un arreglo.",
      });
    }

    await savePdfConfig(body);

    return res.json({
      ok: true,
      message: "Configuración PDF guardada correctamente.",
    });
  } catch (error: any) {
    console.error("Error guardando configuración PDF:", error);
    return res.status(500).json({
      ok: false,
      message: error?.message || "No se pudo guardar la configuración PDF.",
    });
  }
};