import DB from "../../db/db_configuration";

export type ConfirmedBooking = {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  booking_date: Date;
  start_time: string;
  service_name: string | null;
};

export async function markPaymentAsPaid(
  bookingId: string,
  providerPaymentId: string
): Promise<{ id: string; amount: number } | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `UPDATE payments
     SET status = 'paid', provider_payment_id = $1, paid_at = NOW()
     WHERE booking_id = $2
       AND provider = 'mercadopago'
       AND status <> 'paid'
     RETURNING id, amount`,
    [providerPaymentId, bookingId]
  );
  return result.rows[0] ?? null;
}

export async function confirmBooking(
  bookingId: string
): Promise<ConfirmedBooking | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `UPDATE calendar_bookings
     SET payment_status = 'paid', paid_at = NOW(), status = 'confirmed'
     WHERE id = $1
     RETURNING id, user_id, client_name, client_email, client_phone, booking_date, start_time, service_name`,
    [bookingId]
  );
  return result.rows[0] ?? null;
}

export async function getBusinessNameByUserId(userId: string): Promise<string | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT business_name FROM business_profiles WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0]?.business_name ?? null;
}

export async function getAccessTokenByMpUserId(mpUserId: string): Promise<string | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT access_token FROM payment_provider_connections
     WHERE mp_user_id = $1 AND provider = 'mercadopago'
     LIMIT 1`,
    [mpUserId]
  );
  return result.rows[0]?.access_token ?? null;
}
