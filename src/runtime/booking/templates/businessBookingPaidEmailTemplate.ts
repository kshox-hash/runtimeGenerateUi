export type BusinessBookingPaidEmailTemplateInput = {
  businessName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  bookingTime: string;
  amount: number;
};

export function renderBusinessBookingPaidEmailTemplate(
  input: BusinessBookingPaidEmailTemplateInput
): string {
  return `
<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#0f1011;font-family:Arial,sans-serif;color:#f3f4f6;">
  <div style="max-width:560px;margin:0 auto;padding:32px 18px;">
    <div style="background:#16191f;border-radius:24px;padding:32px;border:1px solid rgba(255,255,255,.08);">
      <h1 style="margin:0 0 14px;font-size:28px;line-height:1.1;color:#f3f4f6;">
        Nueva reserva confirmada
      </h1>

      <p style="margin:0;font-size:15px;line-height:1.7;color:#b8bdc7;">
        ${input.businessName}, tienes una nueva reserva pagada.
      </p>

      <div style="margin-top:24px;padding:18px;border-radius:18px;background:#1b1f25;">
        <div style="color:#63acf1;font-weight:700;font-size:15px;">
          ${input.bookingDate} · ${input.bookingTime} hrs
        </div>

        <div style="margin-top:12px;color:#f3f4f6;font-size:14px;">
          Cliente: ${input.customerName}
        </div>

        <div style="margin-top:6px;color:#b8bdc7;font-size:14px;">
          Correo: ${input.customerEmail}
        </div>

        <div style="margin-top:6px;color:#b8bdc7;font-size:14px;">
          Teléfono: ${input.customerPhone}
        </div>

        <div style="margin-top:12px;color:#10b981;font-weight:700;font-size:14px;">
          Pagado: $${input.amount.toLocaleString("es-CL")}
        </div>
      </div>

      <div style="margin-top:24px;font-size:13px;color:#8b929f;">
        Automatiza Fácil
      </div>
    </div>
  </div>
</body>
</html>
`;
}