require("dotenv").config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`[startup] Variable de entorno requerida no definida: ${name}`);
  return value;
}

export const PORT            = Number(process.env.PORT) || 3000;
export const BASE_URL        = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
export const JWT_SECRET      = requireEnv("JWT_SECRET");

// CORS: lista de orígenes permitidos separados por coma
// Ej: CORS_ORIGIN=https://app.tudominio.com,https://admin.tudominio.com
export const CORS_ORIGINS: string[] = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const WHATSAPP_ACCESS_TOKEN    = process.env.WHATSAPP_ACCESS_TOKEN    || "";
export const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";

// Variables de base de datos — validadas aquí para fallar rápido al arrancar
export const PGHOST     = requireEnv("PGHOST");
export const PGUSER     = requireEnv("PGUSER");
export const PGPASSWORD = requireEnv("PGPASSWORD");
export const PGDATABASE = requireEnv("PGDATABASE");
export const PGPORT     = Number(process.env.PGPORT) || 5432;
