import DB from "../db/db_configuration";

export async function findWhatsAppConfigByUserId(userId: string) {
  const res = await DB.getPool().query(
    `
    SELECT phone_number_id, whatsapp_access_token
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    [userId]
  );

  return res.rowCount ? res.rows[0] : null;
}