import express, { Request, Response } from "express";
import { BASE_URL } from "../config/env";
import {
  buildChatbotConfig,
  buildCotizadorConfig,
  buildReservasConfig,
} from "../builders/view-config.builder";
import { buildRuntimeConfigFromSavedPdf } from "../builders/runtime-config-from-pdf.builder";
import { generateQuotePdf } from "../services/pdf.service";
import {
  cleanupRuntimeLinks,
  createRuntimeRecord,
  getRecordOrNull,
  runtimeLinks,
} from "../services/runtime-links.service";
import { renderViewHtml } from "../services/view-html.service";
import { sendWhatsAppTextMessage } from "../services/whatsapp.service";
import {
  CreateRuntimeLinkBody,
  RuntimeLinkRecord,
  SubmitBody,
  ViewConfig,
} from "../types/runtime";
import { generateToken } from "../utils/token";

const router = express.Router();

function validateConfig(config: unknown): config is ViewConfig {
  if (!config || typeof config !== "object") return false;
  const c = config as ViewConfig;
  if (typeof c.title !== "string" || !Array.isArray(c.components)) return false;
  return true;
}

setInterval(() => {
  cleanupRuntimeLinks();
}, 1000 * 60 * 5);

router.post(
  "/api/runtime-links",
  (req: Request<{}, {}, CreateRuntimeLinkBody>, res: Response) => {
    const { expiresInMinutes = 10, config } = req.body;

    if (!validateConfig(config)) {
      return res.status(400).json({ ok: false, message: "Config inválida." });
    }

    if (
      typeof expiresInMinutes !== "number" ||
      expiresInMinutes <= 0 ||
      expiresInMinutes > 120
    ) {
      return res.status(400).json({
        ok: false,
        message: "expiresInMinutes debe ser un número entre 1 y 120.",
      });
    }

    const token = generateToken();
    const now = Date.now();

    const record: RuntimeLinkRecord = {
      token,
      config,
      createdAt: now,
      expiresAt: now + expiresInMinutes * 60 * 1000,
      status: "active",
      submissions: [],
    };

    runtimeLinks.set(token, record);

    return res.status(201).json({
      ok: true,
      token,
      url: `${BASE_URL}/v/${token}`,
      expiresAt: new Date(record.expiresAt).toISOString(),
    });
  }
);

router.get(
  "/api/runtime-links/:token",
  (req: Request<{ token: string }>, res: Response) => {
    const { token } = req.params;
    const record = getRecordOrNull(token);

    if (!record) {
      return res.status(404).json({ ok: false, message: "Link no encontrado." });
    }

    if (record.status === "expired") {
      return res.status(410).json({
        ok: false,
        status: "expired",
        message: "Este enlace expiró.",
      });
    }

    return res.json({
      ok: true,
      token: record.token,
      status: record.status,
      expiresAt: new Date(record.expiresAt).toISOString(),
      config: record.config,
    });
  }
);

