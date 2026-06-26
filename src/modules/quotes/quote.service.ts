import PDFDocument from "pdfkit";
import fs from "fs";
import https from "https";
import http from "http";
import path from "path";

import { formatCurrencyCLP } from "../../utils/format";
import { sanitizeFileName } from "../../utils/token";

export const GENERATED_PDFS_DIR = path.join(__dirname, "..", "generated-pdfs");

if (!fs.existsSync(GENERATED_PDFS_DIR)) {
  fs.mkdirSync(GENERATED_PDFS_DIR, { recursive: true });
}

export type QuoteTemplateType =
  | "servicios"
  | "productos"
  | "construccion"
  | "eventos"
  | "rapida";

type QuotePdfInput = {
  token: string;
  brand: string;
  brandRut?: string;
  brandAddress?: string;
  brandPhone?: string;
  brandCoverImageUrl?: string;
  brandAccentColor?: string;
  title?: string;
  subtitle?: string;
  templateType?: QuoteTemplateType;
  customer: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
  lines: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  total: number;
  extraFields?: {
    paymentConditions?: string;
    deliveryDate?: string;
    exclusions?: string;
    deliveryTime?: string;
    priceValidity?: string;
    workAddress?: string;
    duration?: string;
    paymentSchedule?: string;
    eventDate?: string;
    bookingDeposit?: string;
    cancellationPolicy?: string;
    notes?: string;
  };
};

const TEMPLATE_LABELS: Record<QuoteTemplateType, string> = {
  servicios:    "Servicios Profesionales",
  productos:    "Productos / Suministros",
  construccion: "Construcción",
  eventos:      "Propuesta de Evento",
  rapida:       "Cotización",
};

