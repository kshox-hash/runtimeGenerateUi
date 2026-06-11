import { z } from "zod";

export const createProductSchema = z.object({
  code: z.string().min(1, "Código obligatorio").max(50),
  name: z.string().min(1, "Nombre obligatorio").max(200),
  price: z.coerce.number({ error: "Precio debe ser número" }).min(0, "Precio no puede ser negativo"),
  description: z.string().max(500).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateProductSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  name: z.string().min(1).max(200).optional(),
  price: z.number().min(0).optional(),
  description: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;