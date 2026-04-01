import crypto from "crypto";
import { RuntimeLinkRecord } from "../types/runtime";

export function generateToken(): string {
  return crypto.randomBytes(8).toString("hex");
}

export function isExpired(record: RuntimeLinkRecord): boolean {
  return Date.now() > record.expiresAt;
}

export function sanitizeFileName(value: string): string {
  return String(value || "")
    .replace(/[^\w\-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
}