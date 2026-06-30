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
       AND status = 'pending'
     ORDER BY created_at DESC
     LIMIT 1`,
    [bookingId, userId]
  );
  return result.rows[0] ?? null;
}

export async function deletePaymentRecord(paymentId: string): Promise<void> {
  const pool = DB.getPool();
  await pool.query(`DELETE FROM payments WHERE id = $1`, [paymentId]);
}

export async function getMpAccessToken(userId: string): Promise<string | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT access_token, refresh_token, mp_user_id, public_key, expires_at
     FROM payment_provider_connections
     WHERE user_id = $1 AND provider = 'mercadopago'
     LIMIT 1`,
    [userId]
  );
  const conn = result.rows[0];
  if (!conn) return null;

  const expiresAt: Date | null = conn.expires_at ? new Date(conn.expires_at) : null;
  const expiringSoon = expiresAt ? expiresAt.getTime() - Date.now() < 10 * 60 * 1000 : false;

  if (!expiringSoon || !conn.refresh_token) {
    return conn.access_token ?? null;
  }

  try {
    const { refreshMpToken } = await import("../mp-connect/mp-connect.service");
    const { saveMpConnection } = await import("../mp-connect/mp-connect.repository");
    const tokens = await refreshMpToken(conn.refresh_token);
    await saveMpConnection({
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? conn.refresh_token,
      mpUserId: conn.mp_user_id ?? null,
      publicKey: tokens.public_key ?? conn.public_key ?? null,
      expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
    });
    return tokens.access_token;
  } catch (err) {
    console.error(`[mp-connect] No se pudo refrescar el token de user ${userId}, usando el actual:`, err);
    return conn.access_token ?? null;
  }
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

export async function getBusinessNameByUserId(userId: string): Promise<string> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT business_name FROM business_profiles WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0]?.business_name ?? "Negocio";
}

export async function cancelPendingBookingByToken(token: string): Promise<{ cancelled: boolean; alreadyPaid: boolean }> {
  const pool = DB.getPool();
  const check = await pool.query(
    `SELECT status, expires_at FROM calendar_bookings WHERE confirmation_token = $1 LIMIT 1`,
    [token]
  );
  const row = check.rows[0];
  if (!row) return { cancelled: false, alreadyPaid: false };
  if (row.status === "confirmed") return { cancelled: false, alreadyPaid: true };
  const result = await pool.query(
    `DELETE FROM calendar_bookings
     WHERE confirmation_token = $1 AND status = 'pending_payment' AND expires_at > NOW()`,
    [token]
  );
  return { cancelled: (result.rowCount ?? 0) > 0, alreadyPaid: false };
}

export async function cancelPendingBookingById(bookingId: string, userId: string): Promise<{ cancelled: boolean; alreadyPaid: boolean }> {
  const pool = DB.getPool();
  const check = await pool.query(
    `SELECT status FROM calendar_bookings WHERE id = $1 AND user_id = $2 LIMIT 1`,
    [bookingId, userId]
  );
  const row = check.rows[0];
  if (!row) return { cancelled: false, alreadyPaid: false };
  if (row.status === "confirmed") return { cancelled: false, alreadyPaid: true };
  const result = await pool.query(
    `DELETE FROM calendar_bookings
     WHERE id = $1 AND user_id = $2 AND status = 'pending_payment' AND expires_at > NOW()`,
    [bookingId, userId]
  );
  return { cancelled: (result.rowCount ?? 0) > 0, alreadyPaid: false };
}

export async function hasPendingPaymentForCustomer(
  userId: string,
  customerEmail: string
): Promise<boolean> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT id FROM calendar_bookings
     WHERE user_id = $1 AND client_email = $2
       AND status = 'pending_payment' AND expires_at > NOW()
     LIMIT 1`,
    [userId, customerEmail]
  );
  return (result.rowCount ?? 0) > 0;
}

