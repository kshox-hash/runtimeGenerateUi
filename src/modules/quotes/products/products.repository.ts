import DB from "../../../db/db_configuration";
import { CreateProductInput, UpdateProductInput } from "./products.schema";

export async function createProductRepository(userId: string, params: CreateProductInput) {
  const res = await DB.getPool().query(
    `INSERT INTO pdf_products (user_id, code, name, price, description, sort_order, is_active, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, true, now())
     RETURNING *`,
    [userId, params.code, params.name, params.price, params.description || null, params.sortOrder]
  );
  return res.rows[0];
}

export async function getProductsRepository(userId: string) {
  const res = await DB.getPool().query(
    `SELECT id, code, name, price, description, sort_order, is_active, created_at, updated_at
     FROM pdf_products
     WHERE user_id = $1
     ORDER BY sort_order ASC, created_at ASC`,
    [userId]
  );
  return res.rows;
}

export async function getProductByIdRepository(userId: string, productId: string) {
  const res = await DB.getPool().query(
    `SELECT id, code, name, price, description, sort_order, is_active, created_at, updated_at
     FROM pdf_products
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [productId, userId]
  );
  return res.rows[0] || null;
}

export async function updateProductRepository(userId: string, productId: string, params: UpdateProductInput) {
  const fields: string[] = [];
  const values: any[] = [];
  let i = 1;

  if (params.code !== undefined)        { fields.push(`code = $${i++}`);        values.push(params.code); }
  if (params.name !== undefined)        { fields.push(`name = $${i++}`);        values.push(params.name); }
  if (params.price !== undefined)       { fields.push(`price = $${i++}`);       values.push(params.price); }
  if (params.description !== undefined) { fields.push(`description = $${i++}`); values.push(params.description); }
  if (params.sortOrder !== undefined)   { fields.push(`sort_order = $${i++}`);  values.push(params.sortOrder); }
  if (params.isActive !== undefined)    { fields.push(`is_active = $${i++}`);   values.push(params.isActive); }

  if (fields.length === 0) return null;

  fields.push(`updated_at = now()`);
  values.push(productId, userId);

  const res = await DB.getPool().query(
    `UPDATE pdf_products SET ${fields.join(", ")}
     WHERE id = $${i++} AND user_id = $${i++}
     RETURNING *`,
    values
  );
  return res.rows[0] || null;
}

export async function deleteProductRepository(userId: string, productId: string) {
  const res = await DB.getPool().query(
    `DELETE FROM pdf_products WHERE id = $1 AND user_id = $2 RETURNING id`,
    [productId, userId]
  );
  return res.rows[0] || null;
}

export async function getActiveProductsRepository(userId: string) {
  const res = await DB.getPool().query(
    `SELECT id, code, name, price, description, sort_order
     FROM pdf_products
     WHERE user_id = $1 AND is_active = true
     ORDER BY sort_order ASC, created_at ASC`,
    [userId]
  );
  return res.rows;
}