router.post(
  "/api/runtime-links/:token/submit",
  async (req: Request<{ token: string }, {}, SubmitBody>, res: Response) => {
    try {
      const { token } = req.params;
      const record = getRecordOrNull(token);

      if (!record) {
        return res.status(404).json({ ok: false, message: "Link no encontrado." });
      }

      if (record.status === "expired") {
        return res.status(410).json({ ok: false, message: "Este enlace expiró." });
      }

      const body = req.body || {};
      const pdfResult = await generateQuotePdf(record, body);
      const pdfUrl = `${BASE_URL}/generated-pdfs/${pdfResult.fileName}`;

      record.submissions.push({
        ...body,
        submittedAt: new Date().toISOString(),
        pdfUrl,
      });

      record.submittedAt = Date.now();
      record.status = "used";

      const recipientPhone =
        typeof record.config.recipientPhone === "string"
          ? record.config.recipientPhone
          : "";

      if (recipientPhone) {
        try {
          await sendWhatsAppTextMessage(
            recipientPhone,
            `Tu cotización está lista:\n ${pdfUrl}`
          );
        } catch (whatsAppError) {
          console.error("Error enviando link a WhatsApp:", whatsAppError);
        }
      }

      return res.json({
        ok: true,
        message: "Tu cotización está lista",
        pdfUrl,
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      return res.status(500).json({
        ok: false,
        message: "No se pudo generar el PDF.",
      });
    }
  }
);

router.get(
  "/api/runtime-links/:token/submissions",
  (req: Request<{ token: string }>, res: Response) => {
    const { token } = req.params;
    const record = runtimeLinks.get(token);

    if (!record) {
      return res.status(404).json({ ok: false, message: "Link no encontrado." });
    }

    return res.json({
      ok: true,
      token,
      status: record.status,
      submissions: record.submissions,
    });
  }
);

router.get("/debug/tokens", (_req: Request, res: Response) => {
  return res.json({
    ok: true,
    tokens: Array.from(runtimeLinks.keys()),
  });
});

router.get("/v/:token", (req: Request<{ token: string }>, res: Response) => {
  const { token } = req.params;
  const record = getRecordOrNull(token);

  if (!record) {
    return res.status(404).send("<h1>404</h1><p>Link no encontrado.</p>");
  }

  if (record.status === "expired") {
    return res
      .status(410)
      .send("<h1>Link expirado</h1><p>Este enlace ya no está disponible.</p>");
  }

  record.openedAt = Date.now();
  return res.send(renderViewHtml(record));
});

router.get("/demo/create", (_req: Request, res: Response) => {
  const demoConfig: ViewConfig = {
    brand: "Automatiza Fácil",
    title: "Cotización Inteligente",
    subtitle: "Selecciona productos y envía tu solicitud.",
    successMessage: "Solicitud enviada correctamente.",
    recipientPhone: "56900000000",
    components: [
      {
        type: "products",
        items: [
          {
            id: "p1",
            name: "Producto A",
            price: 50000,
            description: "Descripción opcional del producto.",
          },
          {
            id: "p2",
            name: "Producto B",
            price: 50000,
            description: "Descripción opcional del producto.",
          },
          {
            id: "p3",
            name: "Producto C",
            price: 50000,
            description: "Descripción opcional del producto.",
          },
        ],
      },
      {
        type: "form",
        fields: [
          {
            name: "name",
            label: "Nombre completo",
            inputType: "text",
            required: true,
            placeholder: "Ej: Juan Pérez",
          },
          {
            name: "email",
            label: "Correo electrónico",
            inputType: "email",
            required: true,
            placeholder: "Ej: juan@correo.com",
          },
          {
            name: "notes",
            label: "Mensaje (opcional)",
            inputType: "textarea",
            required: false,
            placeholder: "Escribe aquí cualquier detalle adicional...",
          },
        ],
      },
      {
        type: "button",
        label: "Enviar Cotización",
        action: { type: "submit" },
      },
    ],
  };

  const record = createRuntimeRecord(demoConfig, 15);

  return res.json({
    ok: true,
    token: record.token,
    url: `${BASE_URL}/v/${record.token}`,
    expiresAt: new Date(record.expiresAt).toISOString(),
  });
});

router.get(
  "/open/cotizador/:leadId",
  (req: Request<{ leadId: string }>, res: Response) => {
    const record = createRuntimeRecord(buildCotizadorConfig(req.params.leadId), 15);
    return res.redirect(`/v/${record.token}`);
  }
);

router.get(
  "/open/reservas/:leadId",
  (req: Request<{ leadId: string }>, res: Response) => {
    const record = createRuntimeRecord(buildReservasConfig(req.params.leadId), 15);
    return res.redirect(`/v/${record.token}`);
  }
);

router.get(
  "/open/chatbot/:leadId",
  (req: Request<{ leadId: string }>, res: Response) => {
    const record = createRuntimeRecord(buildChatbotConfig(req.params.leadId), 15);
    return res.redirect(`/v/${record.token}`);
  }
);

/**
 * NUEVA RUTA DINÁMICA:
 * usa la configuración guardada en BD desde Flutter
 */
router.get(
  "/open/cotizador-dinamico/:userId/:leadId",
  async (req: Request<{ userId: string; leadId: string }>, res: Response) => {
    try {
      const { userId, leadId } = req.params;

      const config = await buildRuntimeConfigFromSavedPdf(userId, leadId);
      const record = createRuntimeRecord(config, 15);

      return res.redirect(`/v/${record.token}`);
    } catch (error) {
      console.error("Error creando cotizador dinámico:", error);
      return res.status(500).json({
        ok: false,
        message: "No se pudo crear el cotizador dinámico.",
      });
    }
  }
);

export default router;