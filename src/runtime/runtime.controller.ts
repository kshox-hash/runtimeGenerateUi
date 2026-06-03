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

import { notificationService } from "../modules/notifications/notification.service";

import { companyProfileService } from "../modules/profiles/company_profile.service";
import { findEnabledModulesByUserId } from "../modules/menus/user-modules.repository";

import DB from "../db/db_configuration";
import { createPreference , getPaymentById} from "../modules/payments/mercado.service";

import {
  sendBookingConfirmationEmail,
} from "../runtime/booking/services/bookingEmailService";

import {
  sendBookingPaidEmail,
} from "../runtime/booking/services/bookingPaidEmailService";

import {
  sendBusinessBookingPaidEmail,
} from "../runtime/booking/services/businessBookingPaidEmailService";

function validateConfig(config: unknown): config is ViewConfig {
  if (!config || typeof config !== "object") return false;

  const c = config as ViewConfig;

  if (typeof c.title !== "string" || !Array.isArray(c.components)) {
    return false;
  }

  return true;
}

export const runtimeController = {

  paymentSuccess(req: Request, res: Response) {
  return res.send(`
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pago recibido</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background: #0f1011;
      color: #f3f4f6;
      font-family: Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .card {
      width: 100%;
      max-width: 460px;
      background: #16191f;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 26px;
      padding: 34px;
      text-align: center;
    }

    .icon {
      width: 72px;
      height: 72px;
      border-radius: 22px;
      background: #064e3b;
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 22px;
      font-size: 38px;
      font-weight: 800;
    }

    h1 {
      margin: 0 0 12px;
      font-size: 28px;
      line-height: 1.1;
    }

    p {
      color: #b8bdc7;
      font-size: 15px;
      line-height: 1.6;
      margin: 0;
    }

    .small {
      margin-top: 22px;
      font-size: 12px;
      color: #8b929f;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✓</div>
    <h1>Pago recibido</h1>
    <p>Tu pago fue aprobado. Estamos confirmando tu reserva.</p>
    <div class="small">Puedes cerrar esta ventana.</div>
  </div>
</body>
</html>
  `);
},

paymentFailure(req: Request, res: Response) {
  return res.send(`
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pago no completado</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background: #0f1011;
      color: #f3f4f6;
      font-family: Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .card {
      width: 100%;
      max-width: 460px;
      background: #16191f;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 26px;
      padding: 34px;
      text-align: center;
    }

    .icon {
      width: 72px;
      height: 72px;
      border-radius: 22px;
      background: #451a1a;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 22px;
      font-size: 34px;
      font-weight: 800;
    }

    h1 {
      margin: 0 0 12px;
      font-size: 28px;
      line-height: 1.1;
    }

    p {
      color: #b8bdc7;
      font-size: 15px;
      line-height: 1.6;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">!</div>
    <h1>Pago no completado</h1>
    <p>No se pudo completar el pago. Puedes volver e intentarlo nuevamente.</p>
  </div>
</body>
</html>
  `);
},

paymentPending(req: Request, res: Response) {
  return res.send(`
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pago pendiente</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      background: #0f1011;
      color: #f3f4f6;
      font-family: Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .card {
      width: 100%;
      max-width: 460px;
      background: #16191f;
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 26px;
      padding: 34px;
      text-align: center;
    }

    .icon {
      width: 72px;
      height: 72px;
      border-radius: 22px;
      background: #3b2f12;
      color: #f59e0b;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 22px;
      font-size: 34px;
      font-weight: 800;
    }

    h1 {
      margin: 0 0 12px;
      font-size: 28px;
      line-height: 1.1;
    }

    p {
      color: #b8bdc7;
      font-size: 15px;
      line-height: 1.6;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">…</div>
    <h1>Pago pendiente</h1>
    <p>Tu pago está siendo procesado. Te avisaremos cuando quede confirmado.</p>
  </div>
</body>
</html>
  `);
},


async mercadoPagoWebhook(req: Request, res: Response) {
  try {
    const topic = req.query.topic || req.query.type || req.body?.type;

    if (topic && topic !== "payment") {
      return res.status(200).json({
        ok: true,
        ignored: true,
        topic,
      });
    }

    const paymentId =
      req.body?.data?.id ||
      req.query?.["data.id"] ||
      req.query?.id;

    if (!paymentId) {
      return res.status(200).json({
        ok: true,
        ignored: true,
        message: "Webhook sin paymentId.",
      });
    }

    console.log("Payment ID recibido:", paymentId);

    const paymentInfo = await getPaymentById(
      process.env.ACCESS_TOKEN_MP!,
      String(paymentId)
    );

    console.log("Pago Mercado Pago:", paymentInfo);

    if (paymentInfo.status !== "approved") {
      return res.status(200).json({
        ok: true,
        ignored: true,
        paymentId,
        status: paymentInfo.status,
      });
    }

    const bookingId = String(paymentInfo.external_reference || "");

    if (!bookingId) {
      return res.status(200).json({
        ok: true,
        ignored: true,
        message: "Pago aprobado sin external_reference.",
        paymentId,
      });
    }

    const pool = DB.getPool();

    const paymentResult = await pool.query(
      `
      UPDATE payments
      SET
        status = 'paid',
        provider_payment_id = $1,
        paid_at = NOW()
      WHERE booking_id = $2
        AND provider = 'mercadopago'
      RETURNING *
      `,
      [String(paymentId), bookingId]
    );

    const payment = paymentResult.rows[0];

    if (!payment) {
      return res.status(200).json({
        ok: true,
        ignored: true,
        message: "Pago aprobado, pero no existe payment interno.",
        paymentId,
        bookingId,
      });
    }

    const bookingUpdateResult = await pool.query(
  `
  UPDATE calendar_bookings
  SET
    payment_status = 'paid',
    paid_at = NOW(),
    status = 'confirmed'
  WHERE id = $1
  RETURNING
    id,
    user_id,
    client_name,
    client_email,
    client_phone,
    booking_date,
    start_time
  `,
  [bookingId]
);

const confirmedBooking = bookingUpdateResult.rows[0];

if (confirmedBooking?.client_email) {
  await sendBookingPaidEmail({
    to: confirmedBooking.client_email,
    customerName: confirmedBooking.client_name || "Cliente",
    businessName: "Flowers",
    bookingDate: new Date(confirmedBooking.booking_date).toLocaleDateString("es-CL"),
    bookingTime: String(confirmedBooking.start_time).slice(0, 5),
  });
}

const businessEmail = process.env.BUSINESS_NOTIFICATION_EMAIL;

if (businessEmail && confirmedBooking) {
  await sendBusinessBookingPaidEmail({
    to: businessEmail,
    businessName: "Flowers",
    customerName: confirmedBooking.client_name || "Cliente",
    customerEmail: confirmedBooking.client_email || "",
    customerPhone: confirmedBooking.client_phone || "",
    bookingDate: new Date(confirmedBooking.booking_date).toLocaleDateString("es-CL"),
    bookingTime: String(confirmedBooking.start_time).slice(0, 5),
    amount: Number(payment.amount || 0),
  });
}

    return res.status(200).json({
      ok: true,
      message: "Pago aprobado y reserva actualizada.",
      paymentId,
      bookingId,
      payment,
    });
  } catch (error) {
    console.error("Error webhook Mercado Pago:", error);

    return res.status(500).json({
      ok: false,
      message: "Error procesando webhook.",
    });
  }
},

async createPublicBookingPayment(req: Request, res: Response) {
  try {
    const rawPublicSlug = req.params.publicSlug;
    const rawBookingId = req.params.bookingId;

    const publicSlug = Array.isArray(rawPublicSlug)
      ? rawPublicSlug[0]
      : rawPublicSlug;

    const bookingId = Array.isArray(rawBookingId)
      ? rawBookingId[0]
      : rawBookingId;

    if (!publicSlug || !publicSlug.trim() || !bookingId || !bookingId.trim()) {
      return res.status(400).json({
        ok: false,
        message: "Parámetros inválidos.",
      });
    }

    const profile = await companyProfileService.getByPublicSlug(publicSlug);

    if (!profile) {
      return res.status(404).json({
        ok: false,
        message: "Negocio no encontrado.",
      });
    }

    const pool = DB.getPool();

    const bookingResult = await pool.query(
      `
      SELECT
        id,
        user_id,
        status,
        payment_status,
        payment_amount,
        booking_date,
        start_time,
        client_name,
        client_email
      FROM calendar_bookings
      WHERE id = $1
        AND user_id = $2
      LIMIT 1
      `,
      [bookingId, profile.user_id]
    );

    const booking = bookingResult.rows[0];

    if (!booking) {
      return res.status(404).json({
        ok: false,
        message: "Reserva no encontrada.",
      });
    }

    if (booking.payment_status === "paid") {
      return res.status(400).json({
        ok: false,
        message: "Esta reserva ya está pagada.",
      });
    }

    const existingPaymentResult = await pool.query(
  `
  SELECT
    id,
    status,
    checkout_url,
    amount,
    provider,
    created_at
  FROM payments
  WHERE booking_id = $1
    AND user_id = $2
    AND status = 'pending'
    AND checkout_url IS NOT NULL
  ORDER BY created_at DESC
  LIMIT 1
  `,
  [booking.id, profile.user_id]
);

const existingPayment = existingPaymentResult.rows[0];

if (existingPayment?.checkout_url) {
  return res.json({
    ok: true,
    message: "Ya existe un pago pendiente para esta reserva.",
    checkoutUrl: existingPayment.checkout_url,
    booking,
    payment: existingPayment,
  });
}

    const amount = Number(booking.payment_amount || 2000);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        ok: false,
        message: "Monto inválido para el pago.",
      });
    }

    const paymentResult = await pool.query(
      `
      INSERT INTO payments (
        user_id,
        booking_id,
        amount,
        status,
        provider
      )
      VALUES ($1, $2, $3, 'pending', 'mercadopago')
      RETURNING *
      `,
      [profile.user_id, booking.id, amount]
    );

    const payment = paymentResult.rows[0];

    const connectionResult = await pool.query(
      `
      SELECT access_token
      FROM payment_provider_connections
      WHERE user_id = $1
        AND provider = 'mercadopago'
      LIMIT 1
      `,
      [profile.user_id]
    );

    const connection = connectionResult.rows[0];

    if (!connection?.access_token) {
      return res.status(400).json({
        ok: false,
        message: "Mercado Pago no está configurado para este negocio.",
      });
    }

    const mercadoPagoPreference = await createPreference({
      accessToken: connection.access_token,
      bookingId: booking.id,
      title: `Reserva ${profile.business_name}`,
      amount,
    });

    const updatedPaymentResult = await pool.query(
      `
    UPDATE payments
      SET
        checkout_url = $1,
        preference_id = $2
      WHERE id = $3
      RETURNING *
      `,
      [
  mercadoPagoPreference.checkoutUrl,
  mercadoPagoPreference.preferenceId,
  payment.id,
]
    );

    const updatedPayment = updatedPaymentResult.rows[0];

    return res.json({
      ok: true,
      message: "Pago creado correctamente.",
      checkoutUrl: mercadoPagoPreference.checkoutUrl,
      sandboxUrl: mercadoPagoPreference.sandboxUrl,
      preferenceId: mercadoPagoPreference.preferenceId,
      booking,
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Error creando pago público:", error);

    return res.status(500).json({
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo crear el pago.",
    });
  }
},


