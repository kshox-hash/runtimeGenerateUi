import nodemailer from "nodemailer";
import fs from "fs";

type SendQuoteEmailInput = {
  to: string;
  customerName: string;
  brandName: string;
  pdfPath: string;
  pdfFileName: string;
  items: { name: string; quantity: number; unitPrice: number; subtotal: number }[];
  total: number;
};

function createTransporter() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.SMTP_FROM_EMAIL
  ) {
    throw new Error("Faltan variables SMTP");
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function formatCLP(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildQuoteEmailHtml(input: SendQuoteEmailInput): string {
  const rows = input.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#111827;">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#6b7280;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#6b7280;text-align:right;">${formatCLP(item.unitPrice)}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:14px;font-weight:600;color:#111827;text-align:right;">${formatCLP(item.subtotal)}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
        
        <!-- Header -->
        <tr>
          <td style="background:#1e3a5f;padding:28px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">${input.brandName}</p>
            <p style="margin:6px 0 0;font-size:13px;color:#93c5fd;">Tu cotización está lista</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 20px;font-size:15px;color:#374151;">
              Hola <strong>${input.customerName}</strong>, aquí está el resumen de tu cotización. 
              Encontrarás el detalle completo en el PDF adjunto.
            </p>

            <!-- Tabla de productos -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
              <thead>
                <tr style="background:#f3f4f6;">
                  <th style="padding:10px 12px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;text-align:left;">Producto</th>
                  <th style="padding:10px 12px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;text-align:center;">Cant.</th>
                  <th style="padding:10px 12px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;text-align:right;">Precio</th>
                  <th style="padding:10px 12px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>

            <!-- Total -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:0;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 10px 10px;overflow:hidden;">
              <tr style="background:#1e3a5f;">
                <td colspan="3" style="padding:14px 12px;font-size:13px;font-weight:600;color:#ffffff;">Total estimado</td>
                <td style="padding:14px 12px;font-size:16px;font-weight:700;color:#ffffff;text-align:right;">${formatCLP(input.total)}</td>
              </tr>
            </table>

            <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
              Esta cotización es referencial y puede ajustarse según tus necesidades. 
              Nos pondremos en contacto contigo a la brevedad.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #f0f0f0;background:#f9fafb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
              ${input.brandName} · Documento generado automáticamente
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendQuoteEmail(input: SendQuoteEmailInput): Promise<void> {
  const transporter = createTransporter();
  const html = buildQuoteEmailHtml(input);

  await transporter.sendMail({
    from: `"${input.brandName}" <${process.env.SMTP_FROM_EMAIL}>`,
    to: input.to,
    subject: `Tu cotización de ${input.brandName}`,
    html,
    attachments: [
      {
        filename: input.pdfFileName,
        content: fs.readFileSync(input.pdfPath),
        contentType: "application/pdf",
      },
    ],
  });
}