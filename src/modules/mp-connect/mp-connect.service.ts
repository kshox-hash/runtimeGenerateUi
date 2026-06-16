import crypto from "crypto";

const MP_AUTH_URL = "https://auth.mercadopago.com/authorization";
const MP_TOKEN_URL = "https://api.mercadopago.com/oauth/token";

// Estado temporal en memoria (válido 10 min) para el flujo OAuth
const pendingStates = new Map<string, { userId: string; expiresAt: number }>();

export function generateMpAuthUrl(userId: string): string {
  const appId      = process.env.MP_APP_ID ?? "";
  const redirectUri = process.env.MP_REDIRECT_URI ?? "";

  if (!appId || !redirectUri) {
    throw new Error("MP_APP_ID y MP_REDIRECT_URI son requeridos");
  }

  const state = crypto.randomBytes(20).toString("hex");
  pendingStates.set(state, { userId, expiresAt: Date.now() + 10 * 60 * 1000 });

  const params = new URLSearchParams({
    client_id:     appId,
    response_type: "code",
    platform_id:   "mp",
    redirect_uri:  redirectUri,
    state,
  });

  const url = `${MP_AUTH_URL}?${params.toString()}`;
  console.log("[mp-connect] OAuth URL generada:", url);
  return url;
}

export function consumeState(state: string): string | null {
  const entry = pendingStates.get(state);
  pendingStates.delete(state);
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.userId;
}

export type MpTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
  public_key?: string;
};

export async function exchangeCodeForTokens(code: string): Promise<MpTokenResponse> {
  const appId       = process.env.MP_APP_ID ?? "";
  const appSecret   = process.env.MP_APP_SECRET ?? "";
  const redirectUri = process.env.MP_REDIRECT_URI ?? "";

  const response = await fetch(MP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      client_id:     appId,
      client_secret: appSecret,
      code,
      grant_type:    "authorization_code",
      redirect_uri:  redirectUri,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MP OAuth token error ${response.status}: ${body}`);
  }

  return response.json() as Promise<MpTokenResponse>;
}

export async function refreshMpToken(refreshToken: string): Promise<MpTokenResponse> {
  const appId     = process.env.MP_APP_ID ?? "";
  const appSecret = process.env.MP_APP_SECRET ?? "";

  const response = await fetch(MP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      client_id:     appId,
      client_secret: appSecret,
      grant_type:    "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MP OAuth refresh error ${response.status}: ${body}`);
  }

  return response.json() as Promise<MpTokenResponse>;
}
