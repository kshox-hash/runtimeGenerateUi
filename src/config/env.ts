require("dotenv").config();

export const PORT = Number(process.env.PORT) || 3000;
export const BASE_URL = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;

export const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
export const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";