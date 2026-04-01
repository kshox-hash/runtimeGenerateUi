import { RuntimeLinkRecord, ViewConfig } from "../types/runtime";
import { generateToken, isExpired } from "../utils/token";

export const runtimeLinks = new Map<string, RuntimeLinkRecord>();

export function createRuntimeRecord(
  config: ViewConfig,
  expiresInMinutes = 15
): RuntimeLinkRecord {
  const token = generateToken();
  const now = Date.now();

  const record: RuntimeLinkRecord = {
    token,
    config,
    createdAt: now,
    expiresAt: now + expiresInMinutes * 60 * 1000,
    status: "active",
    submissions: [],
  };

  runtimeLinks.set(token, record);
  return record;
}

export function getRecordOrNull(token: string): RuntimeLinkRecord | null {
  const record = runtimeLinks.get(token);
  if (!record) return null;

  if (isExpired(record)) {
    record.status = "expired";
    return record;
  }

  return record;
}

export function cleanupRuntimeLinks() {
  for (const [token, record] of runtimeLinks.entries()) {
    const expiredLongAgo = Date.now() > record.expiresAt + 1000 * 60 * 30;
    if (expiredLongAgo) {
      runtimeLinks.delete(token);
    }
  }
}