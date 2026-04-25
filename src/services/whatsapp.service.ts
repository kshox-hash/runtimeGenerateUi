const axios = require("axios");

export async function sendWhatsAppTextMessage(
  recipientPhone: string,
  messageText: string,
  phoneNumberId: string,
  accessToken: string
) {
  if (!accessToken || !phoneNumberId) {
    console.warn("Faltan credenciales de WhatsApp.");
    return;
  }

  if (phoneNumberId === "WHATSAPP_PHONE_NUMBER_ID") {
    console.warn("phoneNumberId inválido.");
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v23.0/${phoneNumberId}/messages`,
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
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Error enviando WhatsApp:", {
      status: error?.response?.status,
      data: error?.response?.data,
    });
  }
}