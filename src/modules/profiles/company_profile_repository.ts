import DB from "../../db/db_configuration";
import {
  CompanyProfile,
  CompanyProfileInput,
} from "./company-profile.type";

const getByUserId = async (userId: string): Promise<CompanyProfile | null> => {
  const pool = DB.getPool();

  const query = `
    SELECT
      id,
      user_id,
      business_name,
      public_slug,
      is_public_enabled,
      rut,
      city,
      address,
      phone,
      brand_color,
      description,
      welcome_message,
      instagram_url,
      whatsapp_number,
      business_hours,
      cover_image,
      created_at,
      updated_at
    FROM business_profiles
    WHERE user_id = $1
    LIMIT 1
  `;

  const result = await pool.query<CompanyProfile>(query, [userId]);

  return result.rows[0] ?? null;
};

const getByPublicSlug = async (
  publicSlug: string,
): Promise<CompanyProfile | null> => {
  const pool = DB.getPool();

  const query = `
    SELECT
      id,
      user_id,
      business_name,
      public_slug,
      is_public_enabled,
      rut,
      city,
      address,
      phone,
      brand_color,
      description,
      welcome_message,
      instagram_url,
      whatsapp_number,
      business_hours,
      cover_image,
      created_at,
      updated_at
    FROM business_profiles
    WHERE public_slug = $1
      AND is_public_enabled = true
    LIMIT 1
  `;

  const result = await pool.query<CompanyProfile>(query, [publicSlug]);

  return result.rows[0] ?? null;
};


const upsert = async (
  input: CompanyProfileInput,
): Promise<CompanyProfile> => {
  const pool = DB.getPool();

  const query = `
    INSERT INTO business_profiles (
      user_id,
      business_name,
      rut,
      city,
      address,
      phone,
      brand_color,
      description,
      welcome_message,
      instagram_url,
      whatsapp_number,
      business_hours,
      cover_image,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      business_name = EXCLUDED.business_name,
      rut = EXCLUDED.rut,
      city = EXCLUDED.city,
      address = EXCLUDED.address,
      phone = EXCLUDED.phone,
      brand_color = EXCLUDED.brand_color,
      description = EXCLUDED.description,
      welcome_message = EXCLUDED.welcome_message,
      instagram_url = EXCLUDED.instagram_url,
      whatsapp_number = EXCLUDED.whatsapp_number,
      business_hours = EXCLUDED.business_hours,
      cover_image = EXCLUDED.cover_image,
      updated_at = NOW()
    RETURNING
      id,
      user_id,
      business_name,
      public_slug,
      is_public_enabled,
      rut,
      city,
      address,
      phone,
      brand_color,
      description,
      welcome_message,
      instagram_url,
      whatsapp_number,
      business_hours,
      cover_image,
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
    input.brand_color ?? null,
    input.description ?? null,
    input.welcome_message ?? null,
    input.instagram_url ?? null,
    input.whatsapp_number ?? null,
    input.business_hours ?? null,
    input.cover_image ?? null,
  ];

  const result = await pool.query<CompanyProfile>(query, values);

  if (!result.rows[0]) {
    throw new Error("No se pudo guardar el perfil de empresa");
  }

  return result.rows[0];
};

const updateCoverImage = async (userId: string, url: string): Promise<void> => {
  const pool = DB.getPool();
  await pool.query(
    `UPDATE business_profiles SET cover_image = $1, updated_at = NOW() WHERE user_id = $2`,
    [url, userId],
  );
};

export const companyProfileRepository = {
  getByUserId,
  getByPublicSlug,
  upsert,
  updateCoverImage,
};
