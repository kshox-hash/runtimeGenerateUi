import { Request, Response } from "express";
import fs from "fs";
import { generateQuotePdf } from "./quote.service";
import { sendQuoteEmail } from "./quote-email.service";
import { getSlugByUserIdService } from "../slug/slug.service";
import { companyProfileService } from "../profiles/company_profile.service";
import { saveQuoteHistory } from "./quote-history/quote-history.repository";

type QuoteItem = {
  title: string;
  price: number;
  description?: string;
  quantity?: number;
};

type SendQuoteBody = {
  client: {
    name: string;
    email: string;
    phone?: string;
  };
  products: QuoteItem[];
  message?: string;
  templateType?: string;
  extraFields?: Record<string, any>;
  quoteStyle?: string;
  quoteAccentColor?: string;
};

export const quoteSendController = {
  async send(req: Request<{}, {}, SendQuoteBody>, res: Response): Promise<Response> {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ ok: false, message: "No autorizado" });

      const {
        client,
        products,
        message,
        templateType = "rapida",
        extraFields = {},
        quoteStyle,
        quoteAccentColor,
      } = req.body;

      if (!client?.name?.trim() || !client?.email?.trim()) {
        return res.status(400).json({ ok: false, message: "Nombre y email del cliente son obligatorios." });
      }
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ ok: false, message: "Se requiere al menos un producto." });
      }

      // Cargar datos del negocio en paralelo
      const [slug, profile] = await Promise.all([
        getSlugByUserIdService(userId).catch(() => null),
        companyProfileService.getByUserId(userId).catch(() => null),
      ]);

      const brandName =
        profile?.business_name ||
        slug?.business_name ||
        slug?.public_slug ||
        "Mi negocio";

      const brandAddress = [profile?.address, profile?.city]
        .filter(Boolean)
        .join(", ") || undefined;

      const lines = products.map((p) => {
        const unitPrice = Number(p.price || 0);
        const quantity  = Math.max(1, Number(p.quantity || 1));
        return {
          name:      p.title || "Servicio",
          description: p.description || "",
          quantity,
          unitPrice,
          subtotal: unitPrice * quantity,
        };
      });

      const total = lines.reduce((acc, l) => acc + l.subtotal, 0);

      const docTitle =
        templateType === "eventos" ? "Propuesta" : "Cotización";

      const { fileName, filePath } = await generateQuotePdf({
        token:              `custom-${userId}-${Date.now()}`,
        brand:              brandName,
        brandRut:           profile?.rut         || undefined,
        brandAddress,
        brandPhone:         profile?.phone        || undefined,
        brandCoverImageUrl: profile?.cover_image  || undefined,
        brandAccentColor:   quoteAccentColor      || profile?.brand_color || undefined,
        quoteStyle,
        title:              docTitle,
        subtitle:           profile?.description  || "",
        templateType: templateType as any,
        customer: {
          name:  client.name,
          email: client.email,
          phone: client.phone || "",
          notes: message || "",
        },
        lines,
        total,
        extraFields,
      });

      try {
        await sendQuoteEmail({
          to:           client.email,
          customerName: client.name,
          brandName,
          pdfPath:      filePath,
          pdfFileName:  fileName,
          items:        lines,
          total,
        });
      } finally {
        fs.unlink(filePath, () => {});
      }

      // Guardar en historial (no bloquea la respuesta)
      saveQuoteHistory({
        userId,
        templateType,
        clientName:  client.name,
        clientEmail: client.email,
        clientPhone: client.phone,
        items:       products,
        total,
        message,
        extraFields,
      }).catch((err) => console.error("[quoteSend] historial:", err));

      return res.status(200).json({ ok: true, message: "Cotización enviada correctamente." });
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error?.message || "Error enviando cotización." });
    }
  },
};
