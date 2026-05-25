import {
  bookingExists,
  createCalendarBooking,
  getCalendarAvailability,
  getCalendarBlockedDates,
  getCalendarBookings,
  getCalendarSettings,
} from "./appointments.repository";

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function normalizeDbDate(value: unknown): string {
  if (value instanceof Date) return toDateString(value);
  return String(value || "").slice(0, 10);
}

function normalizeDbTime(time: unknown): string {
  return String(time || "").slice(0, 5);
}

function timeToMinutes(time: unknown): number {
  const clean = normalizeDbTime(time);
  const [h, m] = clean.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function addMinutes(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

function getChileWeekday(date: Date): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
}

export async function buildCalendarSlots(userId: string) {
  const settings = await getCalendarSettings(userId);

  if (!settings) {
    return { slots: [] };
  }

  const availability = await getCalendarAvailability(userId);

  if (!availability.length) {
    return { slots: [] };
  }

  const today = new Date();
  const maxDaysAhead = Number(settings.max_advance_days || 30);

  const endDate = new Date();
  endDate.setDate(today.getDate() + maxDaysAhead);

  const from = toDateString(today);
  const to = toDateString(endDate);

  const bookings = await getCalendarBookings(userId, from, to);
  const blockedDates = await getCalendarBlockedDates(userId, from, to);

  const slots: Array<{ date: string; times: string[] }> = [];

  for (let i = 0; i <= maxDaysAhead; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);

    const dateStr = toDateString(date);
    const weekday = getChileWeekday(date);

    const dayAvailability = availability.filter(
      (item) => Number(item.weekday) === weekday && item.is_active
    );

    if (!dayAvailability.length) continue;

    const dayBookings = bookings.filter(
      (booking) => normalizeDbDate(booking.booking_date) === dateStr
    );

    const dayBlocks = blockedDates.filter(
      (block) => normalizeDbDate(block.blocked_date) === dateStr
    );

    const times: string[] = [];

    for (const available of dayAvailability) {
      let current = timeToMinutes(available.start_time);
      const closing = timeToMinutes(available.end_time);
      const duration = Number(
        available.slot_minutes || settings.default_slot_minutes || 30
      );

      while (current + duration <= closing) {
        const startTime = minutesToTime(current);
        const endTime = minutesToTime(current + duration);

        const isBooked = dayBookings.some(
          (booking) => normalizeDbTime(booking.start_time) === startTime
        );

        const isBlocked = dayBlocks.some((block) => {
          if (block.is_full_day) return true;
          if (!block.start_time || !block.end_time) return true;

          const blockStart = timeToMinutes(block.start_time);
          const blockEnd = timeToMinutes(block.end_time);

          return current < blockEnd && current + duration > blockStart;
        });

        if (!isBooked && !isBlocked) {
          times.push(startTime);
        }

        current += duration;
      }
    }

    const uniqueTimes = [...new Set(times)].sort();

    if (uniqueTimes.length > 0) {
      slots.push({
        date: dateStr,
        times: uniqueTimes,
      });
    }
  }

  return { slots };
}

export async function reserveCalendarSlot(input: {
  userId: string;
  leadId?: string;
  customerName: string;
  customerPhone: string;
  notes?: string;
  bookingDate: string;
  startTime: string;
}) {
  const settings = await getCalendarSettings(input.userId);

  if (!settings) {
    throw new Error("Calendario no configurado.");
  }

  const availability = await getCalendarAvailability(input.userId);

  if (!availability.length) {
    throw new Error("No existe disponibilidad configurada.");
  }

  const bookingDate = new Date(`${input.bookingDate}T00:00:00`);
  const weekday = getChileWeekday(bookingDate);

  const dayAvailability = availability.find(
    (item) => Number(item.weekday) === weekday && item.is_active
  );

  if (!dayAvailability) {
    throw new Error("No hay disponibilidad para este día.");
  }

  const exists = await bookingExists({
    userId: input.userId,
    bookingDate: input.bookingDate,
    startTime: input.startTime,
  });

  if (exists) {
    throw new Error("Este horario ya fue reservado.");
  }

  const duration = Number(
    dayAvailability.slot_minutes || settings.default_slot_minutes || 30
  );

  const endTime = addMinutes(input.startTime, duration);

  return createCalendarBooking({
    userId: input.userId,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    notes: input.notes,
    bookingDate: input.bookingDate,
    startTime: input.startTime,
    endTime,
  });
}