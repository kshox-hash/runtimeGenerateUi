import DB from "../../db/db_configuration";

export type RevenueStats = {
  this_month: number;
  last_month: number;
  avg_ticket: number;
  count_this_month: number;
  monthly_trend: { month: string; total: number }[];
};

export type ConversionStats = {
  total: number;
  paid: number;
  rate: number;
};

export type BusiestSlot = {
  weekday: string;
  dow: number;
  count: number;
};

export type ClientStats = {
  unique_clients: number;
  returning_clients: number;
  new_clients: number;
};

export async function getRevenueStats(userId: string): Promise<RevenueStats> {
  const pool = DB.getPool();

  const [summaryRes, trendRes] = await Promise.all([
    pool.query(
      `SELECT
         COALESCE(SUM(amount) FILTER (WHERE paid_at >= DATE_TRUNC('month', NOW())), 0)            AS this_month,
         COALESCE(SUM(amount) FILTER (WHERE paid_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
                                        AND paid_at <  DATE_TRUNC('month', NOW())), 0)            AS last_month,
         COALESCE(ROUND(AVG(amount)), 0)                                                          AS avg_ticket,
         COALESCE(COUNT(*) FILTER (WHERE paid_at >= DATE_TRUNC('month', NOW())), 0)               AS count_this_month
       FROM payments
       WHERE user_id = $1 AND status = 'paid'`,
      [userId]
    ),
    pool.query(
      `SELECT
         TO_CHAR(DATE_TRUNC('month', paid_at), 'Mon YYYY') AS month,
         COALESCE(SUM(amount), 0)                          AS total
       FROM payments
       WHERE user_id = $1 AND status = 'paid'
         AND paid_at >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', paid_at)
       ORDER BY DATE_TRUNC('month', paid_at)`,
      [userId]
    ),
  ]);

  const row = summaryRes.rows[0];
  return {
    this_month:       Number(row.this_month),
    last_month:       Number(row.last_month),
    avg_ticket:       Number(row.avg_ticket),
    count_this_month: Number(row.count_this_month),
    monthly_trend:    trendRes.rows.map((r) => ({ month: r.month, total: Number(r.total) })),
  };
}

export async function getConversionStats(userId: string): Promise<ConversionStats> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT
       COUNT(*)                                                                      AS total,
       COUNT(*) FILTER (WHERE payment_status IN ('paid', 'free'))                   AS paid,
       ROUND(
         100.0 * COUNT(*) FILTER (WHERE payment_status IN ('paid', 'free'))
               / NULLIF(COUNT(*), 0), 1
       )                                                                             AS rate
     FROM calendar_bookings
     WHERE user_id = $1
       AND created_at >= DATE_TRUNC('month', NOW())`,
    [userId]
  );
  const row = result.rows[0];
  return {
    total: Number(row.total),
    paid:  Number(row.paid),
    rate:  Number(row.rate ?? 0),
  };
}

export async function getBusiestSlots(userId: string): Promise<BusiestSlot[]> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT
       TRIM(TO_CHAR(booking_date, 'Day')) AS weekday,
       EXTRACT(DOW FROM booking_date)::int AS dow,
       COUNT(*)                           AS count
     FROM calendar_bookings
     WHERE user_id = $1
       AND payment_status IN ('paid', 'free')
       AND booking_date >= NOW() - INTERVAL '3 months'
     GROUP BY EXTRACT(DOW FROM booking_date), TO_CHAR(booking_date, 'Day')
     ORDER BY count DESC`,
    [userId]
  );
  return result.rows.map((r) => ({
    weekday: r.weekday,
    dow:     Number(r.dow),
    count:   Number(r.count),
  }));
}

export async function getClientStats(userId: string): Promise<ClientStats> {
  const pool = DB.getPool();
  const result = await pool.query(
    `WITH client_counts AS (
       SELECT client_email, COUNT(*) AS bookings
       FROM calendar_bookings
       WHERE user_id = $1 AND payment_status IN ('paid', 'free') AND client_email <> ''
       GROUP BY client_email
     )
     SELECT
       COUNT(*)                              AS unique_clients,
       COUNT(*) FILTER (WHERE bookings > 1) AS returning_clients,
       COUNT(*) FILTER (WHERE bookings = 1) AS new_clients
     FROM client_counts`,
    [userId]
  );
  const row = result.rows[0];
  return {
    unique_clients:    Number(row.unique_clients),
    returning_clients: Number(row.returning_clients),
    new_clients:       Number(row.new_clients),
  };
}

// ── Reviews ────────────────────────────────────────────────────────────────────

export type ReviewsStats = {
  average: number;
  total: number;
  recent: Array<{
    rating: number;
    comment: string | null;
    client_name: string | null;
    created_at: string;
  }>;
};

export async function getReviewsStats(userId: string): Promise<ReviewsStats> {
  const pool = DB.getPool();
  const [summaryRes, recentRes] = await Promise.all([
    pool.query(
      `SELECT ROUND(AVG(rating)::numeric, 1) AS average, COUNT(*) AS total
       FROM reviews WHERE user_id = $1`,
      [userId]
    ),
    pool.query(
      `SELECT rating, comment, client_name, created_at
       FROM reviews WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 2`,
      [userId]
    ),
  ]);
  const row = summaryRes.rows[0];
  return {
    average: row.average ? Number(row.average) : 0,
    total:   Number(row.total),
    recent:  recentRes.rows.map((r) => ({
      rating:      Number(r.rating),
      comment:     r.comment,
      client_name: r.client_name,
      created_at:  String(r.created_at),
    })),
  };
}

// ── Quotes ─────────────────────────────────────────────────────────────────────

export type QuotesStats = {
  count_this_month: number;
  total_this_month: number;
  count_last_month: number;
  avg_amount: number;
};

export async function getQuotesStats(userId: string): Promise<QuotesStats> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE sent_at >= DATE_TRUNC('month', NOW()))::int                           AS count_this_month,
       COALESCE(SUM(total) FILTER (WHERE sent_at >= DATE_TRUNC('month', NOW())), 0)                AS total_this_month,
       COUNT(*) FILTER (WHERE sent_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
                          AND sent_at <  DATE_TRUNC('month', NOW()))::int                           AS count_last_month,
       COALESCE(ROUND(AVG(total)), 0)                                                              AS avg_amount
     FROM quote_history
     WHERE user_id = $1`,
    [userId]
  );
  const row = result.rows[0];
  return {
    count_this_month: Number(row.count_this_month),
    total_this_month: Number(row.total_this_month),
    count_last_month: Number(row.count_last_month),
    avg_amount:       Number(row.avg_amount),
  };
}

// ── Portal visits ──────────────────────────────────────────────────────────────

export type PortalStats = {
  visits_this_month: number;
  visits_last_month: number;
};

export async function getPortalStats(userId: string): Promise<PortalStats> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT
       COALESCE(SUM(count) FILTER (WHERE day >= DATE_TRUNC('month', NOW())), 0)                    AS visits_this_month,
       COALESCE(SUM(count) FILTER (WHERE day >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
                                     AND day <  DATE_TRUNC('month', NOW())), 0)                    AS visits_last_month
     FROM statistics_daily
     WHERE user_id = $1 AND metric = 'link_opens'`,
    [userId]
  );
  const row = result.rows[0];
  return {
    visits_this_month: Number(row.visits_this_month),
    visits_last_month: Number(row.visits_last_month),
  };
}
