import nodemailer from "nodemailer";

import {
  renderBookingPaidEmailTemplate,
} from "../templates/renderBookingPaidEmailTemplate";

type SendBookingPaidEmailInput = {
  to: string;
  customerName: string;
  businessName: string;
  bookingDate: string;
  bookingTime: string;
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

export async function sendBookingPaidEmail(
  input: SendBookingPaidEmailInput
): Promise<void> {
  const html = renderBookingPaidEmailTemplate({
    customerName: input.customerName,
    businessName: input.businessName,
    bookingDate: input.bookingDate,
    bookingTime: input.bookingTime,
  });

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Automatiza Fácil" <${process.env.SMTP_FROM_EMAIL}>`,
    to: input.to,
    subject: "Tu reserva está confirmada",
    html,
  });
}