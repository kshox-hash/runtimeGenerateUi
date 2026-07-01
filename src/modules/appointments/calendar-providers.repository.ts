import DB from "../../db/db_configuration";

const pool = DB.getPool();

const PROVIDER_PALETTE = [
  "#63ACF1", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#2DD4BF", "#F97316",
];

function toInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .substring(0, 3)
    .toUpperCase();
}

export async function getProvidersByUserId(userId: string) {
  const result = await pool.query(
    `SELECT id::text, user_id::text, name, color, avatar_initials, is_active
     FROM calendar_providers
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId]
  );
  const rows = result.rows;

  // Auto-fix: if any two providers share the same color, re-assign palette by position
  const hasDuplicates =
    rows.length > 1 && new Set(rows.map((r) => r.color)).size < rows.length;

  if (hasDuplicates) {
    for (let i = 0; i < rows.length; i++) {
      const newColor = PROVIDER_PALETTE[i % PROVIDER_PALETTE.length];
      rows[i] = { ...rows[i], color: newColor };
      pool
        .query(`UPDATE calendar_providers SET color = $1 WHERE id = $2`, [newColor, rows[i].id])
        .catch(() => {});
    }
  }

  return rows;
}

export async function createProvider(input: {
  userId: string;
  name: string;
}) {
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS count FROM calendar_providers WHERE user_id = $1`,
    [input.userId]
  );
  const count = Number(countResult.rows[0]?.count ?? 0);
  const color = PROVIDER_PALETTE[count % PROVIDER_PALETTE.length];

  const result = await pool.query(
    `INSERT INTO calendar_providers (user_id, name, color, avatar_initials)
     VALUES ($1, $2, $3, $4)
     RETURNING id::text, user_id::text, name, color, avatar_initials, is_active`,
    [input.userId, input.name.trim(), color, toInitials(input.name)]
  );
  return result.rows[0];
}

export async function updateProvider(input: {
  id: string;
  name: string;
  isActive?: boolean;
  userId: string;
}) {
  const result = await pool.query(
    `UPDATE calendar_providers
     SET name = $2, avatar_initials = $3, is_active = $4, updated_at = NOW()
     WHERE id = $1 AND user_id = $5
     RETURNING id::text, user_id::text, name, color, avatar_initials, is_active`,
    [
      input.id,
      input.name.trim(),
      toInitials(input.name),
      input.isActive !== false,
      input.userId,
    ]
  );
  return result.rows[0] ?? null;
}

export async function deleteProvider(id: string, userId: string) {
  const active = await pool.query(
    `SELECT id FROM calendar_bookings
     WHERE provider_id = $1 AND user_id = $2
       AND status IN ('confirmed','pending_payment')
       AND (expires_at IS NULL OR expires_at > NOW())
     LIMIT 1`,
    [id, userId]
  );
  if ((active.rowCount ?? 0) > 0) {
    throw new Error("Este profesional tiene reservas activas. Cancélalas antes de eliminarlo.");
  }
  await pool.query(`DELETE FROM calendar_providers WHERE id = $1 AND user_id = $2`, [id, userId]);
}

export async function isProviderActiveForUser(providerId: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT id FROM calendar_providers WHERE id = $1 AND user_id = $2 AND is_active = true LIMIT 1`,
    [providerId, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getActiveProvidersByUserId(userId: string) {
  const result = await pool.query(
    `SELECT cp.id::text, cp.name, cp.color, cp.avatar_initials,
            COALESCE(
              (SELECT ARRAY_AGG(DISTINCT ca.weekday ORDER BY ca.weekday)
               FROM calendar_availability ca
               WHERE ca.user_id = cp.user_id AND ca.provider_id = cp.id AND ca.is_active = true),
              ARRAY[]::int[]
            ) AS custom_weekdays
     FROM calendar_providers cp
     WHERE cp.user_id = $1 AND cp.is_active = true
     ORDER BY cp.created_at ASC`,
    [userId]
  );
  return result.rows;
}
