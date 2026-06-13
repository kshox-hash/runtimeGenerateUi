import { Request, Response } from "express";
import fs from "fs";

import { getSlugByValueService } from "../slug/slug.service";
import { getProductsRepository } from "../quotes/products/products.repository";
import { generateQuotePdf } from "../quotes/quote.service"; 
import { sendQuoteEmail } from "../quotes/quote-email.service";

import { notificationService } from "../notifications/notification.service";
import { StatisticsService } from "../stadistics/stadistics.service";

const statsService = new StatisticsService();
type SubmitQuoteBody = {
  customer: {
    name: string;
    phone: string;
    email?: string;
    message?: string;
  };
  items: {
    productId: string;
    quantity: number;
  }[];
};

type Params = {
  publicSlug: string;
};

export const quotesSubmitController = {

  async submit(req: Request<Params, any, SubmitQuoteBody>, res: Response): Promise<Response | void> {
    const { publicSlug } = req.params;
    const { customer, items } = req.body;

    try {
      // 1. Validaciones básicas
      if (!publicSlug?.trim()) {
        return res.status(400).json({ ok: false, message: "Slug inválido." });
      }

      if (!customer?.name?.trim() || !customer?.phone?.trim()) {
        return res.status(400).json({ ok: false, message: "Nombre y teléfono son obligatorios." });
      }

      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ ok: false, message: "Selecciona al menos un producto." });
      }

      // 2. Obtener negocio
      const slug = await getSlugByValueService(publicSlug);
      if (!slug) {
        return res.status(404).json({ ok: false, message: "Negocio no encontrado." });
      }

      // 3. Obtener productos activos del negocio
      const allProducts = await getProductsRepository(slug.user_id);

      // 4. Cruzar items seleccionados con productos reales (nunca confiar en precios del cliente)
      const lines = items
        .map((item) => {
          const product = allProducts.find((p: any) => String(p.id) === String(item.productId));
          if (!product || item.quantity <= 0) return null;
          const unitPrice = Number(product.price || 0);
          const quantity = Math.max(1, Math.floor(item.quantity));
          return {
            name: product.name,
            description: product.description || "",
            quantity,
            unitPrice,
            subtotal: unitPrice * quantity,
          };
        })
        .filter(Boolean) as { name: string; description: string; quantity: number; unitPrice: number; subtotal: number }[];

      if (lines.length === 0) {
        return res.status(400).json({ ok: false, message: "Ningún producto válido seleccionado." });
      }

      const total = lines.reduce((acc, l) => acc + l.subtotal, 0);

      // 5. Generar PDF — adaptamos el record que espera generateQuotePdf
      const record = {
        token: `${publicSlug}-${Date.now()}`,
        config: {
          brand: slug.business_name || slug.public_slug,
          title: "Cotización",
          subtitle: "",
        },
      };

      const submitBody = {
        customer: {
          name: customer.name,
          email: customer.email || "",
          phone: customer.phone,
          notes: customer.message || "",
        },
        items,
      };

      const { fileName, filePath } = await generateQuotePdf({
  token: `${publicSlug}-${Date.now()}`,
  brand: slug.business_name || slug.public_slug,
  title: "Cotización",
  subtitle: "",
  customer: {
    name: customer.name,
    email: customer.email || "",
    phone: customer.phone,
    notes: customer.message || "",
  },
  lines,
  total,
});

if (customer.email?.trim()) {
  try {
    console.log("[quotesSubmit] Enviando correo a:", customer.email.trim());
    await sendQuoteEmail({
      to: customer.email.trim(),
      customerName: customer.name,
      brandName: slug.business_name || slug.public_slug,
      pdfPath: filePath,
      pdfFileName: fileName,
      items: lines,
      total,
    });
    console.log("[quotesSubmit] Correo enviado OK");
  } catch (emailError: any) {
    console.error("[quotesSubmit] Error enviando correo:", emailError?.message);
    // No bloqueamos la respuesta si falla el correo
  } finally {
    fs.unlink(filePath, () => {});
  }
} else {
  fs.unlink(filePath, () => {});
}

    await notificationService.quoteCreated({
  userId: slug.user_id,
  customerName: customer.name,
});

statsService.increment(slug.user_id, "quote_submitted").catch(() => {});

return res.status(200).json({
  ok: true,
  message: customer.email?.trim()
    ? "¡Cotización enviada! Revisa tu correo."
    : "Cotización recibida. Nos contactaremos pronto.",
});


    } catch (error: any) {
     
  console.error("[quotesSubmit] Error:", error?.message || error);
  console.error("[quotesSubmit] Stack:", error?.stack);
  return res.status(500).json({ ok: false, message: "Error procesando la cotización." });
}
      
    }
  
};