async createPublicBooking(req: Request, res: Response) {
  try {
    const rawPublicSlug = req.params.publicSlug;
    const publicSlug = Array.isArray(rawPublicSlug)
      ? rawPublicSlug[0]
      : rawPublicSlug;

    if (!publicSlug || !publicSlug.trim()) {
      return res.status(400).json({
        ok: false,
        message: "Slug público obligatorio.",
      });
    }

    const profile = await companyProfileService.getByPublicSlug(publicSlug);

    if (!profile) {
      return res.status(404).json({
        ok: false,
        message: "Negocio no encontrado.",
      });
    }

    const body = req.body || {};
    const customer = body.customer || {};
    const slot = body.slot || {};

    const userId = profile.user_id;

    const customerName = String(customer.name || "").trim();
    const customerPhone = String(customer.phone || "").trim();
    const customerEmail = String(customer.email || "").trim();
    const notes = String(customer.notes || "").trim();

    const bookingDate = String(slot.date || "").trim();
    const startTime = String(slot.time || "").trim();

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

    const publicBaseUrl = process.env.PUBLIC_BASE_URL || BASE_URL;

    const confirmationUrl =
      `${publicBaseUrl}/api/bookings/confirm/${confirmationToken}`;

    const booking = await reserveCalendarSlot({
      userId,
      leadId: customerPhone,
      customerName,
      customerPhone,
      customerEmail,
      notes,
      bookingDate,
      startTime,
      confirmationToken,
      confirmationExpiresAt,
    });
/*
 await sendBookingConfirmationEmail({
      to: customerEmail,
      customerName,
      bookingDate,
      bookingTime: startTime,
      confirmationUrl,
    });


*/
   
   
    return res.json({
  ok: true,
  status: "pending_payment",
  message: "Reserva creada. Continúa con el pago.",
  booking,
});

  } catch (error) {
    console.error("Error creando reserva pública:", error);

    return res.status(500).json({
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo crear la reserva.",
    });
  }
},

  async getPublicCalendarSlots(req: Request, res: Response) {
  try {
    const rawPublicSlug = req.params.publicSlug;
    const publicSlug = Array.isArray(rawPublicSlug)
      ? rawPublicSlug[0]
      : rawPublicSlug;

    if (!publicSlug || !publicSlug.trim()) {
      return res.status(400).json({
        ok: false,
        message: "Slug público obligatorio.",
      });
    }

    const profile = await companyProfileService.getByPublicSlug(publicSlug);

    if (!profile) {
      return res.status(404).json({
        ok: false,
        message: "Negocio no encontrado.",
      });
    }

    const data = await buildCalendarSlots(profile.user_id);

    return res.json(data);
  } catch (error) {
    console.error("Error obteniendo disponibilidad pública:", error);

    return res.status(500).json({
      ok: false,
      message: "No se pudo cargar la disponibilidad.",
    });
  }
},
  async openPublicCotizador(req: Request, res: Response) {
  return res.send(`Cotizador público funcionando: ${req.params.publicSlug}`);
},

