const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

import { RuntimeLinkRecord, SubmitBody } from "../types/runtime";
import { buildQuoteDetail, formatCurrencyCLP } from "../utils/format";
import { sanitizeFileName } from "../utils/token";

export const GENERATED_PDFS_DIR = path.join(__dirname, "..", "generated-pdfs");

if (!fs.existsSync(GENERATED_PDFS_DIR)) {
  fs.mkdirSync(GENERATED_PDFS_DIR, { recursive: true });
}

export function generateQuotePdf(
  record: RuntimeLinkRecord,
  submitBody: SubmitBody
) {
  return new Promise<{ fileName: string; filePath: string }>((resolve, reject) => {
    try {
      const quote = buildQuoteDetail(record, submitBody);
      const timestamp = Date.now();
      const safeToken = sanitizeFileName(record.token);
      const fileName = `cotizacion_${safeToken}_${timestamp}.pdf`;
      const filePath = path.join(GENERATED_PDFS_DIR, fileName);

      const doc = new PDFDocument({
        margin: 22,
        size: [430, 950],
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 22;
      const contentWidth = pageWidth - margin * 2;

      const colors = {
        primary: "#d1d1d1",
        primaryDark: "#366AFF",
        text: "#111827",
        muted: "#6B7280",
        border: "#D1D5DB",
        lighter: "#F9FAFB",
        white: "#FFFFFF",
      };

      const logoPath = path.join(__dirname, "..", "assets", "logo.png");

      const customerName = quote.customer.name || "-";
      const customerEmail = quote.customer.email || "-";
      const customerPhone = quote.customer.phone || "-";
      const customerNotes = quote.customer.notes || "-";

      const quoteNumber = `AF-${String(timestamp).slice(-6)}`;
      const issueDate = new Date().toLocaleDateString("es-CL");

      function drawHeader() {
        doc.rect(0, 0, pageWidth, 92).fill(colors.primary);

        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, margin, 18, { fit: [84, 48] });
        } else {
          doc.fillColor(colors.white).fontSize(24).text("AF", margin, 28);
        }

        doc
          .fillColor(colors.white)
          .font("Helvetica-Bold")
          .fontSize(22)
          .text("Cotización", pageWidth - 160, 24, {
            width: 138,
            align: "right",
          });

        doc
          .font("Helvetica")
          .fontSize(10)
          .text("Automatiza Fácil", pageWidth - 160, 54, {
            width: 138,
            align: "right",
          });
      }

      function drawTableHeader(startY: number) {
        doc
          .fillColor(colors.primaryDark)
          .roundedRect(margin, startY, contentWidth, 28, 6)
          .fill();

        const padding = 12;
        const innerWidth = contentWidth - padding * 2;

        const descWidth = innerWidth * 0.48;
        const qtyWidth = innerWidth * 0.12;
        const priceWidth = innerWidth * 0.16;
        const subtotalWidth = innerWidth * 0.20;

        const col1 = margin + padding;
        const col2 = col1 + descWidth;
        const col3 = col2 + qtyWidth;
        const col4 = col3 + priceWidth;

        doc
          .fillColor(colors.white)
          .font("Helvetica-Bold")
          .fontSize(9)
          .text("Descripción", col1, startY + 9, { width: descWidth - 6 })
          .text("Cant.", col2, startY + 9, { width: qtyWidth, align: "center" })
          .text("Precio", col3, startY + 9, { width: priceWidth - 6, align: "right" })
          .text("Subtotal", col4, startY + 9, { width: subtotalWidth - 6, align: "right" });

        return {
          nextY: startY + 28,
          col1,
          col2,
          col3,
          col4,
          descWidth,
          qtyWidth,
          priceWidth,
          subtotalWidth,
        };
      }

      drawHeader();

      let y = 110;

      // Cliente
      doc.roundedRect(margin, y, contentWidth, 100, 12).fillAndStroke(colors.white, colors.border);

      doc.font("Helvetica-Bold").fontSize(12).fillColor(colors.text).text("Cliente", margin + 16, y + 16);

      doc.font("Helvetica").fontSize(10)
        .text(`Nombre: ${customerName}`, margin + 16, y + 40)
        .text(`Correo: ${customerEmail}`, margin + 16, y + 58)
        .text(`Teléfono: ${customerPhone}`, margin + 16, y + 76);

      y += 120;

      // Tabla
      let table = drawTableHeader(y);
      y = table.nextY;

      quote.lines.forEach((line, i) => {
        const rowHeight = 50;
        const bg = i % 2 === 0 ? colors.white : colors.lighter;

        doc.rect(margin, y, contentWidth, rowHeight).fill(bg);

        doc.font("Helvetica-Bold").fontSize(10)
          .fillColor(colors.text)
          .text(line.name, table.col1, y + 10, { width: table.descWidth });

        doc.font("Helvetica").fontSize(9)
          .text(line.description || "", table.col1, y + 26, { width: table.descWidth });

        doc.font("Helvetica").fontSize(9)
          .text(line.quantity, table.col2, y + 18, { width: table.qtyWidth, align: "center" })
          .text(formatCurrencyCLP(line.unitPrice), table.col3, y + 18, { width: table.priceWidth, align: "right" })
          .text(formatCurrencyCLP(line.subtotal), table.col4, y + 18, {
            width: table.subtotalWidth,
            align: "right",
          });

        y += rowHeight;
      });

      y += 20;

      // Totales
      doc.roundedRect(margin, y, contentWidth, 110, 12).fill(colors.lighter);

      const labelX = margin + 16;
      const valueWidth = 100;
      const valueX = margin + contentWidth - valueWidth - 16;

      doc.fontSize(10).fillColor(colors.text)
        .text("Subtotal", labelX, y + 18)
        .text(formatCurrencyCLP(quote.total), valueX, y + 18, { width: valueWidth, align: "right" });

      doc.text("Descuento", labelX, y + 40)
        .text("$0", valueX, y + 40, { width: valueWidth, align: "right" });

      doc.font("Helvetica-Bold").fontSize(12)
        .text("Total", labelX, y + 70)
        .fontSize(13)
        .text(formatCurrencyCLP(quote.total), valueX, y + 68, { width: valueWidth, align: "right" });

      doc.end();

      stream.on("finish", () => resolve({ fileName, filePath }));
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
}