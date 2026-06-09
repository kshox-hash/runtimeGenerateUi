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
}