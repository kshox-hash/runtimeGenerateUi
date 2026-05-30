import { Request, Response } from "express";
import { BASE_URL } from "../config/env";

import {
  buildChatbotConfig,
  buildCotizadorConfig,
  buildReservasConfig,
} from "../builders/view-config.builder";

import { buildRuntimeConfigFromSavedPdf } from "../modules/quotes/runtime-config-from-quote.builder";
import { generateQuotePdf } from "../modules/quotes/quote.service";

import {
  createRuntimeRecord,
  getRecordOrNull,
  runtimeLinks,
} from "./runtime-links.service";

import { renderViewHtml } from "../modules/quotes/quote-html.service";

import { sendWhatsAppTextMessage } from "../whatsapp/whatsapp.service";
import { findWhatsAppConfigByUserId } from "../whatsapp/whatsapp_configuration_repository";

import {
  CreateRuntimeLinkBody,
  RuntimeLinkRecord,
  SubmitBody,
  ViewConfig,
} from "./runtime";

import { generateToken } from "../utils/token";

import { buildMenuConfig } from "../modules/menus/menu.builder";
import { renderMenuHtml } from "../modules/menus/menu-html.service";

import { renderBookingHtml } from "../modules/appointments/appointments.screen";

import {
  buildCalendarSlots,
  reserveCalendarSlot,
} from "../modules/appointments/appointments.service";

import {
  createBookingConfirmationExpiresAt,
  createBookingConfirmationToken,
} from "../runtime/booking/services/bookingTokenService";

import {
  sendBookingConfirmationEmail,
} from "../runtime/booking/services/bookingEmailService";

import { notificationService } from "../modules/notificactions/notificaction.service";

function validateConfig(config: unknown): config is ViewConfig {
  if (!config || typeof config !== "object") return false;

  const c = config as ViewConfig;

  if (typeof c.title !== "string" || !Array.isArray(c.components)) {
    return false;
  }

  return true;
}

