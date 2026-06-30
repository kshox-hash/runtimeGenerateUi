import cron from "node-cron";
import { claimBookingsDueTomorrow } from "./reminder.repository";
import { sendBookingReminderEmail } from "../calendar/booking/services/bookingReminderEmailService";

async function runReminderJob(): Promise<void> {
  let bookings;
  try {
    bookings = await claimBookingsDueTomorrow();
  } catch (err) {
    console.error("[reminders] Error consultando reservas:", err);
    return;
  }

  if (bookings.length === 0) return;

  console.log(`[reminders] Enviando ${bookings.length} recordatorio(s)...`);

  for (const booking of bookings) {
    try {
      const bookingDateStr = new Date(booking.booking_date).toLocaleDateString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      const bookingTime = String(booking.start_time).slice(0, 5);

      await sendBookingReminderEmail(booking.client_email, {
        customerName: booking.client_name || "Cliente",
        businessName: booking.business_name || "el negocio",
        businessPhone: booking.business_phone ?? undefined,
        bookingDate: bookingDateStr,
        bookingTime,
      });

      console.log(`[reminders] Recordatorio enviado → ${booking.client_email} (booking ${booking.id})`);
    } catch (err) {
      console.error(`[reminders] Error enviando a ${booking.client_email}:`, err);
    }
  }
}

export function startReminderCron(): void {
  // Corre cada hora en punto
  cron.schedule("0 * * * *", () => {
    runReminderJob().catch((err) =>
      console.error("[reminders] Error inesperado en cron:", err)
    );
  });

  console.log("[reminders] Cron de recordatorios iniciado (cada hora)");
}
