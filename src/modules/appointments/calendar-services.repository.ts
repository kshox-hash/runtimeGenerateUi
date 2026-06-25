import DB from "../../db/db_configuration";

export type CalendarService = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  unit: string;
  price: number;
  duration_minutes: number | null;
  color: string;
  is_active: boolean;
  sort_order: number;
  photos: string[];
};

export async function initCalendarServicesTable(): Promise<void> {
  const pool = DB.getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS calendar_services (
      id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id          UUID        NOT NULL,
      name             TEXT        NOT NULL,
      price            INTEGER     NOT NULL DEFAULT 0,
      duration_minutes INTEGER,
      color            TEXT        NOT NULL DEFAULT '#63ACF1',
      is_active        BOOLEAN     NOT NULL DEFAULT TRUE,
      sort_order       INTEGER     NOT NULL DEFAULT 0,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query(`
    ALTER TABLE calendar_bookings
      ADD COLUMN IF NOT EXISTS service_id   UUID,
      ADD COLUMN IF NOT EXISTS service_name TEXT,
      ADD COLUMN IF NOT EXISTS service_color TEXT
  `);
}

export async function getServicesByUserId(userId: string): Promise<CalendarService[]> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT id::text, user_id::text, name, description, COALESCE(unit,'unidad') AS unit, price, duration_minutes, color, is_active, sort_order, COALESCE(photos, '{}') AS photos
     FROM calendar_services
     WHERE user_id = $1
     ORDER BY sort_order ASC, name ASC`,
    [userId]
  );
  return result.rows;
}

export async function getActiveServicesByUserId(userId: string): Promise<CalendarService[]> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT id::text, user_id::text, name, description, COALESCE(unit,'unidad') AS unit, price, duration_minutes, color, is_active, sort_order, COALESCE(photos, '{}') AS photos
     FROM calendar_services
     WHERE user_id = $1 AND is_active = TRUE
     ORDER BY sort_order ASC, name ASC`,
    [userId]
  );
  return result.rows;
}

export async function getActiveServicesPaginated(
  userId: string,
  limit: number,
  offset: number
): Promise<{ rows: CalendarService[]; total: number }> {
  const pool = DB.getPool();
  const sel = `SELECT id::text, user_id::text, name, description, COALESCE(unit,'unidad') AS unit, price, duration_minutes, color, is_active, sort_order, COALESCE(photos, '{}') AS photos
     FROM calendar_services WHERE user_id = $1 AND is_active = TRUE ORDER BY sort_order ASC, name ASC`;
  const [data, count] = await Promise.all([
    pool.query(sel + ` LIMIT $2 OFFSET $3`, [userId, limit, offset]),
    pool.query(`SELECT COUNT(*)::int AS total FROM calendar_services WHERE user_id = $1 AND is_active = TRUE`, [userId]),
  ]);
  return { rows: data.rows, total: Number(count.rows[0].total) };
}

export async function getServiceById(id: string, userId: string): Promise<CalendarService | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT id::text, user_id::text, name, description, COALESCE(unit,'unidad') AS unit, price, duration_minutes, color, is_active, sort_order, COALESCE(photos, '{}') AS photos
     FROM calendar_services WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0] ?? null;
}

export async function createService(input: {
  userId: string;
  name: string;
  description?: string | null;
  unit?: string;
  price: number;
  durationMinutes: number | null;
  color: string;
}): Promise<CalendarService> {
  const pool = DB.getPool();
  const result = await pool.query(
    `INSERT INTO calendar_services (user_id, name, description, unit, price, duration_minutes, color)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id::text, user_id::text, name, description, COALESCE(unit,'unidad') AS unit, price, duration_minutes, color, is_active, sort_order, COALESCE(photos, '{}') AS photos`,
    [input.userId, input.name, input.description ?? null, input.unit ?? 'unidad', input.price, input.durationMinutes ?? null, input.color]
  );
  return result.rows[0];
}

export async function updateService(input: {
  id: string;
  userId: string;
  name: string;
  price: number;
  durationMinutes: number | null;
  color: string;
  isActive: boolean;
}): Promise<CalendarService | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `UPDATE calendar_services
     SET name = $1, price = $2, duration_minutes = $3, color = $4, is_active = $5
     WHERE id = $6 AND user_id = $7
     RETURNING id::text, user_id::text, name, description, COALESCE(unit,'unidad') AS unit, price, duration_minutes, color, is_active, sort_order, COALESCE(photos, '{}') AS photos`,
    [input.name, input.price, input.durationMinutes ?? null, input.color, input.isActive, input.id, input.userId]
  );
  return result.rows[0] ?? null;
}

export async function deleteService(id: string, userId: string): Promise<boolean> {
  const pool = DB.getPool();
  const result = await pool.query(
    `DELETE FROM calendar_services WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function addPhotoToService(id: string, userId: string, url: string): Promise<string[] | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `UPDATE calendar_services
     SET photos = array_append(COALESCE(photos, '{}'), $1)
     WHERE id = $2 AND user_id = $3
     RETURNING photos`,
    [url, id, userId]
  );
  return result.rows[0]?.photos ?? null;
}

export async function removePhotoFromService(id: string, userId: string, url: string): Promise<string[] | null> {
  const pool = DB.getPool();
  const result = await pool.query(
    `UPDATE calendar_services
     SET photos = array_remove(COALESCE(photos, '{}'), $1)
     WHERE id = $2 AND user_id = $3
     RETURNING photos`,
    [url, id, userId]
  );
  return result.rows[0]?.photos ?? null;
}
