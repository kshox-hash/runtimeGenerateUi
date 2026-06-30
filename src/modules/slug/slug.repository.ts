import DB from "../../db/db_configuration";

export async function findSlugByUserIdRepository(userId: string) {
  const result = await DB.getPool().query(
    `
    SELECT *
    FROM user_slug_settings
    WHERE user_id = $1
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function findSlugByValueRepository(slug: string) {
  const result = await DB.getPool().query(
    `
    SELECT *
    FROM user_slug_settings
    WHERE public_slug = $1
    LIMIT 1
    `,
    [slug]
  );

  return result.rows[0] ?? null;
}

export async function insertSlugRepository(params: {
  userId: string;
  slug: string;
}): Promise<void> {
  try {
    await DB.getPool().query(
      `
      INSERT INTO user_slug_settings (
        user_id,
        public_slug,
        is_public_enabled
      )
      VALUES (
        $1,
        $2,
        true
      )
      `,
      [params.userId, params.slug]
    );
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      throw new Error("Ese nombre ya se encuentra ocupado");
    }
    throw err;
  }
}

export async function migrateSlugUniqueConstraint(): Promise<void> {
  await DB.getPool().query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'user_slug_settings' AND indexname = 'user_slug_settings_public_slug_unique'
      ) THEN
        CREATE UNIQUE INDEX user_slug_settings_public_slug_unique ON user_slug_settings (public_slug);
      END IF;
    END $$;
  `);
}