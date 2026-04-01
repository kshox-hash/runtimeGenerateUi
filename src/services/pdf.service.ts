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

      const logoPath = path.join(process.cwd(), "assets", "logo.png");

      const customerName =
        typeof quote.customer.name === "string" && quote.customer.name.trim()
          ? quote.customer.name
          : "-";

      const customerEmail =
        typeof quote.customer.email === "string" && quote.customer.email.trim()
          ? quote.customer.email
          : "-";

      const customerPhone =
        typeof quote.customer.phone === "string" && quote.customer.phone.trim()
          ? quote.customer.phone
          : "-";

      const customerNotes =
        typeof quote.customer.notes === "string" && quote.customer.notes.trim()
          ? quote.customer.notes
          : "-";

      const quoteNumber = `AF-${String(timestamp).slice(-6)}`;
      const issueDate = new Date().toLocaleDateString("es-CL");

      // 🔥 HEADER NUEVO PRO
      function drawHeader() {
        const headerHeight = 92;

        const avatarSize = 42;
        const groupWidth = 260;
        const groupX = (pageWidth - groupWidth) / 2;

        const avatarX = groupX;
        const avatarY = 25;

        const textX = avatarX + avatarSize + 14;
        const textWidth = 200;

        const circleX = avatarX + avatarSize / 2;
        const circleY = avatarY + avatarSize / 2;
        const radius = avatarSize / 2;

        // fondo limpio
        doc.rect(0, 0, pageWidth, headerHeight).fill(colors.white);

        // logo sin borde
        doc.save();
        doc.circle(circleX, circleY, radius).clip();

        try {
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, avatarX, avatarY, {
              fit: [avatarSize, avatarSize],
              align: "center",
              valign: "center",
            });
          } else {
            doc
              .fillColor("#E5E7EB")
              .circle(circleX, circleY, radius)
              .fill();

            doc
              .fillColor(colors.primaryDark)
              .font("Helvetica-Bold")
              .fontSize(16)
              .text("AF", avatarX, avatarY + 11, {
                width: avatarSize,
                align: "center",
              });
          }
        } catch {
          doc
            .fillColor("#E5E7EB")
            .circle(circleX, circleY, radius)
            .fill();

          doc
            .fillColor(colors.primaryDark)
            .font("Helvetica-Bold")
            .fontSize(16)
            .text("AF", avatarX, avatarY + 11, {
              width: avatarSize,
              align: "center",
            });
        }

        doc.restore();

        // texto al lado
        doc
          .fillColor(colors.text)
          .font("Helvetica-Bold")
          .fontSize(24)
          .text("Cotización", textX, 22, {
            width: textWidth,
            align: "left",
          });

        doc
          .fillColor(colors.muted)
          .font("Helvetica")
          .fontSize(10)
          .text("Automatiza Fácil", textX, 54, {
            width: textWidth,
            align: "left",
          });
      }

      function drawIssuerAndDetail(startY: number) {
        doc
          .roundedRect(margin, startY, contentWidth, 104, 12)
          .fillAndStroke(colors.white, colors.border);

        doc
          .fillColor(colors.text)
          .font("Helvetica-Bold")
          .fontSize(12)
          .text("De", margin + 16, startY + 16);

        doc
          .font("Helvetica-Bold")
          .fontSize(16)
          .text("Automatiza Fácil", margin + 16, startY + 36);

        doc
          .fillColor(colors.muted)
          .font("Helvetica")
          .fontSize(10)
          .text(
            "Automatización de procesos y soluciones digitales",
            margin + 16,
            startY + 58,
            { width: 190 }
          )
          .text("Santiago, Chile", margin + 16, startY + 82);

        const rightX = margin + contentWidth - 150;

        doc
          .fillColor(colors.text)
          .font("Helvetica-Bold")
          .fontSize(12)
          .text("Detalle", rightX, startY + 16, {
            width: 134,
            align: "right",
          });

        doc
          .fillColor(colors.muted)
          .font("Helvetica")
          .fontSize(9.5)
          .text(`N° cotización: ${quoteNumber}`, rightX, startY + 42, {
            width: 134,
            align: "right",
          })
          .text(`Fecha: ${issueDate}`, rightX, startY + 60, {
            width: 134,
            align: "right",
          })
          .text(`Referencia: ${record.token}`, rightX, startY + 78, {
            width: 134,
            align: "right",
          });

        return startY + 122;
      }

      function drawCustomerBox(startY: number) {
        doc
          .roundedRect(margin, startY, contentWidth, 108, 12)
          .fillAndStroke(colors.lighter, colors.border);

        doc
          .fillColor(colors.text)
          .font("Helvetica-Bold")
          .fontSize(12)
          .text("Cliente", margin + 16, startY + 16);

        doc
          .font("Helvetica")
          .fontSize(10.5)
          .fillColor(colors.text)
          .text(`Nombre: ${customerName}`, margin + 16, startY + 42)
          .text(`Correo: ${customerEmail}`, margin + 16, startY + 62)
          .text(`Teléfono: ${customerPhone}`, margin + 16, startY + 82);

        return startY + 124;
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
          .text("Descripción", col1, startY + 9)
          .text("Cant.", col2, startY + 9, { align: "center" })
          .text("Precio", col3, startY + 9, { align: "right" })
          .text("Subtotal", col4, startY + 9, { align: "right" });

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

      function ensureSpace(currentY: number, neededHeight: number, drawTableOnNewPage = false) {
        if (currentY + neededHeight <= pageHeight - 30) {
          return { y: currentY, newPage: false };
        }

        doc.addPage();
        drawHeader();

        let newY = 108;

        if (drawTableOnNewPage) {
          const table = drawTableHeader(newY);
          return { y: table.nextY, newPage: true, table };
        }

        return { y: newY, newPage: true };
      }

      drawHeader();

      let y = 108;

      y = drawIssuerAndDetail(y);
      y = drawCustomerBox(y);

      let table = drawTableHeader(y);
      y = table.nextY;

      if (quote.lines.length === 0) {
        doc.rect(margin, y, contentWidth, 42).fill(colors.white);
        doc.text("No se seleccionaron productos.", margin + 12, y + 14);
        y += 42;
      } else {
        quote.lines.forEach((line, index) => {
          const rowHeight = line.description ? 62 : 40;
          const fillColor = index % 2 === 0 ? colors.white : colors.lighter;

          const space = ensureSpace(y, rowHeight + 140, true);
          if (space.newPage && space.table) {
            y = space.y;
            table = space.table;
          }

          doc.rect(margin, y, contentWidth, rowHeight).fill(fillColor);

          doc
            .fillColor(colors.text)
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(line.name, table.col1, y + 10);

          if (line.description) {
            doc
              .fillColor(colors.muted)
              .fontSize(8.5)
              .text(line.description, table.col1, y + 28);
          }

          doc
            .font("Helvetica")
            .fontSize(9.5)
            .text(String(line.quantity), table.col2, y + 18, { align: "center" })
            .text(formatCurrencyCLP(line.unitPrice), table.col3, y + 18, { align: "right" })
            .text(formatCurrencyCLP(line.subtotal), table.col4, y + 18, { align: "right" });

          y += rowHeight;
        });
      }

      doc.end();

      stream.on("finish", () => resolve({ fileName, filePath }));
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}