export const runtimeController = {
  async openCalendar(
    req: Request<{ userId: string; leadId: string }>,
    res: Response
  ) {
    try {
      const { userId, leadId } = req.params;

      if (!userId || !leadId) {
        return res.status(400).send("Parámetros inválidos.");
      }

      const config: ViewConfig = {
        viewType: "appointments",
        brand: "Automatiza Fácil",
        title: "Reserva tu hora",
        subtitle: "Elige el día y horario disponible para agendar tu atención.",
        successMessage: "Te enviamos un correo para confirmar tu hora.",
        userId,
        leadId,
        recipientPhone: leadId,
        components: [],
      };

      const record = createRuntimeRecord(config, 30);

      return res.redirect(`/calendar/${record.token}`);
    } catch (error) {
      console.error("Error abriendo calendario:", error);

      return res.status(500).send(
        `No se pudo abrir el calendario: ${
          error instanceof Error ? error.message : "error desconocido"
        }`
      );
    }
  },

  renderCalendarView(req: Request<{ token: string }>, res: Response) {
    const { token } = req.params;

    const record = getRecordOrNull(token);

    if (!record) {
      return res
        .status(404)
        .send("<h1>404</h1><p>Calendario no encontrado.</p>");
    }

    if (record.status === "expired") {
      return res
        .status(410)
        .send(
          "<h1>Calendario expirado</h1><p>Este enlace ya no está disponible.</p>"
        );
    }

    record.openedAt = Date.now();

    return res.send(renderBookingHtml(record));
  },

  async getCalendarSlots(req: Request<{ token: string }>, res: Response) {
    try {
      const { token } = req.params;

      const record = getRecordOrNull(token);

      if (!record) {
        return res.status(404).json({
          ok: false,
          message: "Link no encontrado.",
        });
      }

      if (record.status === "expired") {
        return res.status(410).json({
          ok: false,
          message: "Este enlace expiró.",
        });
      }

      const userId = String(record.config.userId || "");

      if (!userId) {
        return res.status(400).json({
          ok: false,
          message: "Usuario inválido.",
        });
      }

      const data = await buildCalendarSlots(userId);

      return res.json(data);
    } catch (error) {
      console.error("Error obteniendo disponibilidad:", error);

      return res.status(500).json({
        ok: false,
        message: "No se pudo cargar la disponibilidad.",
      });
    }
  },

  async openMenu(
    req: Request<{ userId: string; leadId: string }>,
    res: Response
  ) {
    try {
      const { userId, leadId } = req.params;

      if (!userId || !leadId) {
        return res.status(400).send("Parámetros inválidos.");
      }

      const config = await buildMenuConfig(userId, leadId);
      const record = createRuntimeRecord(config, 30);

      return res.redirect(`/menu/${record.token}`);
    } catch (error) {
      console.error("Error abriendo menú:", error);

      return res.status(500).send(
        `No se pudo abrir el menú: ${
          error instanceof Error ? error.message : "error desconocido"
        }`
      );
    }
  },

  renderMenuView(req: Request<{ token: string }>, res: Response) {
    const { token } = req.params;

    const record = getRecordOrNull(token);

    if (!record) {
      return res.status(404).send("<h1>404</h1><p>Menú no encontrado.</p>");
    }

    if (record.status === "expired") {
      return res
        .status(410)
        .send("<h1>Menú expirado</h1><p>Este enlace ya no está disponible.</p>");
    }

    record.openedAt = Date.now();

    return res.send(renderMenuHtml(record));
  },

  createRuntimeLink(req: Request<{}, {}, CreateRuntimeLinkBody>, res: Response) {
    const { expiresInMinutes = 10, config } = req.body;

    if (!validateConfig(config)) {
      return res.status(400).json({
        ok: false,
        message: "Config inválida.",
      });
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
  },

  getRuntimeLink(req: Request<{ token: string }>, res: Response) {
    const { token } = req.params;

    const record = getRecordOrNull(token);

    if (!record) {
      return res.status(404).json({
        ok: false,
        message: "Link no encontrado.",
      });
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
  },

  async submitRuntimeLink(
    req: Request<{ token: string }, {}, SubmitBody>,
    res: Response
  ) {
    try {
      const { token } = req.params;

      const record = getRecordOrNull(token);

      if (!record) {
        return res.status(404).json({
          ok: false,
          message: "Link no encontrado.",
        });
      }

      if (record.status === "expired") {
        return res.status(410).json({
          ok: false,
          message: "Este enlace expiró.",
        });
      }

      const body = req.body || {};

      if (record.config.viewType === "appointments") {
        const customer = body.customer || {};
        const slot = body.slot || {};

        const userId = String(record.config.userId || "");
        const leadId = String(record.config.leadId || "");

        const customerName = String(customer.name || "").trim();
        const customerPhone = String(customer.phone || "").trim();
        const customerEmail = String(customer.email || "").trim();
        const notes = String(customer.notes || "").trim();

        const bookingDate = String(slot.date || "").trim();
        const startTime = String(slot.time || "").trim();

        if (!userId || !leadId) {
          return res.status(400).json({
            ok: false,
            message: "Datos del calendario inválidos.",
          });
        }

        if (
          !customerName ||
          !customerPhone ||
          !customerEmail ||
          !bookingDate ||
          !startTime
        ) {
          return res.status(400).json({
            ok: false,
            message: "Faltan datos para reservar.",
          });
        }

        const confirmationToken = createBookingConfirmationToken();
        const confirmationExpiresAt = createBookingConfirmationExpiresAt();

        const publicBaseUrl =
          process.env.PUBLIC_BASE_URL || BASE_URL;

        const confirmationUrl =
          `${publicBaseUrl}/api/bookings/confirm/${confirmationToken}`;

       const booking = await reserveCalendarSlot({
          userId,
          leadId,
          customerName,
          customerPhone,
          customerEmail,
          notes,
          bookingDate,
          startTime,
          confirmationToken,
          confirmationExpiresAt,
        });

        await sendBookingConfirmationEmail({
          to: customerEmail,
          customerName,
          bookingDate,
          bookingTime: startTime,
          confirmationUrl,
        });

        record.submissions.push({
          ...body,
          booking,
          confirmationToken,
          confirmationExpiresAt: confirmationExpiresAt.toISOString(),
          confirmationUrl,
          emailSentAt: new Date().toISOString(),
          status: "pending_email_confirmation",
          submittedAt: new Date().toISOString(),
        });

        record.submittedAt = Date.now();
        record.status = "used";

        return res.json({
          ok: true,
          status: "pending_email_confirmation",
          message: "Te enviamos un correo para confirmar tu hora.",
          booking,
        });
      }

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

const userId =
  typeof record.config.userId === "string"
    ? record.config.userId
    : "";

const customerName =
  typeof body.customer?.name === "string"
    ? body.customer.name
    : "Cliente";

// NOTIFICACIÓN
if (userId) {
  await notificationService.quoteCreated({
    userId,
    quoteId: token,
    customerName,
  });
}

if (recipientPhone && userId) {
  try {
    const whatsappConfig = await findWhatsAppConfigByUserId(userId);

    if (
      whatsappConfig?.phone_number_id &&
      whatsappConfig?.whatsapp_access_token
    ) {
      await sendWhatsAppTextMessage(
        recipientPhone,
        `Tu cotización está lista:\n${pdfUrl}`,
        whatsappConfig.phone_number_id,
        whatsappConfig.whatsapp_access_token
      );
    }
  } catch (whatsAppError) {
    console.error(
      "Error enviando link a WhatsApp:",
      whatsAppError
    );
  }
}

return res.json({
  ok: true,
  message: "Tu cotización está lista",
  pdfUrl,
});
    } catch (error) {
      console.error("Error submitRuntimeLink:", error);

      return res.status(500).json({
        ok: false,
        message:
          error instanceof Error ? error.message : "Error interno del servidor.",
      });
    }
  },

  getSubmissions(req: Request<{ token: string }>, res: Response) {
    const { token } = req.params;

    const record = runtimeLinks.get(token);

    if (!record) {
      return res.status(404).json({
        ok: false,
        message: "Link no encontrado.",
      });
    }

    return res.json({
      ok: true,
      token,
      status: record.status,
      submissions: record.submissions,
    });
  },

  debugTokens(_req: Request, res: Response) {
    return res.json({
      ok: true,
      tokens: Array.from(runtimeLinks.keys()),
    });
  },

  renderRuntimeView(req: Request<{ token: string }>, res: Response) {
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
  },

  createDemo(_req: Request, res: Response) {
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
  },

  async openCotizador(req: Request<{ leadId: string }>, res: Response) {
    try {
      const rawLeadId = req.params.leadId;

      if (rawLeadId.includes("__")) {
        const [userId, leadId] = rawLeadId.split("__");

        if (!userId || !leadId) {
          return res.status(400).send("Parámetros inválidos.");
        }

        const config = await buildRuntimeConfigFromSavedPdf(userId, leadId);
        const record = createRuntimeRecord(config, 15);

        return res.redirect(`/v/${record.token}`);
      }

      const record = createRuntimeRecord(buildCotizadorConfig(rawLeadId), 15);

      return res.redirect(`/v/${record.token}`);
    } catch (error) {
      console.error("Error abriendo cotizador:", error);

      return res.status(500).send(
        `No se pudo abrir el cotizador: ${
          error instanceof Error ? error.message : "error desconocido"
        }`
      );
    }
  },

  openReservas(req: Request<{ leadId: string }>, res: Response) {
    const record = createRuntimeRecord(buildReservasConfig(req.params.leadId), 15);

    return res.redirect(`/v/${record.token}`);
  },

  openChatbot(req: Request<{ leadId: string }>, res: Response) {
    const record = createRuntimeRecord(buildChatbotConfig(req.params.leadId), 15);

    return res.redirect(`/v/${record.token}`);
  },

  async openCotizadorDinamico(
    req: Request<{ userId: string; leadId: string }>,
    res: Response
  ) {
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
  },
};