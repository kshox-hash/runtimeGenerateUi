import { Request, Response } from "express";
import { findWhatsAppConfigByUserId } from "../repository/whatsapp_configuration_repository";
import { sendWhatsAppTextMessage } from "../services/whatsapp.service";

export const sendWhatsAppController = async (req: Request, res: Response) => {
  try {
    const { userId, recipientPhone, messageText } = req.body;

    if (!userId || !recipientPhone || !messageText) {
      return res.status(400).json({
        ok: false,
        message: "Faltan datos",
      });
    }

    const config = await findWhatsAppConfigByUserId(userId);

    if (!config) {
      return res.status(404).json({
        ok: false,
        message: "Usuario sin configuración",
      });
    }

    await sendWhatsAppTextMessage(
      recipientPhone,
      messageText,
      config.phone_number_id,
      config.whatsapp_access_token
    );

    return res.json({
      ok: true,
      message: "Mensaje enviado",
    });
  } catch (error: any) {
    console.error("Error:", error?.response?.data || error.message);

    return res.status(500).json({
      ok: false,
      message: "Error interno",
    });
  }
};