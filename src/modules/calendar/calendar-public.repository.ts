import DB from "../../db/db_configuration";

export type BookingRow = {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  payment_amount: number;
  booking_date: Date;
  start_time: string;
  client_name: string;
  client_email: string;
};

export type PaymentRow = {
  id: string;
  status: string;
  checkout_url: string;
  preference_id: string;
  amount: number;
  provider: string;
  created_at: Date;
};

export async function getBookingForPayment(
  bookingId: string,
  userId: string
): Promise<BookingRow | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT id, user_id, status, payment_status, payment_amount,
            booking_date, start_time, client_name, client_email
     FROM calendar_bookings
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [bookingId, userId]
  );
  return result.rows[0] ?? null;
}

export async function getPendingPayment(
  bookingId: string,
  userId: string
): Promise<PaymentRow | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT id, status, checkout_url, preference_id, amount, provider, created_at
     FROM payments
     WHERE booking_id = $1 AND user_id = $2
       AND status = 'pending' AND checkout_url IS NOT NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [bookingId, userId]
  );
  return result.rows[0] ?? null;
}

export async function getMpAccessToken(userId: string): Promise<string | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT access_token FROM payment_provider_connections
     WHERE user_id = $1 AND provider = 'mercadopago'
     LIMIT 1`,
    [userId]
  );
  return result.rows[0]?.access_token ?? null;
}

export async function createPaymentRecord(
  userId: string,
  bookingId: string,
  amount: number
): Promise<PaymentRow> {
  const pool = DB.getPool();
  const result = await pool.query(
    `INSERT INTO payments (user_id, booking_id, amount, status, provider)
     VALUES ($1, $2, $3, 'pending', 'mercadopago')
     RETURNING *`,
    [userId, bookingId, amount]
  );
  return result.rows[0];
}

export async function getPlatformFeePct(userId: string): Promise<number> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT platform_fee_pct FROM business_profiles WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return Number(result.rows[0]?.platform_fee_pct ?? 2.5);
}

export async function updatePaymentWithPreference(
  paymentId: string,
  checkoutUrl: string,
  preferenceId: string
): Promise<PaymentRow> {
  const pool = DB.getPool();
  const result = await pool.query(
    `UPDATE payments SET checkout_url = $1, preference_id = $2
     WHERE id = $3 RETURNING *`,
    [checkoutUrl, preferenceId, paymentId]
  );
  return result.rows[0];
}

export async function confirmFreeBooking(bookingId: string): Promise<void> {
  const pool = DB.getPool();
  await pool.query(
    `UPDATE calendar_bookings
     SET status = 'confirmed', payment_status = 'free', email_confirmed_at = NOW()
     WHERE id = $1 AND payment_status = 'unpaid'`,
    [bookingId]
  );
}
