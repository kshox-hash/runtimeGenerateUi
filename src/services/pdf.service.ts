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

export function generateQuotePdf(record: RuntimeLinkRecord, submitBody: SubmitBody) {
  return new Promise<{ fileName: string; filePath: string }>((resolve, reject) => {
    try {
      const quote = buildQuoteDetail(record, submitBody);
      const timestamp = Date.now();
      const safeToken = sanitizeFileName(record.token);
      const fileName = `cotizacion_${safeToken}_${timestamp}.pdf`;
      const filePath = path.join(GENERATED_PDFS_DIR, fileName);

      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;

      const colors = {
        primary: "#cccccc",
        primaryDark: "#366AFF",
        text: "#111827",
        muted: "#6B7280",
        border: "#D1D5DB",
        lighter: "#F9FAFB",
        white: "#FFFFFF",
      };

      const logoPath = path.join(__dirname, "..", "assets", "logo.png");

      const customerName =
        typeof quote.customer.name === "string" ? quote.customer.name : "-";
      const customerEmail =
        typeof quote.customer.email === "string" ? quote.customer.email : "-";
      const customerPhone =
        typeof quote.customer.phone === "string" ? quote.customer.phone : "-";
      const customerNotes =
        typeof quote.customer.notes === "string" ? quote.customer.notes : "-";

      const quoteNumber = `AF-${String(timestamp).slice(-6)}`;
      const issueDate = new Date().toLocaleDateString("es-CL");

      doc.save();
      doc.rect(0, 0, pageWidth, 95).fill(colors.primary);

      try {
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, margin, 18, {
            fit: [100, 58],
            align: "left",
            valign: "center",
          });
        } else {
          doc.fillColor(colors.white).font("Helvetica-Bold").fontSize(26).text("AF", margin, 30);
        }
      } catch {
        doc.fillColor(colors.white).font("Helvetica-Bold").fontSize(26).text("AF", margin, 30);
      }

      doc
        .fillColor(colors.white)
        .font("Helvetica-Bold")
        .fontSize(24)
        .text("Cotización", pageWidth - 220, 26, {
          width: 180,
          align: "right",
        });

      doc
        .font("Helvetica")
        .fontSize(10)
        .text("Automatiza Fácil", pageWidth - 220, 56, {
          width: 180,
          align: "right",
        });

      doc.restore();

      let y = 118;

      doc.roundedRect(margin, y, contentWidth, 96, 10).fillAndStroke(colors.white, colors.border);

      doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(12).text("De", margin + 18, y + 16);

      doc.font("Helvetica-Bold").fontSize(15).text("Automatiza Fácil", margin + 18, y + 34);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(colors.muted)
        .text("Automatización de procesos y soluciones digitales", margin + 18, y + 54)
        .text("Santiago, Chile", margin + 18, y + 69);

      const rightX = margin + contentWidth - 180;

      doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(12).text("Detalle", rightX, y + 16, {
        width: 160,
        align: "right",
      });

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(colors.muted)
        .text(`N° cotización: ${quoteNumber}`, rightX, y + 36, { width: 160, align: "right" })
        .text(`Fecha: ${issueDate}`, rightX, y + 52, { width: 160, align: "right" })
        .text(`Referencia: ${record.token}`, rightX, y + 68, { width: 160, align: "right" });

      y += 116;

      doc.roundedRect(margin, y, contentWidth, 96, 10).fillAndStroke(colors.lighter, colors.border);

      doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(12).text("Cliente", margin + 18, y + 16);

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(colors.text)
        .text(`Nombre: ${customerName}`, margin + 18, y + 38)
        .text(`Correo: ${customerEmail}`, margin + 18, y + 54)
        .text(`Teléfono: ${customerPhone}`, margin + 18, y + 70);

      y += 116;

      doc.fillColor(colors.primaryDark).roundedRect(margin, y, contentWidth, 28, 6).fill();

      const col1 = margin + 10;
      const col2 = margin + 300;
      const col3 = margin + 388;
      const col4 = margin + 470;

      doc
        .fillColor(colors.white)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Descripción", col1, y + 9)
        .text("Cantidad", col2, y + 9, { width: 60, align: "center" })
        .text("Precio", col3, y + 9, { width: 70, align: "right" })
        .text("Subtotal", col4, y + 9, { width: 80, align: "right" });

      y += 28;

      if (quote.lines.length === 0) {
        doc.rect(margin, y, contentWidth, 38).fill(colors.white);
        doc.fillColor(colors.muted).font("Helvetica").fontSize(10).text("No se seleccionaron productos.", margin + 12, y + 12);
        y += 38;
      } else {
        quote.lines.forEach((line, index) => {
          const rowHeight = line.description ? 56 : 38;
          const fillColor = index % 2 === 0 ? colors.white : colors.lighter;

          if (y + rowHeight > pageHeight - 190) {
            doc.addPage();
            y = 50;
          }

          doc.rect(margin, y, contentWidth, rowHeight).fill(fillColor);

          doc
            .strokeColor(colors.border)
            .lineWidth(0.6)
            .moveTo(margin, y + rowHeight)
            .lineTo(margin + contentWidth, y + rowHeight)
            .stroke();

          doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(10).text(line.name, col1, y + 8, {
            width: 270,
          });

          if (line.description) {
            doc.fillColor(colors.muted).font("Helvetica").fontSize(8.5).text(line.description, col1, y + 24, {
              width: 270,
            });
          }

          doc
            .fillColor(colors.text)
            .font("Helvetica")
            .fontSize(10)
            .text(String(line.quantity), col2, y + 14, { width: 60, align: "center" })
            .text(formatCurrencyCLP(line.unitPrice), col3, y + 14, { width: 70, align: "right" })
            .text(formatCurrencyCLP(line.subtotal), col4, y + 14, { width: 80, align: "right" });

          y += rowHeight;
        });
      }

      y += 18;

      if (y + 150 > pageHeight - 40) {
        doc.addPage();
        y = 50;
      }

      const notesBoxWidth = 320;
      const totalsBoxWidth = contentWidth - notesBoxWidth - 20;
      const leftBoxX = margin;
      const rightBoxX = margin + notesBoxWidth + 20;
      const boxHeight = 122;

      doc.roundedRect(leftBoxX, y, notesBoxWidth, boxHeight, 10).fillAndStroke(colors.white, colors.border);

      doc.fillColor(colors.text).font("Helvetica-Bold").fontSize(11).text("Notas", leftBoxX + 14, y + 14);

      doc
        .fillColor(colors.muted)
        .font("Helvetica")
        .fontSize(9.5)
        .text(
          customerNotes && customerNotes !== "-"
            ? customerNotes
            : "Gracias por cotizar con Automatiza Fácil. Esta propuesta puede ajustarse según tus necesidades.",
          leftBoxX + 14,
          y + 34,
          {
            width: notesBoxWidth - 28,
            height: 74,
          }
        );

      doc.roundedRect(rightBoxX, y, totalsBoxWidth, boxHeight, 10).fillAndStroke(colors.lighter, colors.border);

      const labelX = rightBoxX + 14;
      const valueX = rightBoxX + totalsBoxWidth - 110;

      doc
        .fillColor(colors.text)
        .font("Helvetica")
        .fontSize(10)
        .text("Subtotal", labelX, y + 20)
        .text(formatCurrencyCLP(quote.total), valueX, y + 20, { width: 96, align: "right" });

      doc.text("Descuento", labelX, y + 44).text(formatCurrencyCLP(0), valueX, y + 44, {
        width: 96,
        align: "right",
      });

      doc
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Total", labelX, y + 76)
        .font("Helvetica-Bold")
        .fontSize(15)
        .text(formatCurrencyCLP(quote.total), valueX - 4, y + 72, {
          width: 100,
          align: "right",
        });

      y += boxHeight + 28;

      doc.strokeColor(colors.border).lineWidth(1).moveTo(margin, y).lineTo(margin + contentWidth, y).stroke();

      doc
        .fillColor(colors.muted)
        .font("Helvetica")
        .fontSize(9)
        .text(
          "Automatiza Fácil · Santiago, Chile · Documento generado automáticamente",
          margin,
          y + 10,
          {
            width: contentWidth,
            align: "center",
          }
        );

      doc.end();

      stream.on("finish", () => resolve({ fileName, filePath }));
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}