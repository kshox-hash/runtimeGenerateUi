import { Request, Response } from "express";

import { StatisticsService } from "../stadistics/stadistics.service";
import { buildCalendarSlots, buildCalendarSlotsAuto, reserveCalendarSlot } from "../appointments/appointments.service";

const statsService = new StatisticsService();
import { renderBookingHtml } from "../appointments/appointments.screen";
import { getSlugByValueService } from "../slug/slug.service";
import { getActiveProvidersByUserId } from "../appointments/calendar-providers.repository";
import { createPreference } from "../payments/mercado.service";
import {
  createBookingConfirmationExpiresAt,
  createBookingConfirmationToken,
} from "./booking/services/bookingTokenService";
import {
  getBookingForPayment,
  getPendingPayment,
  getMpAccessToken,
  createPaymentRecord,
  updatePaymentWithPreference,
  deletePaymentRecord,
  getPlatformFeePct,
  getBusinessNameByUserId,
  hasPendingPaymentForCustomer,
  cancelPendingBookingById,
  cancelPendingBookingByToken,
} from "./calendar-public.repository";

const MIN_PAYMENT_AMOUNT = 3000;
import { getServiceById } from "../appointments/calendar-services.repository";
import { sendBookingPaymentLinkEmail } from "./booking/services/bookingPaymentLinkEmailService";
import { withRetry } from "../../core/retry";

