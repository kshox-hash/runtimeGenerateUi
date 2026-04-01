const axios = require("axios");
import { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID } from "../config/env";

export async function sendWhatsAppTextMessage(
  recipientPhone: string,
  messageText: string
) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn("Faltan variables de WhatsApp para enviar mensaje.");
    return;
  }

  if (WHATSAPP_PHONE_NUMBER_ID === "WHATSAPP_PHONE_NUMBER_ID") {
    console.warn("WHATSAPP_PHONE_NUMBER_ID inválido.");
    return;
  }

  await axios.post(
    `https://graph.facebook.com/v23.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: recipientPhone,
      type: "text",
      text: {
        preview_url: true,
        body: messageText,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}