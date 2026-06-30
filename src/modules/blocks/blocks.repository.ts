import DB from "../../db/db_configuration";

export type CalendarBlock = {
  id: string;
  user_id: string;
  start_at: string;
  end_at: string;
  reason: string | null;
  created_at: string;
};

function parseTimestamp(ts: string): { date: string; time: string } {
  const normalized = ts.replace("T", " ");
  const [date, timePart = "00:00"] = normalized.split(" ");
  return { date, time: timePart.slice(0, 5) };
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

function toTime(value: unknown): string {
  return String(value ?? "").slice(0, 5);
}

function toCreatedAt(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value ?? "");
}

export async function getBlocks(userId: string): Promise<CalendarBlock[]> {
  const pool = DB.getPool();
  const today = new Date().toISOString().slice(0, 10);
  const result = await pool.query(
    `SELECT id, user_id, blocked_date, start_time, end_time, reason, created_at
     FROM calendar_blocked_dates
     WHERE user_id = $1 AND blocked_date >= $2 AND is_full_day = false
     ORDER BY blocked_date ASC, start_time ASC`,
    [userId, today]
  );
  return result.rows.map((row) => {
    const date = toIsoDate(row.blocked_date);
    return {
      id: row.id,
      user_id: row.user_id,
      start_at: `${date}T${toTime(row.start_time)}:00`,
      end_at: `${date}T${toTime(row.end_time)}:00`,
      reason: row.reason ?? null,
      created_at: toCreatedAt(row.created_at),
    };
  });
}

export async function createBlock(
  userId: string,
  startAt: string,
  endAt: string,
  reason: string | null
): Promise<CalendarBlock> {
  const pool = DB.getPool();
  const { date, time: startTime } = parseTimestamp(startAt);
  const { time: endTime } = parseTimestamp(endAt);

  const result = await pool.query(
    `INSERT INTO calendar_blocked_dates (user_id, blocked_date, start_time, end_time, is_full_day, reason)
     VALUES ($1, $2, $3, $4, false, $5)
     RETURNING id, user_id, blocked_date, start_time, end_time, reason, created_at`,
    [userId, date, startTime, endTime, reason ?? null]
  );
  const row = result.rows[0];
  const dateStr = toIsoDate(row.blocked_date);
  return {
    id: row.id,
    user_id: row.user_id,
    start_at: `${dateStr}T${toTime(row.start_time)}:00`,
    end_at: `${dateStr}T${toTime(row.end_time)}:00`,
    reason: row.reason ?? null,
    created_at: toCreatedAt(row.created_at),
  };
}

export async function deleteBlock(id: string, userId: string): Promise<void> {
  const pool = DB.getPool();
  await pool.query(
    `DELETE FROM calendar_blocked_dates WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
}
