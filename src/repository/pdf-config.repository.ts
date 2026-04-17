import DB from "../db/db_configuration";

export async function findTemplateByCode(code: string) {
  const res = await DB.getPool().query(
    `
    select id, code, name
    from system_templates
    where code = $1
      and is_active = true
    limit 1
    `,
    [code]
  );

  return res.rowCount ? res.rows[0] : null;
}

export async function findPdfConfigByUserId(userId: string) {
  const settingsRes = await DB.getPool().query(
    `
    select
      pms.selected_template_id,
      st.code as template_code
    from pdf_module_settings pms
    inner join system_templates st
      on st.id = pms.selected_template_id
    where pms.user_id = $1
    limit 1
    `,
    [userId]
  );

  if (!settingsRes.rowCount) {
    return null;
  }

  const businessRes = await DB.getPool().query(
    `
    select
      business_name,
      business_subtitle,
      city,
      footer_text
    from business_profiles
    where user_id = $1
    limit 1
    `,
    [userId]
  );

  const productsRes = await DB.getPool().query(
    `
    select
      id,
      code,
      name,
      price,
      description
    from pdf_products
    where user_id = $1
      and is_active = true
    order by sort_order asc, created_at asc
    `,
    [userId]
  );

  return {
    settings: settingsRes.rows[0],
    business: businessRes.rows[0] || null,
    products: productsRes.rows,
  };
}

export async function upsertBusinessProfile(params: {
  userId: string;
  businessName: string;
  businessSubtitle?: string;
  city?: string;
  footerText?: string;
}) {
  await DB.getPool().query(
    `
    insert into business_profiles (
      user_id,
      business_name,
      business_subtitle,
      city,
      footer_text,
      updated_at
    )
    values ($1, $2, $3, $4, $5, now())
    on conflict (user_id)
    do update set
      business_name = excluded.business_name,
      business_subtitle = excluded.business_subtitle,
      city = excluded.city,
      footer_text = excluded.footer_text,
      updated_at = now()
    `,
    [
      params.userId,
      params.businessName,
      params.businessSubtitle || null,
      params.city || null,
      params.footerText || null,
    ]
  );
}

export async function upsertPdfModuleSettings(params: {
  userId: string;
  selectedTemplateId: string;
}) {
  await DB.getPool().query(
    `
    insert into pdf_module_settings (
      user_id,
      selected_template_id,
      updated_at
    )
    values ($1, $2, now())
    on conflict (user_id)
    do update set
      selected_template_id = excluded.selected_template_id,
      updated_at = now()
    `,
    [params.userId, params.selectedTemplateId]
  );
}

export async function deletePdfProductsByUserId(userId: string) {
  await DB.getPool().query(
    `
    delete from pdf_products
    where user_id = $1
    `,
    [userId]
  );
}

export async function insertPdfProduct(params: {
  userId: string;
  code: string;
  name: string;
  price: number;
  description?: string;
  sortOrder: number;
}) {
  await DB.getPool().query(
    `
    insert into pdf_products (
      user_id,
      code,
      name,
      price,
      description,
      sort_order,
      is_active,
      updated_at
    )
    values ($1, $2, $3, $4, $5, $6, true, now())
    `,
    [
      params.userId,
      params.code,
      params.name,
      params.price,
      params.description || null,
      params.sortOrder,
    ]
  );
}