export const calendarPublicController = {

  async getProviders(req: Request, res: Response): Promise<Response | void> {
    try {
      const publicSlug = String(req.params["publicSlug"] || "").trim();
      if (!publicSlug) return res.status(400).json({ ok: false, message: "Slug obligatorio." });

      const profile = await getSlugByValueService(publicSlug);
      if (!profile) return res.status(404).json({ ok: false, message: "Negocio no encontrado." });

      const providers = await getActiveProvidersByUserId(profile.user_id);
      return res.json({ ok: true, providers });
    } catch (error) {
      console.error("[calendar] Error obteniendo proveedores:", error);
      return res.status(500).json({ ok: false, message: "No se pudo cargar el equipo." });
    }
  },

  async getSlots(req: Request, res: Response): Promise<Response | void> {
    try {
      const publicSlug = String(req.params["publicSlug"] || "").trim();

      if (!publicSlug) {
        return res.status(400).json({ ok: false, message: "Slug público obligatorio." });
      }

      const profile = await getSlugByValueService(publicSlug);

      if (!profile) {
        return res.status(404).json({ ok: false, message: "Negocio no encontrado." });
      }

      const providerId = String(req.query["providerId"] || "").trim() || null;
      const data = providerId
        ? await buildCalendarSlots(profile.user_id, providerId)
        : await buildCalendarSlotsAuto(profile.user_id);

      return res.json(data);
    } catch (error) {
      console.error("[calendar] Error obteniendo slots:", error);
      return res.status(500).json({ ok: false, message: "No se pudo cargar la disponibilidad." });
    }
  },

  async openReservas(req: Request, res: Response): Promise<Response | void> {
    try {
      const publicSlug = String(req.params["publicSlug"] || "").trim();

      if (!publicSlug) {
        return res.status(400).send("Slug público obligatorio");
      }

      const profile = await getSlugByValueService(publicSlug);

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
      console.error("[calendar] Error abriendo reservas:", error);
      return res.status(500).send("Error abriendo reservas");
    }
  },

  async createBooking(req: Request, res: Response): Promise<Response | void> {
    try {
      const publicSlug = String(req.params["publicSlug"] || "").trim();

      if (!publicSlug) {
        return res.status(400).json({ ok: false, message: "Slug público obligatorio." });
      }

      const profile = await getSlugByValueService(publicSlug);

      if (!profile) {
        return res.status(404).json({ ok: false, message: "Negocio no encontrado." });
      }

      const body = req.body || {};
      const customer = body.customer || {};
      const slot = body.slot || {};

      const customerName  = String(customer.name  || "").trim();
      const customerPhone = String(customer.phone || "").trim();
      const customerEmail = String(customer.email || "").trim();
      const notes         = String(customer.notes || "").trim();
      const bookingDate   = String(slot.date || "").trim();
      const startTime     = String(slot.time || "").trim();
      const providerId    = String(body.providerId || "").trim() || null;

      if (!customerName || !customerPhone || !customerEmail || !bookingDate || !startTime) {
        return res.status(400).json({ ok: false, message: "Faltan datos para reservar." });
      }

      const serviceId = String(body.serviceId || "").trim() || null;

      // Resolver datos del servicio
      let servicePrice: number | null = null;
      let serviceName: string | null = null;
      let serviceColor: string | null = null;
      if (serviceId) {
        const svc = await getServiceById(serviceId, profile.user_id);
        if (svc) {
          servicePrice = svc.price;
          serviceName  = svc.name;
          serviceColor = svc.color;
        }
      }

      // Validar monto mínimo antes de crear la reserva
      const paymentAmount = Number(servicePrice ?? 0);
      if (paymentAmount < MIN_PAYMENT_AMOUNT) {
        return res.status(400).json({
          ok: false,
          message: `El monto mínimo para reservar es $${MIN_PAYMENT_AMOUNT.toLocaleString("es-CL")}. Contacta al negocio para más información.`,
        });
      }

      // Verificar que MP esté configurado antes de crear la reserva
      const accessToken = await getMpAccessToken(profile.user_id);
      if (!accessToken) {
        return res.status(400).json({
          ok: false,
          message: "El negocio no tiene MercadoPago configurado. No se pueden aceptar reservas en este momento.",
        });
      }

      // Bloquear si el cliente ya tiene una reserva pendiente de pago
      const alreadyPending = await hasPendingPaymentForCustomer(profile.user_id, customerEmail);
      if (alreadyPending) {
        return res.status(400).json({
          ok: false,
          message: "Ya tienes una reserva pendiente de pago. Completa el pago para poder reservar nuevamente.",
        });
      }

      const confirmationToken     = createBookingConfirmationToken();
      const confirmationExpiresAt = createBookingConfirmationExpiresAt();

      let booking;
      try {
        booking = await reserveCalendarSlot({
          userId: profile.user_id,
          customerName,
          customerPhone,
          customerEmail,
          notes,
          bookingDate,
          startTime,
          confirmationToken,
          confirmationExpiresAt,
          providerId,
          serviceId,
          serviceName,
          serviceColor,
          servicePrice,
        });
      } catch (err) {
        return res.status(409).json({
          ok: false,
          message: err instanceof Error ? err.message : "No se pudo reservar el horario seleccionado.",
        });
      }

      // Crear preferencia de pago en MercadoPago — si falla, liberar la reserva
      // recién creada para no dejar el horario bloqueado con un pago huérfano.
      let checkoutUrl: string;
      try {
        const businessName = await getBusinessNameByUserId(profile.user_id);
        const bookingDateLabel = new Date(bookingDate).toLocaleDateString("es-CL", {
          weekday: "long", day: "numeric", month: "long",
        });
        const feePct = await getPlatformFeePct(profile.user_id);
        const marketplaceFee = Math.round(paymentAmount * feePct / 100);
        const payment = await createPaymentRecord(profile.user_id, booking.id, paymentAmount);
        const bookingDateStr = new Date(bookingDate).toLocaleDateString("es-CL");
        const preference = await createPreference({
          accessToken,
          bookingId: booking.id,
          title: `Reserva ${businessName}`,
          description: `${bookingDateStr} a las ${startTime} - ${customerName}`,
          amount: paymentAmount,
          customerEmail,
          customerName,
          businessName,
          marketplaceFee,
        });
        await updatePaymentWithPreference(payment.id, preference.checkoutUrl!, preference.preferenceId ?? "");
        checkoutUrl = preference.checkoutUrl!;

        const cancelUrl = `${process.env.PUBLIC_BASE_URL}/api/bookings/cancel/${booking.confirmation_token}`;
        withRetry(() => sendBookingPaymentLinkEmail({
          to: customerEmail,
          customerName,
          businessName,
          bookingDate: bookingDateLabel,
          bookingTime: startTime,
          checkoutUrl,
          cancelUrl,
        })).catch((err) => console.error("[calendar] Error email de pago tras reintentos:", err));
      } catch (err) {
        console.error("[calendar] Error creando preferencia de pago, liberando reserva:", err);
        await cancelPendingBookingById(booking.id, profile.user_id).catch(() => {});
        return res.status(500).json({
          ok: false,
          message: "No se pudo iniciar el pago. Intenta reservar nuevamente.",
        });
      }

      statsService.increment(profile.user_id, "booking_created").catch(() => {});

      return res.json({
        ok: true,
        booking,
        checkoutUrl,
      });
    } catch (error) {
      console.error("[calendar] Error creando reserva:", error);
      return res.status(500).json({
        ok: false,
        message: "No se pudo crear la reserva.",
      });
    }
  },

  async createPayment(req: Request, res: Response): Promise<Response | void> {
    try {
      const publicSlug = String(req.params["publicSlug"] || "").trim();
      const bookingId  = String(req.params["bookingId"]  || "").trim();

      if (!publicSlug || !bookingId) {
        return res.status(400).json({ ok: false, message: "Parámetros inválidos." });
      }

      const profile = await getSlugByValueService(publicSlug);

      if (!profile) {
        return res.status(404).json({ ok: false, message: "Negocio no encontrado." });
      }

      const booking = await getBookingForPayment(bookingId, profile.user_id);

      if (!booking) {
        return res.status(404).json({ ok: false, message: "Reserva no encontrada." });
      }

      if (booking.payment_status === "paid") {
        return res.status(400).json({ ok: false, message: "Esta reserva ya está pagada." });
      }

      const existingPayment = await getPendingPayment(bookingId, profile.user_id);

      if (existingPayment?.checkout_url) {
        return res.json({
          ok: true,
          message: "Ya existe un pago pendiente para esta reserva.",
          checkoutUrl: existingPayment.checkout_url,
          preferenceId: existingPayment.preference_id,
          booking,
          payment: existingPayment,
        });
      }

      const amount = Number(booking.payment_amount ?? 0);

      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({ ok: false, message: "Monto inválido para el pago." });
      }

      const accessToken = await getMpAccessToken(profile.user_id);

      if (!accessToken) {
        return res.status(400).json({
          ok: false,
          message: "Mercado Pago no está configurado para este negocio.",
        });
      }

      const businessName = await getBusinessNameByUserId(profile.user_id);
      const feePct = await getPlatformFeePct(profile.user_id);
      const marketplaceFee = Math.round(amount * feePct / 100);

      // Si hay un registro de pago pendiente sin checkout_url (huérfano de un
      // intento previo fallido), lo reutilizamos en vez de crear uno nuevo.
      const payment = existingPayment ?? await createPaymentRecord(profile.user_id, bookingId, amount);

      const bookingDateStr = new Date(booking.booking_date).toLocaleDateString("es-CL");

      let preference;
      try {
        preference = await createPreference({
          accessToken,
          bookingId,
          title: `Reserva ${businessName}`,
          description: `Hora agendada el ${bookingDateStr} a las ${booking.start_time.slice(0, 5)} - ${booking.client_name}`,
          amount,
          customerEmail: booking.client_email,
          customerName: booking.client_name,
          businessName,
          marketplaceFee,
        });
      } catch (err) {
        console.error("[calendar] Error creando preferencia de pago:", err);
        if (!existingPayment) await deletePaymentRecord(payment.id).catch(() => {});
        return res.status(500).json({ ok: false, message: "No se pudo crear el pago. Intenta nuevamente." });
      }

      const updatedPayment = await updatePaymentWithPreference(
        payment.id,
        preference.checkoutUrl!,
        preference.preferenceId!
      );

      return res.json({
        ok: true,
        message: "Pago creado correctamente.",
        checkoutUrl: preference.checkoutUrl,
        sandboxUrl: preference.sandboxUrl,
        preferenceId: preference.preferenceId,
        booking,
        payment: updatedPayment,
      });
    } catch (error) {
      console.error("[calendar] Error creando pago:", error);
      return res.status(500).json({
        ok: false,
        message: "No se pudo crear el pago.",
      });
    }
  },

  async cancelBooking(req: Request, res: Response): Promise<Response | void> {
    try {
      const publicSlug = String(req.params["publicSlug"] || "").trim();
      const bookingId  = String(req.params["bookingId"]  || "").trim();
      if (!publicSlug || !bookingId) return res.status(400).json({ ok: false, message: "Parámetros inválidos." });
      const profile = await getSlugByValueService(publicSlug);
      if (!profile) return res.status(404).json({ ok: false, message: "Negocio no encontrado." });
      const { cancelled, alreadyPaid } = await cancelPendingBookingById(bookingId, profile.user_id);
      if (alreadyPaid) return res.status(400).json({ ok: false, message: "Esta reserva ya está confirmada y no puede cancelarse." });
      if (!cancelled)  return res.status(400).json({ ok: false, message: "Esta reserva ya expiró o no existe." });
      return res.json({ ok: true, message: "Reserva cancelada correctamente." });
    } catch (error) {
      console.error("[calendar] Error cancelando reserva:", error);
      return res.status(500).json({ ok: false, message: "No se pudo cancelar la reserva." });
    }
  },

  async cancelBookingByToken(req: Request, res: Response): Promise<Response | void> {
    try {
      const token = String(req.params["token"] || "").trim();
      if (!token) return res.status(400).send("<p>Token inválido.</p>");
      const { cancelled, alreadyPaid } = await cancelPendingBookingByToken(token);
      if (alreadyPaid) {
        return res.send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Reserva pagada</title></head>
          <body style="font-family:Arial,sans-serif;max-width:480px;margin:60px auto;padding:24px;text-align:center">
            <h2 style="color:#0a1628">Esta reserva ya está confirmada</h2>
            <p style="color:#4a6580">El pago fue procesado correctamente. No es posible cancelarla.</p>
          </body></html>`);
      }
      if (!cancelled) {
        return res.send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Reserva expirada</title></head>
          <body style="font-family:Arial,sans-serif;max-width:480px;margin:60px auto;padding:24px;text-align:center">
            <h2 style="color:#0a1628">Reserva ya expirada</h2>
            <p style="color:#4a6580">El tiempo de pago venció y el horario quedó liberado automáticamente.</p>
          </body></html>`);
      }
      return res.send(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Reserva cancelada</title></head>
        <body style="font-family:Arial,sans-serif;max-width:480px;margin:60px auto;padding:24px;text-align:center">
          <h2 style="color:#0a1628">Reserva cancelada</h2>
          <p style="color:#4a6580">Tu reserva fue cancelada correctamente. El horario quedó disponible nuevamente.</p>
        </body></html>`);
    } catch (error) {
      console.error("[calendar] Error cancelando reserva por token:", error);
      return res.status(500).send("<p>Ocurrió un error al cancelar la reserva.</p>");
    }
  },
};
