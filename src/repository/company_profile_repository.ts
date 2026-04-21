import DB from "../db/db_configuration";
import {
  CompanyProfile,
  CompanyProfileInput,
} from "../types/company-profile.type";
const getByUserId = async (userId: string): Promise<CompanyProfile | null> => {
  const pool = DB.getPool();

  const query = `
    SELECT
      id,
      user_id,
      business_name,
      rut,
      city,
      address,
      phone,
      created_at,
      updated_at
    FROM company_profiles
    WHERE user_id = $1
    LIMIT 1
  `;

  const result = await pool.query<CompanyProfile>(query, [userId]);
  return result.rows[0] ?? null;
};

const upsert = async (
  input: CompanyProfileInput,
): Promise<CompanyProfile> => {
  const pool = DB.getPool();

  const query = `
    INSERT INTO company_profiles (
      user_id,
      business_name,
      rut,
      city,
      address,
      phone
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id)
    DO UPDATE SET
      business_name = EXCLUDED.business_name,
      rut = EXCLUDED.rut,
      city = EXCLUDED.city,
      address = EXCLUDED.address,
      phone = EXCLUDED.phone,
      updated_at = NOW()
    RETURNING
      id,
      user_id,
      business_name,
      rut,
      city,
      address,
      phone,
      created_at,
      updated_at
  `;

  const values = [
    input.user_id,
    input.business_name,
    input.rut,
    input.city,
    input.address,
    input.phone,
  ];

  const result = await pool.query<CompanyProfile>(query, values);

  if (!result.rows[0]) {
    throw new Error("No se pudo guardar el perfil de empresa");
  }

  return result.rows[0];
};

export const companyProfileRepository = {
  getByUserId,
  upsert,
};