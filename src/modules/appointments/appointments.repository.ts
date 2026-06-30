import DB from "../../db/db_configuration";

const pool = DB.getPool();

export type CalendarSettingsRow = {
  id: string;
  user_id: string;
  timezone: string;
  default_slot_minutes: number;
  min_advance_hours: number;
  max_advance_days: number;
  auto_confirm_booking: boolean;
  is_active: boolean;
  booking_price?: number | null;
};

export type CalendarAvailabilityRow = {
  id: string;
  user_id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  slot_minutes: number;
  is_active: boolean;
};

export type CalendarBlockedDateRow = {
  id: string;
  user_id: string;
  blocked_date: string;
  start_time: string | null;
  end_time: string | null;
  is_full_day: boolean;
  reason: string | null;
};

export type CalendarBookingRow = {
  id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  status: string;
  payment_status?: string | null;
  payment_amount?: number | null;
  notes: string | null;
  expires_at?: Date | null;
  confirmation_token?: string | null;
  confirmation_expires_at?: Date | null;
  confirmation_email_sent_at?: Date | null;
  email_confirmed_at?: Date | null;
};

export async function getCalendarSettings(userId: string) {
  const result = await pool.query<CalendarSettingsRow>(
    `
    SELECT *
    FROM calendar_settings
    WHERE user_id = $1
      AND is_active = true
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

export async function getCalendarAvailability(userId: string, providerId?: string | null) {
  if (providerId) {
    // Try provider-specific rows first; fall back to global rows if none exist
    const specific = await pool.query<CalendarAvailabilityRow>(
      `SELECT * FROM calendar_availability
       WHERE user_id = $1 AND provider_id = $2 AND is_active = true
       ORDER BY weekday ASC, start_time ASC`,
      [userId, providerId]
    );
    if (specific.rows.length > 0) return specific.rows;
  }

  const result = await pool.query<CalendarAvailabilityRow>(
    `SELECT * FROM calendar_availability
     WHERE user_id = $1 AND (provider_id IS NULL) AND is_active = true
     ORDER BY weekday ASC, start_time ASC`,
    [userId]
  );
  return result.rows;
}

export async function getCalendarBlockedDates(
  userId: string,
  from: string,
  to: string
) {
  const result = await pool.query<CalendarBlockedDateRow>(
    `
    SELECT *
    FROM calendar_blocked_dates
    WHERE user_id = $1
      AND blocked_date BETWEEN $2 AND $3
    ORDER BY blocked_date ASC, start_time ASC
    `,
    [userId, from, to]
  );

  return result.rows;
}

export async function getCalendarBookings(
  userId: string,
  from: string,
  to: string,
  providerId?: string | null
) {
  const providerClause = providerId
    ? `AND provider_id = $4`
    : ``;
  const params: unknown[] = providerId ? [userId, from, to, providerId] : [userId, from, to];

  const result = await pool.query<CalendarBookingRow>(
    `
    SELECT *
    FROM calendar_bookings
    WHERE user_id = $1
      AND booking_date BETWEEN $2 AND $3
      ${providerClause}
      AND (
        status = 'confirmed'
        OR (
          status = 'pending_payment'
          AND expires_at > NOW()
        )
      )
    ORDER BY booking_date ASC, start_time ASC
    `,
    params
  );

  return result.rows;
}

export async function createCalendarBooking(input: {
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  confirmationToken: string;
  confirmationExpiresAt: Date;
  providerId?: string | null;
  paymentAmount?: number | null;
  serviceId?: string | null;
  serviceName?: string | null;
  serviceColor?: string | null;
}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `DELETE FROM calendar_bookings
       WHERE user_id = $1 AND booking_date = $2 AND start_time = $3
         AND status = 'pending_payment' AND expires_at <= NOW()`,
      [input.userId, input.bookingDate, input.startTime]
    );

    const result = await client.query<CalendarBookingRow>(
      `
      INSERT INTO calendar_bookings (
        user_id, booking_date, start_time, end_time,
        client_name, client_email, client_phone,
        status, payment_status, payment_amount, notes,
        confirmation_token, confirmation_expires_at, confirmation_email_sent_at,
        expires_at, provider_id, service_id, service_name, service_color,
        created_at, updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        'pending_payment', 'unpaid', $8, $9, $10, $11, NOW(),
        NOW() + INTERVAL '45 minutes',
        $12, $13, $14, $15,
        NOW(), NOW()
      )
      RETURNING *
      `,
      [
        input.userId, input.bookingDate, input.startTime, input.endTime,
        input.customerName, input.customerEmail, input.customerPhone,
        input.paymentAmount ?? null, input.notes || null,
        input.confirmationToken, input.confirmationExpiresAt,
        input.providerId || null, input.serviceId || null,
        input.serviceName || null, input.serviceColor || null,
      ]
    );

    await client.query("COMMIT");
    return result.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    if ((err as { code?: string }).code === "23505") {
      throw new Error("Este horario ya fue reservado.");
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function bookingExists(input: {
  userId: string;
  bookingDate: string;
  startTime: string;
  providerId?: string | null;
}) {
  const providerClause = input.providerId
    ? `AND provider_id = $4`
    : ``;
  const params: unknown[] = input.providerId
    ? [input.userId, input.bookingDate, input.startTime, input.providerId]
    : [input.userId, input.bookingDate, input.startTime];

  const result = await pool.query(
    `
    SELECT id
    FROM calendar_bookings
    WHERE user_id = $1
      AND booking_date = $2
      AND start_time = $3
      ${providerClause}
      AND (
        status = 'confirmed'
        OR (
          status = 'pending_payment'
          AND expires_at > NOW()
        )
      )
    LIMIT 1
    `,
    params
  );

  return (result.rowCount ?? 0) > 0;
}

export async function confirmCalendarBookingByToken(token: string) {
  const result = await pool.query<CalendarBookingRow>(
    `
    UPDATE calendar_bookings
    SET
      status = 'confirmed',
      email_confirmed_at = NOW(),
      updated_at = NOW()
    WHERE confirmation_token = $1
      AND status = 'pending_email_confirmation'
      AND confirmation_expires_at > NOW()
    RETURNING *
    `,
    [token]
  );

  return result.rows[0] || null;
}

export async function findCalendarBookingByConfirmationToken(token: string) {
  const result = await pool.query<CalendarBookingRow>(
    `
    SELECT *
    FROM calendar_bookings
    WHERE confirmation_token = $1
    LIMIT 1
    `,
    [token]
  );

  return result.rows[0] || null;
}