function downloadImageBuffer(url: string): Promise<Buffer> {
  // Convert to JPEG for Cloudinary URLs (PDFKit supports JPEG and PNG natively)
  const finalUrl =
    url.includes("cloudinary.com") && url.includes("/upload/")
      ? url.replace("/upload/", "/upload/f_jpg,q_80/")
      : url;

  return new Promise((resolve, reject) => {
    const client = finalUrl.startsWith("https") ? https : http;
    const req = client.get(finalUrl, (res) => {
      if ((res.statusCode ?? 0) >= 400) {
        reject(new Error(`Image download failed: HTTP ${res.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(6000, () => {
      req.destroy();
      reject(new Error("Image download timeout"));
    });
  });
}

export async function generateQuotePdf(
  input: QuotePdfInput
): Promise<{ fileName: string; filePath: string }> {
  let coverBuffer: Buffer | null = null;
  if (input.brandCoverImageUrl?.trim()) {
    coverBuffer = await downloadImageBuffer(input.brandCoverImageUrl).catch(() => null);
  }

  return new Promise<{ fileName: string; filePath: string }>((resolve, reject) => {
    try {
      const timestamp  = Date.now();
      const safeToken  = sanitizeFileName(input.token);
      const fileName   = `cotizacion_${safeToken}_${timestamp}.pdf`;
      const filePath   = path.join(GENERATED_PDFS_DIR, fileName);
      const tType: QuoteTemplateType = input.templateType || "rapida";

      const doc    = new PDFDocument({ margin: 0, size: "A4" });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const PW = doc.page.width;   // 595.28 pt
      const PH = doc.page.height;  // 841.89 pt
      const M  = 44;
      const CW = PW - M * 2;

      const brand     = input.brand?.trim()     || "Mi negocio";
      const docTitle  = input.title?.trim()     || TEMPLATE_LABELS[tType];
      const qNumber   = `Q-${String(timestamp).slice(-6)}`;
      const issueDate = new Date().toLocaleDateString("es-CL");
      const cust      = input.customer ?? { name: "", email: "", phone: "", notes: "" };

      const rawAccent = input.brandAccentColor?.trim() ?? "";
      const accent    = /^#[0-9A-Fa-f]{6}$/.test(rawAccent) ? rawAccent : "#111827";

      const HEADER_H = 116;

      // ── Color palette ─────────────────────────────────────────────────────────
      const ink      = "#111827";
      const inkSub   = "#4B5563";
      const inkDim   = "#9CA3AF";
      const border   = "#E5E7EB";
      const rowAlt   = "#F9FAFB";
      const tHead    = "#1F2937";
      const tHeadTxt = "#F3F4F6";
      const white    = "#FFFFFF";
      const hTxt     = "#FFFFFF";
      const hSub     = "#9CA3AF";
      const hBg      = "#111827";

      // ── Table column layout ───────────────────────────────────────────────────
      const pad = 14;
      const dW  = CW * 0.44;
      const qW  = CW * 0.10;
      const pW  = CW * 0.21;
      const sW  = CW - dW - qW - pW;
      const c1  = M + pad;
      const c2  = M + dW;
      const c3  = c2 + qW;
      const c4  = c3 + pW;
      const TH  = 27;

      // ── Draw table header row ─────────────────────────────────────────────────
      function drawTHead(sy: number): number {
        doc.rect(M, sy, CW, TH).fill(tHead);
        doc.fillColor(tHeadTxt).font("Helvetica-Bold").fontSize(7.5)
           .text("DESCRIPCIÓN",   c1, sy + 10, { width: dW - pad })
           .text("CANT.",         c2, sy + 10, { width: qW, align: "center" })
           .text("PRECIO UNIT.",  c3, sy + 10, { width: pW - 4, align: "right" })
           .text("SUBTOTAL",      c4, sy + 10, { width: sW - pad, align: "right" });
        return sy + TH;
      }

      // ── Page header band + accent strip ──────────────────────────────────────
      const LOGO_SIZE = 52;
      const LOGO_Y    = Math.round((HEADER_H - LOGO_SIZE) / 2); // centered vertically

      function drawPageHeader() {
        doc.rect(0, 0, PW, HEADER_H).fill(hBg);

        // Company logo — top-left corner (only if image available)
        let nameX = M;
        if (coverBuffer) {
          try {
            doc.save();
            doc.roundedRect(M, LOGO_Y, LOGO_SIZE, LOGO_SIZE, 8).clip();
            doc.image(coverBuffer, M, LOGO_Y, { cover: [LOGO_SIZE, LOGO_SIZE] });
            doc.restore();
            nameX = M + LOGO_SIZE + 12;
          } catch {
            nameX = M;
          }
        }

        const leftW = CW * 0.52;

        // Brand name — left (offset when logo present)
        doc.fillColor(hTxt).font("Helvetica-Bold").fontSize(18)
           .text(brand, nameX, LOGO_Y + 4, { width: leftW - (nameX - M) });

        if (input.subtitle?.trim()) {
          doc.fillColor(hSub).font("Helvetica").fontSize(8)
             .text(input.subtitle.trim(), nameX, LOGO_Y + 26, { width: leftW - (nameX - M) });
        }

        // Template category — right top
        doc.fillColor(hSub).font("Helvetica").fontSize(7.5)
           .text(TEMPLATE_LABELS[tType].toUpperCase(), M, 26, {
             width: CW, align: "right",
           });

        // Document title — right middle
        doc.fillColor(hTxt).font("Helvetica-Bold").fontSize(20)
           .text(docTitle.toUpperCase(), M, 42, {
             width: CW, align: "right",
           });

        // Quote number + date — right bottom
        doc.fillColor(hSub).font("Helvetica").fontSize(8.5)
           .text(`N° ${qNumber}  ·  ${issueDate}`, M, 72, {
             width: CW, align: "right",
           });

        // Accent strip below header
        doc.rect(0, HEADER_H, PW, 4).fill(accent);
      }

      // ── Ensure content fits; add page if needed ───────────────────────────────
      function ensureSpace(cy: number, needed: number, withTable = false): number {
        if (cy + needed <= PH - 56) return cy;
        doc.addPage();
        drawPageHeader();
        let ny = HEADER_H + 4 + 18;
        if (withTable) ny = drawTHead(ny);
        return ny;
      }

      // ── Extra fields section ──────────────────────────────────────────────────
      function drawExtraFields(startY: number): number {
        const ex   = input.extraFields || {};
        const rows: { label: string; value: string }[] = [];

        switch (tType) {
          case "servicios":
            if (ex.deliveryDate)      rows.push({ label: "Fecha estimada de entrega", value: ex.deliveryDate });
            if (ex.paymentConditions) rows.push({ label: "Condiciones de pago",        value: ex.paymentConditions });
            if (ex.exclusions)        rows.push({ label: "No incluye",                 value: ex.exclusions });
            break;
          case "productos":
            if (ex.deliveryTime)  rows.push({ label: "Tiempo de entrega",  value: ex.deliveryTime });
            if (ex.priceValidity) rows.push({ label: "Validez del precio", value: ex.priceValidity });
            break;
          case "construccion":
            if (ex.workAddress)     rows.push({ label: "Dirección de la obra",   value: ex.workAddress });
            if (ex.duration)        rows.push({ label: "Duración estimada",       value: ex.duration });
            if (ex.paymentSchedule) rows.push({ label: "Calendario de pagos",     value: ex.paymentSchedule });
            break;
          case "eventos":
            if (ex.eventDate)          rows.push({ label: "Fecha del evento",        value: ex.eventDate });
            if (ex.bookingDeposit)     rows.push({ label: "Reserva requerida",       value: ex.bookingDeposit });
            if (ex.cancellationPolicy) rows.push({ label: "Política de cancelación", value: ex.cancellationPolicy });
            break;
        }

        if (ex.notes) rows.push({ label: "Notas adicionales", value: ex.notes });
        if (rows.length === 0) return startY;

        const rowH = 20;
        const boxH = 26 + rows.length * rowH;
        let cy     = ensureSpace(startY, boxH + 16);

        doc.roundedRect(M, cy, CW, boxH, 8).fillAndStroke(rowAlt, border);
        cy += 13;
        rows.forEach(({ label, value }) => {
          doc.fillColor(inkDim).font("Helvetica-Bold").fontSize(8)
             .text(label + ":", M + 14, cy, { width: 172 });
          doc.fillColor(inkSub).font("Helvetica").fontSize(8.5)
             .text(value, M + 190, cy, { width: CW - 204 });
          cy += rowH;
        });

        return startY + boxH + 16;
      }

      // ── BUILD PAGE ────────────────────────────────────────────────────────────
      drawPageHeader();
      let y = HEADER_H + 4 + 26;

      // Issuer / Client info boxes
      const partH = 92;
      const colW  = (CW - 14) / 2;
      const col2x = M + colW + 14;

      // Issuer
      doc.roundedRect(M, y, colW, partH, 8).fillAndStroke(rowAlt, border);
      doc.fillColor(inkDim).font("Helvetica-Bold").fontSize(7)
         .text("EMISOR", M + 14, y + 14);
      doc.fillColor(ink).font("Helvetica-Bold").fontSize(11)
         .text(brand, M + 14, y + 28, { width: colW - 28 });
      let iy = y + 46;
      if (input.brandRut) {
        doc.fillColor(inkSub).font("Helvetica").fontSize(8.5)
           .text(`RUT: ${input.brandRut}`, M + 14, iy, { width: colW - 28 });
        iy += 14;
      }
      if (input.brandAddress) {
        doc.fillColor(inkSub).font("Helvetica").fontSize(8.5)
           .text(input.brandAddress, M + 14, iy, { width: colW - 28 });
        iy += 14;
      }
      if (input.brandPhone) {
        doc.fillColor(inkSub).font("Helvetica").fontSize(8.5)
           .text(`Tel: ${input.brandPhone}`, M + 14, iy, { width: colW - 28 });
      }

      // Customer
      doc.roundedRect(col2x, y, colW, partH, 8).fillAndStroke(rowAlt, border);
      doc.fillColor(inkDim).font("Helvetica-Bold").fontSize(7)
         .text("CLIENTE", col2x + 14, y + 14);
      doc.fillColor(ink).font("Helvetica-Bold").fontSize(11)
         .text(cust.name?.trim() || "—", col2x + 14, y + 28, { width: colW - 28 });
      doc.fillColor(inkSub).font("Helvetica").fontSize(8.5)
         .text(cust.email?.trim() || "—", col2x + 14, y + 45, { width: colW - 28 });
      if (cust.phone?.trim()) {
        doc.fillColor(inkSub).font("Helvetica").fontSize(8.5)
           .text(`Tel: ${cust.phone.trim()}`, col2x + 14, y + 59, { width: colW - 28 });
      }

      y += partH + 22;

      // Items table
      y = drawTHead(y);
      const lines = Array.isArray(input.lines) ? input.lines : [];

      if (lines.length === 0) {
        doc.rect(M, y, CW, 42).fill(white);
        doc.fillColor(inkDim).font("Helvetica").fontSize(10)
           .text("Sin ítems seleccionados.", c1, y + 15);
        y += 42;
      } else {
        lines.forEach((line, idx) => {
          const hasDesc = !!line.description?.trim();
          const rowH    = hasDesc ? 46 : 30;
          const fill    = idx % 2 === 0 ? white : rowAlt;
          y = ensureSpace(y, rowH + 120, true);

          doc.rect(M, y, CW, rowH).fill(fill);
          doc.strokeColor(border).lineWidth(0.4)
             .moveTo(M, y + rowH).lineTo(M + CW, y + rowH).stroke();

          const ty = hasDesc ? y + 8 : y + 10;

          doc.fillColor(ink).font("Helvetica-Bold").fontSize(9)
             .text(line.name, c1, ty, { width: dW - pad * 2 });
          if (hasDesc) {
            doc.fillColor(inkDim).font("Helvetica").fontSize(7.5)
               .text(line.description, c1, ty + 17, { width: dW - pad * 2 });
          }
          doc.fillColor(inkSub).font("Helvetica").fontSize(9)
             .text(String(line.quantity),             c2, ty, { width: qW, align: "center" })
             .text(formatCurrencyCLP(line.unitPrice),  c3, ty, { width: pW - 4, align: "right" })
             .text(formatCurrencyCLP(line.subtotal),   c4, ty, { width: sW - pad, align: "right" });

          y += rowH;
        });
      }

      y += 28;

      // ── Totals ────────────────────────────────────────────────────────────────
      y = ensureSpace(y, 96);

      const totW = 230;
      const tx   = M + CW - totW;
      const lw   = totW - 80;

      doc.fillColor(inkSub).font("Helvetica").fontSize(9)
         .text("Subtotal",  tx, y,      { width: lw })
         .text(formatCurrencyCLP(input.total), tx + lw, y, { width: 80, align: "right" });

      doc.fillColor(inkSub).font("Helvetica").fontSize(9)
         .text("Descuento", tx, y + 19, { width: lw })
         .text("—",         tx + lw, y + 19, { width: 80, align: "right" });

      doc.strokeColor(border).lineWidth(1)
         .moveTo(tx, y + 38).lineTo(M + CW, y + 38).stroke();

      doc.fillColor(ink).font("Helvetica-Bold").fontSize(13)
         .text("TOTAL", tx, y + 49, { width: lw });
      doc.fillColor(ink).font("Helvetica-Bold").fontSize(13)
         .text(formatCurrencyCLP(input.total), tx + lw, y + 47, { width: 80, align: "right" });

      y += 88;

      // ── Extra fields ─────────────────────────────────────────────────────────
      y = drawExtraFields(y);

      // ── Customer notes ────────────────────────────────────────────────────────
      const noteText = cust.notes?.trim();
      if (noteText) {
        y = ensureSpace(y, 80);
        doc.roundedRect(M, y, CW, 72, 8).fillAndStroke(rowAlt, border);
        doc.fillColor(inkDim).font("Helvetica-Bold").fontSize(7)
           .text("OBSERVACIONES DEL CLIENTE", M + 14, y + 14);
        doc.fillColor(inkSub).font("Helvetica").fontSize(9)
           .text(noteText, M + 14, y + 28, { width: CW - 28, height: 34 });
        y += 84;
      }

      // ── Footer ────────────────────────────────────────────────────────────────
      y = ensureSpace(y, 44);
      doc.strokeColor(border).lineWidth(0.8)
         .moveTo(M, y).lineTo(M + CW, y).stroke();
      doc.fillColor(inkDim).font("Helvetica").fontSize(7.5)
         .text(
           `${brand}  ·  ${docTitle} ${qNumber}  ·  Emitida el ${issueDate}  ·  Documento generado automáticamente`,
           M, y + 14, { width: CW, align: "center" }
         );

      doc.end();
      stream.on("finish", () => resolve({ fileName, filePath }));
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}
