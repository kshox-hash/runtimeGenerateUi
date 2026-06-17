import DB from "../../db/db_configuration";

export type ReminderBooking = {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  booking_date: Date;
  start_time: string;
  business_name: string;
  business_phone: string | null;
};

export async function getBookingsDueTomorrow(): Promise<ReminderBooking[]> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT
       cb.id,
       cb.client_name,
       cb.client_email,
       cb.client_phone,
       cb.booking_date,
       cb.start_time,
       COALESCE(bp.business_name, '') AS business_name,
       bp.phone                       AS business_phone
     FROM calendar_bookings cb
     LEFT JOIN business_profiles bp ON bp.user_id = cb.user_id
     WHERE cb.booking_date = CURRENT_DATE + INTERVAL '1 day'
       AND cb.payment_status IN ('paid', 'free')
       AND cb.status         = 'confirmed'
       AND cb.reminder_sent  = false
       AND cb.client_email  <> ''`
  );
  return result.rows;
}

export async function markReminderSent(bookingId: string): Promise<void> {
  const pool = DB.getPool();
  await pool.query(
    `UPDATE calendar_bookings SET reminder_sent = true WHERE id = $1`,
    [bookingId]
  );
}
