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
        primary: "#EEF4FF",
        primaryDark: "#366AFF",
        text: "#111827",
        muted: "#6B7280",
        border: "#D1D5DB",
        lighter: "#F9FAFB",
        white: "#FFFFFF",
      };

      const brandName =
        typeof record.config.brand === "string" && record.config.brand.trim()
          ? record.config.brand
          : "Automatiza Fácil";

      const docTitle =
        typeof record.config.title === "string" && record.config.title.trim()
          ? record.config.title
          : "Cotización";

      const brandSubtitle =
        typeof record.config.subtitle === "string" && record.config.subtitle.trim()
          ? record.config.subtitle
          : "Automatización de procesos y soluciones digitales";

      const footerLine = `${brandName} · Documento generado automáticamente`;

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

      function drawHeader() {
        doc.save();
        doc.rect(0, 0, pageWidth, 92).fill(colors.primary);

        const avatarSize = 48;
        const avatarX = margin;
        const avatarY = 22;
        const avatarCenterX = avatarX + avatarSize / 2;
        const avatarCenterY = avatarY + avatarSize / 2;
        const avatarRadius = avatarSize / 2;

        try {
          if (fs.existsSync(logoPath)) {
            doc.save();
            doc.circle(avatarCenterX, avatarCenterY, avatarRadius).clip();
            doc.image(logoPath, avatarX, avatarY, {
              fit: [avatarSize, avatarSize],
              align: "center",
              valign: "center",
            });
            doc.restore();
          } else {
            doc
              .fillColor(colors.white)
              .circle(avatarCenterX, avatarCenterY, avatarRadius)
              .fill();

            doc
              .fillColor(colors.primaryDark)
              .font("Helvetica-Bold")
              .fontSize(18)
              .text("AF", avatarX, avatarY + 14, {
                width: avatarSize,
                align: "center",
              });
          }
        } catch {
          doc
            .fillColor(colors.white)
            .circle(avatarCenterX, avatarCenterY, avatarRadius)
            .fill();

          doc
            .fillColor(colors.primaryDark)
            .font("Helvetica-Bold")
            .fontSize(18)
            .text("AF", avatarX, avatarY + 14, {
              width: avatarSize,
              align: "center",
            });
        }

        doc
          .fillColor(colors.text)
          .font("Helvetica-Bold")
          .fontSize(22)
          .text(docTitle, pageWidth - 160, 24, {
            width: 138,
            align: "right",
          });

        doc
          .font("Helvetica")
          .fontSize(10)
          .fillColor(colors.text)
          .text(brandName, pageWidth - 160, 54, {
            width: 138,
            align: "right",
          });

        doc.restore();
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
          .text(brandName, margin + 16, startY + 36);

        doc
          .fillColor(colors.muted)
          .font("Helvetica")
          .fontSize(10)
          .text(brandSubtitle, margin + 16, startY + 58, {
            width: 190,
          })
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
          .text(`Nombre: ${customerName}`, margin + 16, startY + 42, {
            width: contentWidth - 32,
          })
          .text(`Correo: ${customerEmail}`, margin + 16, startY + 62, {
            width: contentWidth - 32,
          })
          .text(`Teléfono: ${customerPhone}`, margin + 16, startY + 82, {
            width: contentWidth - 32,
          });

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
          .text("Descripción", col1, startY + 9, { width: descWidth - 6 })
          .text("Cant.", col2, startY + 9, { width: qtyWidth, align: "center" })
          .text("Precio", col3, startY + 9, {
            width: priceWidth - 6,
            align: "right",
          })
          .text("Subtotal", col4, startY + 9, {
            width: subtotalWidth - 6,
            align: "right",
          });

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

      function ensureSpace(
        currentY: number,
        neededHeight: number,
        drawTableOnNewPage = false
      ) {
        if (currentY + neededHeight <= pageHeight - 30) {
          return { y: currentY, newPage: false };
        }

        doc.addPage();
        drawHeader();

        let newY = 34;

        if (drawTableOnNewPage) {
          const table = drawTableHeader(newY);
          return { y: table.nextY, newPage: true, table };
        }

        return { y: newY, newPage: true };
      }

      drawHeader();

      let y = 110;

      y = drawIssuerAndDetail(y);
      y = drawCustomerBox(y);

      let table = drawTableHeader(y);
      y = table.nextY;

      if (quote.lines.length === 0) {
        doc.rect(margin, y, contentWidth, 42).fill(colors.white);
        doc
          .fillColor(colors.muted)
          .font("Helvetica")
          .fontSize(10)
          .text("No se seleccionaron productos.", margin + 12, y + 14);
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
            .strokeColor(colors.border)
            .lineWidth(0.6)
            .moveTo(margin, y + rowHeight)
            .lineTo(margin + contentWidth, y + rowHeight)
            .stroke();

          doc
            .fillColor(colors.text)
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(line.name, table.col1, y + 10, {
              width: table.descWidth - 10,
            });

          if (line.description) {
            doc
              .fillColor(colors.muted)
              .font("Helvetica")
              .fontSize(8.5)
              .text(line.description, table.col1, y + 28, {
                width: table.descWidth - 10,
              });
          }

          doc
            .fillColor(colors.text)
            .font("Helvetica")
            .fontSize(9.5)
            .text(String(line.quantity), table.col2, y + 18, {
              width: table.qtyWidth,
              align: "center",
            })
            .text(formatCurrencyCLP(line.unitPrice), table.col3, y + 18, {
              width: table.priceWidth - 4,
              align: "right",
            })
            .text(formatCurrencyCLP(line.subtotal), table.col4, y + 18, {
              width: table.subtotalWidth - 6,
              align: "right",
            });

          y += rowHeight;
        });
      }

      y += 18;

      const notesHeight = 120;
      const totalsHeight = 120;
      const footerHeight = 34;

      const blockSpace = ensureSpace(
        y,
        notesHeight + totalsHeight + footerHeight + 30
      );
      y = blockSpace.y;

      doc
        .roundedRect(margin, y, contentWidth, notesHeight, 12)
        .fillAndStroke(colors.white, colors.border);

      doc
        .fillColor(colors.text)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text("Notas", margin + 16, y + 14);

      doc
        .fillColor(colors.muted)
        .font("Helvetica")
        .fontSize(9.5)
        .text(
          customerNotes !== "-"
            ? customerNotes
            : "Gracias por cotizar con nosotros. Esta propuesta puede ajustarse según tus necesidades.",
          margin + 16,
          y + 38,
          {
            width: contentWidth - 32,
            height: notesHeight - 48,
          }
        );

      y += notesHeight + 16;

      doc
        .roundedRect(margin, y, contentWidth, totalsHeight, 12)
        .fillAndStroke(colors.lighter, colors.border);

      const labelX = margin + 16;
      const valueWidth = 100;
      const valueX = margin + contentWidth - valueWidth - 16;

      doc
        .fillColor(colors.text)
        .font("Helvetica")
        .fontSize(10)
        .text("Subtotal", labelX, y + 18)
        .text(formatCurrencyCLP(quote.total), valueX, y + 18, {
          width: valueWidth,
          align: "right",
        });

      doc.text("Descuento", labelX, y + 40).text("$0", valueX, y + 40, {
        width: valueWidth,
        align: "right",
      });

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Total", labelX, y + 72)
        .fontSize(13)
        .text(formatCurrencyCLP(quote.total), valueX, y + 70, {
          width: valueWidth,
          align: "right",
        });

      y += totalsHeight + 24;

      doc
        .strokeColor(colors.border)
        .lineWidth(1)
        .moveTo(margin, y)
        .lineTo(margin + contentWidth, y)
        .stroke();

      doc
        .fillColor(colors.muted)
        .font("Helvetica")
        .fontSize(8.5)
        .text(footerLine, margin, y + 10, {
          width: contentWidth,
          align: "center",
        });

      doc.end();

      stream.on("finish", () => resolve({ fileName, filePath }));
      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}