export type BookingPaidEmailTemplateInput = {
  customerName: string;
  businessName: string;
  bookingDate: string;
  bookingTime: string;
};

export function renderBookingPaidEmailTemplate(
  input: BookingPaidEmailTemplateInput
): string {
  return `
<!doctype html>
<html lang="es">
<body style="margin:0;padding:0;background:#0f1011;font-family:Arial,sans-serif;color:#f3f4f6;">
  <div style="max-width:560px;margin:0 auto;padding:32px 18px;">
    <div style="background:#16191f;border-radius:24px;padding:32px;border:1px solid rgba(255,255,255,.08);">
      <h1 style="margin:0 0 14px;font-size:28px;line-height:1.1;color:#f3f4f6;">
        Tu reserva está confirmada
      </h1>

      <p style="margin:0;font-size:15px;line-height:1.7;color:#b8bdc7;">
        Hola ${input.customerName}, tu pago fue recibido correctamente y tu reserva quedó confirmada.
      </p>

      <div style="margin-top:24px;padding:18px;border-radius:18px;background:#1b1f25;">
        <div style="color:#63acf1;font-weight:700;font-size:15px;">
          ${input.businessName}
        </div>
        <div style="margin-top:8px;color:#f3f4f6;font-size:14px;">
          ${input.bookingDate} · ${input.bookingTime} hrs
        </div>
      </div>

      <p style="margin-top:24px;font-size:14px;line-height:1.6;color:#b8bdc7;">
        Te esperamos. Guarda este correo como respaldo de tu reserva.
      </p>

      <div style="margin-top:24px;font-size:13px;color:#8b929f;">
        Automatiza Fácil
      </div>
    </div>
  </div>
</body>
</html>
`;
}