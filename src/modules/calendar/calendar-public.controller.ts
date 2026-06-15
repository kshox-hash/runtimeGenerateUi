import { Request, Response } from "express";

import { buildCalendarSlots, reserveCalendarSlot } from "../appointments/appointments.service";
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
  getPlatformFeePct,
} from "./calendar-public.repository";
import { sendBookingPaymentLinkEmail } from "./booking/services/bookingPaymentLinkEmailService";

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
      const data = await buildCalendarSlots(profile.user_id, providerId);

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

      const confirmationToken     = createBookingConfirmationToken();
      const confirmationExpiresAt = createBookingConfirmationExpiresAt();

      const booking = await reserveCalendarSlot({
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
      });

      // Crear preferencia de pago inmediatamente y mandar email con link
      let checkoutUrl: string | null = null;
      try {
        const accessToken = await getMpAccessToken(profile.user_id);
        if (accessToken) {
          const amount = Number((booking as Record<string,unknown>)["payment_amount"] ?? 3000);
          const feePct = await getPlatformFeePct(profile.user_id);
          const marketplaceFee = Math.round(amount * feePct / 100);
          const payment = await createPaymentRecord(profile.user_id, booking.id, amount);
          const bookingDateStr = new Date(bookingDate).toLocaleDateString("es-CL");
          const preference = await createPreference({
            accessToken,
            bookingId: booking.id,
            title: `Reserva ${profile.business_name}`,
            description: `${bookingDateStr} a las ${startTime} - ${customerName}`,
            amount,
            customerEmail,
            customerName,
            businessName: profile.business_name,
            marketplaceFee,
          });
          if (preference.checkoutUrl) {
            await updatePaymentWithPreference(payment.id, preference.checkoutUrl, preference.preferenceId ?? "");
            checkoutUrl = preference.checkoutUrl;
            const bookingDateStr2 = new Date(bookingDate).toLocaleDateString("es-CL", {
              weekday: "long", day: "numeric", month: "long",
            });
            sendBookingPaymentLinkEmail({
              to: customerEmail,
              customerName,
              businessName: profile.business_name,
              bookingDate: bookingDateStr2,
              bookingTime: startTime,
              checkoutUrl,
            }).catch((err) => console.error("[calendar] Error enviando email de pago:", err));
          }
        }
      } catch (err) {
        console.error("[calendar] Error creando preferencia de pago:", err);
      }

      return res.json({
        ok: true,
        booking,
        checkoutUrl,
      });
    } catch (error) {
      console.error("[calendar] Error creando reserva:", error);
      return res.status(500).json({
        ok: false,
        message: error instanceof Error ? error.message : "No se pudo crear la reserva.",
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

      const amount = Number(booking.payment_amount || 3000);

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

      const feePct = await getPlatformFeePct(profile.user_id);
      const marketplaceFee = Math.round(amount * feePct / 100);

      const payment = await createPaymentRecord(profile.user_id, bookingId, amount);

      const bookingDateStr = new Date(booking.booking_date).toLocaleDateString("es-CL");

      const preference = await createPreference({
        accessToken,
        bookingId,
        title: `Reserva ${profile.business_name}`,
        description: `Hora agendada el ${bookingDateStr} a las ${booking.start_time.slice(0, 5)} - ${booking.client_name}`,
        amount,
        customerEmail: booking.client_email,
        customerName: booking.client_name,
        businessName: profile.business_name,
        marketplaceFee,
      });

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
        message: error instanceof Error ? error.message : "No se pudo crear el pago.",
      });
    }
  },
};
