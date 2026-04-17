import {
  deletePdfProductsByUserId,
  findPdfConfigByUserId,
  findTemplateByCode,
  insertPdfProduct,
  upsertBusinessProfile,
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
    templateCode: data.settings.template_code,
    businessName: data.business?.business_name || "",
    businessSubtitle: data.business?.business_subtitle || null,
    city: data.business?.city || null,
    footerText: data.business?.footer_text || null,
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
  const template = await findTemplateByCode(input.templateCode);

  if (!template) {
    throw new Error("Plantilla no encontrada");
  }

  await upsertBusinessProfile({
    userId: input.userId,
    businessName: input.businessName,
    businessSubtitle: input.businessSubtitle,
    city: input.city,
    footerText: input.footerText,
  });

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