import {
  deletePdfProductsByUserId,
  findPdfConfigByUserId,
  findTemplateByName,
  insertPdfProduct,
  upsertPdfModuleSettings,
} from "../repository/pdf-config.repository";
import { PdfConfigOutput, SavePdfConfigInput } from "../types/pdf-config";

export async function getPdfConfig(
  userId: string
): Promise<PdfConfigOutput | null> {
  const data = await findPdfConfigByUserId(userId);

  if (!data) {
    return null;
  }

  return {
    templateCode: data.settings.template_name,
    products: data.products.map((row: any) => ({
      id: String(row.id),
      code: row.code,
      name: row.name,
      price: Number(row.price),
      description: row.description,
    })),
  };
}

export async function savePdfConfig(input: SavePdfConfigInput) {
  const template = await findTemplateByName(input.templateCode);

  if (!template) {
    throw new Error("Plantilla no encontrada");
  }

  await upsertPdfModuleSettings({
    userId: input.userId,
    selectedTemplateId: template.id,
  });

  await deletePdfProductsByUserId(input.userId);

  for (let i = 0; i < input.products.length; i++) {
    const product = input.products[i];

    await insertPdfProduct({
      userId: input.userId,
      code: product.code || `p${i + 1}`,
      name: product.name,
      price: product.price,
      description: product.description,
      sortOrder: i + 1,
    });
  }

  return { ok: true };
}