async openPublicReservas(req: Request, res: Response) {
  try {
    const rawPublicSlug = req.params.publicSlug;
    const publicSlug = Array.isArray(rawPublicSlug)
      ? rawPublicSlug[0]
      : rawPublicSlug;

    if (!publicSlug || !publicSlug.trim()) {
      return res.status(400).send("Slug público obligatorio");
    }

    const profile = await companyProfileService.getByPublicSlug(publicSlug);

    if (!profile) {
      return res.status(404).send("Negocio no encontrado");
    }

    const html = renderBookingHtml({
      publicSlug,
      title: "Reserva tu hora",
      brand: profile.business_name,
      subtitle: "Elige el día y horario disponible para agendar tu atención.",
      successMessage: "Te enviamos un correo para confirmar tu hora.",
    });

    return res.status(200).send(html);
  } catch (error) {
    console.error("Error abriendo reservas públicas:", error);
    return res.status(500).send("Error abriendo reservas públicas");
  }
},


async openPublicPortal(req: Request, res: Response) {
  try {
    const rawPublicSlug = req.params.publicSlug;
    const publicSlug = Array.isArray(rawPublicSlug)
      ? rawPublicSlug[0]
      : rawPublicSlug;

    if (!publicSlug || !publicSlug.trim()) {
      return res.status(400).send("Slug público obligatorio");
    }

    const profile = await companyProfileService.getByPublicSlug(publicSlug);

    if (!profile) {
      return res.status(404).send("Negocio no encontrado");
    }

    const modules = await findEnabledModulesByUserId(profile.user_id);

    const modulesWithUrls = modules.map((module) => {
      if (module.code === "quote") {
        return {
          ...module,
          url: `/open/${publicSlug}/cotizador`,
        };
      }

      if (module.code === "appointments") {
        return {
          ...module,
          url: `/open/${publicSlug}/reservas`,
        };
      }

      return {
        ...module,
        url: "#",
      };
    });

    const html = renderMenuHtml({
      title: profile.business_name,
      brand: profile.business_name,
      subtitle: "Selecciona un servicio para continuar.",
      modules: modulesWithUrls,
    });

    return res.status(200).send(html);
  } catch (error) {
    console.error("Error abriendo portal público:", error);

    return res.status(500).send("Error abriendo portal público");
  }
},

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

    return res.send(
  renderBookingHtml({
    publicSlug: "",
    title: record.config.title,
    brand: record.config.brand ?? "Automatiza Fácil",
    subtitle: record.config.subtitle ?? "",
    successMessage: record.config.successMessage ?? "",
  })
);
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

  return res.send(
    renderMenuHtml({
      title: record.config.title,
      brand: record.config.brand ?? record.config.title,
      subtitle: record.config.subtitle ?? "",
      modules: record.config.modules ?? [],
    })
  );
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