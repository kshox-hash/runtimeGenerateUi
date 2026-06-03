import nodemailer from "nodemailer";

import { renderBookingPaidEmailTemplate } from "../templates/renderBookingPaidEmailTemplate";

type SendBusinessBookingPaidEmailInput = {
  to: string;
  businessName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookingDate: string;
  bookingTime: string;
  amount: number;
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

export async function sendBusinessBookingPaidEmail(
  input: SendBusinessBookingPaidEmailInput
): Promise<void> {
  const html = renderBookingPaidEmailTemplate(input);

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Automatiza Fácil" <${process.env.SMTP_FROM_EMAIL}>`,
    to: input.to,
    subject: "Nueva reserva confirmada",
    html,
  });
}