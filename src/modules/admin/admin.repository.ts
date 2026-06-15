import DB from "../../db/db_configuration";

export type UserFeeRow = {
  user_id: string;
  business_name: string | null;
  platform_fee_pct: number;
};

export async function getAllUsersWithFee(): Promise<UserFeeRow[]> {
  const pool = DB.getPool();
  const result = await pool.query(
    `SELECT user_id, business_name, platform_fee_pct
     FROM business_profiles
     ORDER BY business_name ASC NULLS LAST`
  );
  return result.rows;
}

export async function updateUserFeePct(userId: string, pct: number): Promise<void> {
  const pool = DB.getPool();
  await pool.query(
    `UPDATE business_profiles SET platform_fee_pct = $1 WHERE user_id = $2`,
    [pct, userId]
  );
}
