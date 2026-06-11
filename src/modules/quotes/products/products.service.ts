import { createProductSchema, updateProductSchema, CreateProductInput, UpdateProductInput } from "./products.schema";
import {
  createProductRepository,
  getProductsRepository,
  getProductByIdRepository,
  updateProductRepository,
  deleteProductRepository,
  getActiveProductsRepository,
} from "./products.repository";

export const productsService = {

  async create(userId: string, body: unknown) {
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    console.error(JSON.stringify(parsed.error.flatten(), null, 2)); // 👈
    throw { status: 400, message: 'error[safeparse]' };
  }
  return createProductRepository(userId, parsed.data);
},

  async getAll(userId: string) {
    return getProductsRepository(userId);
  },

  async getById(userId: string, productId: string) {
    const product = await getProductByIdRepository(userId, productId);
    if (!product) throw { status: 404, message: "Producto no encontrado." };
    return product;
  },

  async update(userId: string, productId: string, body: unknown) {
    const parsed = updateProductSchema.safeParse(body);
    if (!parsed.success) {
      throw { status: 400, message: "error[erroUpdate]" };
    }
    const existing = await getProductByIdRepository(userId, productId);
    if (!existing) throw { status: 404, message: "Producto no encontrado." };

    const updated = await updateProductRepository(userId, productId, parsed.data);
    return updated;
  },

  async delete(userId: string, productId: string) {
    const existing = await getProductByIdRepository(userId, productId);
    if (!existing) throw { status: 404, message: "Producto no encontrado." };

    await deleteProductRepository(userId, productId);
    return { ok: true };
  },

  async getActiveProducts(userId: string) {
    return getActiveProductsRepository(userId);
  },
};