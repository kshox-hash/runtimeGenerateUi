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

      // PDF más angosto para que se vea mejor en celular
      const doc = new PDFDocument({
        margin: 20,
        size: [420, 900],
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const margin = 20;
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

      const drawHeader = () => {
        doc.save();
        doc.rect(0, 0, pageWidth, 88).fill(colors.primary);

        try {
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, margin, 18, {
              fit: [80, 44],
              align: "left",
              valign: "center",
            });
          } else {
            doc
              .fillColor(colors.white)
              .font("Helvetica-Bold")
              .fontSize(22)
              .text("AF", margin, 28);
          }
        } catch {
          doc
            .fillColor(colors.white)
            .font("Helvetica-Bold")
            .fontSize(22)
            .text("AF", margin, 28);
        }

        doc
          .fillColor(colors.white)
          .font("Helvetica-Bold")
          .fontSize(20)
          .text("Cotización", pageWidth - 150, 24, {
            width: 130,
            align: "right",
          });

        doc
          .font("Helvetica")
          .fontSize(9)
          .text("Automatiza Fácil", pageWidth - 150, 50, {
            width: 130,
            align: "right",
          });

        doc.restore();
      };

      const drawTableHeader = (startY: number) => {
        doc.fillColor(colors.primaryDark).roundedRect(margin, startY, contentWidth, 26, 6).fill();

        const descWidth = contentWidth * 0.48;
        const qtyWidth = contentWidth * 0.14;
        const priceWidth = contentWidth * 0.18;
        const subtotalWidth = contentWidth * 0.20;

        const col1 = margin + 10;
        const col2 = col1 + descWidth;
        const col3 = col2 + qtyWidth;
        const col4 = col3 + priceWidth;

        doc
          .fillColor(colors.white)
          .font("Helvetica-Bold")
          .fontSize(8.5)
          .text("Descripción", col1, startY + 8, { width: descWidth - 8 })
          .text("Cant.", col2, startY + 8, { width: qtyWidth, align: "center" })
          .text("Precio", col3, startY + 8, { width: priceWidth - 4, align: "right" })
          .text("Subtotal", col4, startY + 8, { width: subtotalWidth - 10, align: "right" });

        return {
          nextY: startY + 26,
          col1,
          col2,
          col3,
          col4,
          descWidth,
          qtyWidth,
          priceWidth,
          subtotalWidth,
        };
      };

      drawHeader();

      let y = 104;

      // Caja emisor / detalle
      doc.roundedRect(margin, y, contentWidth, 92, 10).fillAndStroke(colors.white, colors.border);

      doc
        .fillColor(colors.text)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("De", margin + 14, y + 14);

      doc
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("Automatiza Fácil", margin + 14, y + 30);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(colors.muted)
        .text("Automatización de procesos y soluciones digitales", margin + 14, y + 48, {
          width: 180,
        })
        .text("Santiago, Chile", margin + 14, y + 68);

      const rightX = margin + contentWidth - 150;

      doc
        .fillColor(colors.text)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Detalle", rightX, y + 14, {
          width: 136,
          align: "right",
        });

      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(colors.muted)
        .text(`N° cotización: ${quoteNumber}`, rightX, y + 34, {
          width: 136,
          align: "right",
        })
        .text(`Fecha: ${issueDate}`, rightX, y + 48, {
          width: 136,
          align: "right",
        })
        .text(`Referencia: ${record.token}`, rightX, y + 62, {
          width: 136,
          align: "right",
        });

      y += 108;

      // Caja cliente
      doc.roundedRect(margin, y, contentWidth, 92, 10).fillAndStroke(colors.lighter, colors.border);

      doc
        .fillColor(colors.text)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Cliente", margin + 14, y + 14);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor(colors.text)
        .text(`Nombre: ${customerName}`, margin + 14, y + 34, { width: contentWidth - 28 })
        .text(`Correo: ${customerEmail}`, margin + 14, y + 50, { width: contentWidth - 28 })
        .text(`Teléfono: ${customerPhone}`, margin + 14, y + 66, { width: contentWidth - 28 });

      y += 108;

      // Tabla
      let table = drawTableHeader(y);
      y = table.nextY;

      if (quote.lines.length === 0) {
        doc.rect(margin, y, contentWidth, 38).fill(colors.white);
        doc
          .fillColor(colors.muted)
          .font("Helvetica")
          .fontSize(9)
          .text("No se seleccionaron productos.", margin + 12, y + 12);

        y += 38;
      } else {
        quote.lines.forEach((line, index) => {
          const rowHeight = line.description ? 54 : 34;
          const fillColor = index % 2 === 0 ? colors.white : colors.lighter;

          if (y + rowHeight > pageHeight - 170) {
            doc.addPage();
            drawHeader();
            y = 40;

            table = drawTableHeader(y);
            y = table.nextY;
          }

          doc.rect(margin, y, contentWidth, rowHeight).fill(fillColor);

          doc
            .strokeColor(colors.border)
            .lineWidth(0.6)
            .moveTo(margin, y + rowHeight)
            .lineTo(margin + contentWidth, y + rowHeight)
            .stroke();

          doc
            .fillColor(colors.text)
            .font("Helvetica-Bold")
            .fontSize(9)
            .text(line.name, table.col1, y + 8, {
              width: table.descWidth - 8,
            });

          if (line.description) {
            doc
              .fillColor(colors.muted)
              .font("Helvetica")
              .fontSize(7.5)
              .text(line.description, table.col1, y + 22, {
                width: table.descWidth - 8,
              });
          }

          doc
            .fillColor(colors.text)
            .font("Helvetica")
            .fontSize(8.5)
            .text(String(line.quantity), table.col2, y + 14, {
              width: table.qtyWidth,
              align: "center",
            })
            .text(formatCurrencyCLP(line.unitPrice), table.col3, y + 14, {
              width: table.priceWidth - 4,
              align: "right",
            })
            .text(formatCurrencyCLP(line.subtotal), table.col4, y + 14, {
              width: table.subtotalWidth - 10,
              align: "right",
            });

          y += rowHeight;
        });
      }

      y += 16;

      const notesBoxHeight = 110;
      const totalsBoxHeight = 110;

      if (y + notesBoxHeight + totalsBoxHeight + 40 > pageHeight - 20) {
        doc.addPage();
        drawHeader();
        y = 40;
      }

      // Notas
      doc.roundedRect(margin, y, contentWidth, notesBoxHeight, 10).fillAndStroke(colors.white, colors.border);

      doc
        .fillColor(colors.text)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Notas", margin + 14, y + 12);

      doc
        .fillColor(colors.muted)
        .font("Helvetica")
        .fontSize(8.5)
        .text(
          customerNotes !== "-"
            ? customerNotes
            : "Gracias por cotizar con Automatiza Fácil. Esta propuesta puede ajustarse según tus necesidades.",
          margin + 14,
          y + 30,
          {
            width: contentWidth - 28,
            height: 68,
          }
        );

      y += notesBoxHeight + 14;

      // Totales
      doc.roundedRect(margin, y, contentWidth, totalsBoxHeight, 10).fillAndStroke(colors.lighter, colors.border);

      const labelX = margin + 14;
      const valueWidth = 120;
      const valueX = margin + contentWidth - valueWidth - 14;

      doc
        .fillColor(colors.text)
        .font("Helvetica")
        .fontSize(9.5)
        .text("Subtotal", labelX, y + 18)
        .text(formatCurrencyCLP(quote.total), valueX, y + 18, {
          width: valueWidth,
          align: "right",
        });

      doc
        .text("Descuento", labelX, y + 40)
        .text(formatCurrencyCLP(0), valueX, y + 40, {
          width: valueWidth,
          align: "right",
        });

      doc
        .font("Helvetica-Bold")
        .fontSize(10.5)
        .text("Total", labelX, y + 70)
        .font("Helvetica-Bold")
        .fontSize(16)
        .text(formatCurrencyCLP(quote.total), valueX - 4, y + 64, {
          width: valueWidth + 4,
          align: "right",
        });

      y += totalsBoxHeight + 22;

      // Footer
      doc
        .strokeColor(colors.border)
        .lineWidth(1)
        .moveTo(margin, y)
        .lineTo(margin + contentWidth, y)
        .stroke();

      doc
        .fillColor(colors.muted)
        .font("Helvetica")
        .fontSize(8)
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