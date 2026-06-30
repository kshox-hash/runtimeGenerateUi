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

export async function confirmPaymentAndBooking(
  bookingId: string,
  providerPaymentId: string,
  transactionAmount: number
): Promise<
  | { payment: { id: string; amount: number }; booking: ConfirmedBooking | null }
  | null
  | "amount_mismatch"
> {
  const pool = DB.getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const pendingResult = await client.query(
      `SELECT id, amount FROM payments
       WHERE booking_id = $1 AND provider = 'mercadopago' AND status <> 'paid'
       FOR UPDATE
       LIMIT 1`,
      [bookingId]
    );

    if ((pendingResult.rowCount ?? 0) === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const expectedAmount = Math.round(Number(pendingResult.rows[0].amount));
    if (expectedAmount !== Math.round(transactionAmount)) {
      await client.query("ROLLBACK");
      return "amount_mismatch";
    }

    const paymentResult = await client.query(
      `UPDATE payments
       SET status = 'paid', provider_payment_id = $1, paid_at = NOW()
       WHERE id = $2
       RETURNING id, amount`,
      [providerPaymentId, pendingResult.rows[0].id]
    );

    const bookingResult = await client.query(
      `UPDATE calendar_bookings
       SET payment_status = 'paid', paid_at = NOW(), status = 'confirmed'
       WHERE id = $1
       RETURNING id, user_id, client_name, client_email, client_phone, booking_date, start_time, service_name`,
      [bookingId]
    );

    await client.query("COMMIT");

    return {
      payment: paymentResult.rows[0],
      booking: bookingResult.rows[0] ?? null,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getBusinessNameByUserId(userId: string): Promise<string | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT business_name FROM business_profiles WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0]?.business_name ?? null;
}

export async function getBusinessEmailByUserId(userId: string): Promise<string | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT email FROM users WHERE id = $1 LIMIT 1`,
    [userId]
  );
  return result.rows[0]?.email ?? null;
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
