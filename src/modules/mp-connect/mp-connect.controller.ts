import { Request, Response } from "express";
import { generateMpAuthUrl, consumeState, exchangeCodeForTokens } from "./mp-connect.service";
import { saveMpConnection, getMpConnection, deleteMpConnection } from "./mp-connect.repository";

const APP_DEEPLINK = process.env.APP_DEEPLINK_URL ?? "automatiza://auth";

export const mpConnectController = {

  // GET /api/payments/mp-connect-url  (autenticado — devuelve la URL para abrir en browser)
  async getConnectUrl(req: Request, res: Response): Promise<Response> {
    try {
      const userId = String(req.user?.userId ?? "").trim();
      if (!userId) return res.status(401).json({ ok: false, message: "No autorizado" });

      const url = generateMpAuthUrl(userId);
      return res.json({ ok: true, url });
    } catch (error) {
      return res.status(500).json({
        ok: false,
        message: error instanceof Error ? error.message : "Error generando URL",
      });
    }
  },

  // GET /api/payments/mp-status/:userId  (autenticado)
  async getStatus(req: Request, res: Response): Promise<Response> {
    try {
      const userId = String(req.params["userId"] ?? "").trim();
      const authUserId = String(req.user?.userId ?? "").trim();
      if (userId !== authUserId) return res.status(403).json({ ok: false, message: "Prohibido" });

      const conn = await getMpConnection(userId);
      if (!conn) return res.json({ ok: true, connected: false });
      return res.json({
        ok: true,
        connected: true,
        mpUserId: conn.mp_user_id,
        expiresAt: conn.expires_at,
      });
    } catch {
      return res.status(500).json({ ok: false, message: "Error consultando conexión" });
    }
  },

  // DELETE /api/payments/mp-connection/:userId  (autenticado)
  async disconnect(req: Request, res: Response): Promise<Response> {
    try {
      const userId = String(req.params["userId"] ?? "").trim();
      const authUserId = String(req.user?.userId ?? "").trim();
      if (userId !== authUserId) return res.status(403).json({ ok: false, message: "Prohibido" });

      await deleteMpConnection(userId);
      return res.json({ ok: true, message: "Cuenta desconectada" });
    } catch {
      return res.status(500).json({ ok: false, message: "Error desconectando cuenta" });
    }
  },

  // GET /auth/mp/callback  (sin auth — callback de MercadoPago)
  async callback(req: Request, res: Response): Promise<void> {
    const code  = String(req.query["code"]  ?? "").trim();
    const state = String(req.query["state"] ?? "").trim();
    const error = String(req.query["error"] ?? "").trim();

    if (error || !code || !state) {
      res.redirect(`${APP_DEEPLINK}?mp=error`);
      return;
    }

    const userId = consumeState(state);
    if (!userId) {
      res.status(400).send(_htmlPage("Error de conexión", "El enlace expiró o no es válido. Vuelve a intentarlo desde la app.", false));
      return;
    }

    try {
      const tokens = await exchangeCodeForTokens(code);
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      await saveMpConnection({
        userId,
        accessToken:  tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
        mpUserId:     String(tokens.user_id),
        publicKey:    tokens.public_key ?? null,
        expiresAt,
      });

      res.send(_htmlPage(
        "¡Cuenta conectada!",
        "Tu cuenta de MercadoPago quedó vinculada. Volviendo a la app...",
        true,
        `${APP_DEEPLINK}?mp=connected`,
      ));
    } catch (err) {
      console.error("[mp-connect] Error en callback:", err);
      res.status(500).send(_htmlPage("Error al conectar", "No se pudo vincular la cuenta. Vuelve a intentarlo desde la app.", false));
    }
  },
};

function _htmlPage(title: string, message: string, success: boolean, deeplink?: string): string {
  const iconBg    = success ? "#dcfce7" : "#fee2e2";
  const iconColor = success ? "#16a34a" : "#dc2626";
  const icon      = success ? "✓" : "!";
  const redirectScript = deeplink
    ? `<script>setTimeout(function(){ window.location.href = "${deeplink}"; }, 1800);</script>`
    : "";
  const redirectMeta = deeplink
    ? `<meta http-equiv="refresh" content="2;url=${deeplink}">`
    : "";
  return `<!doctype html><html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
${redirectMeta}
<title>${title}</title></head>
<body style="margin:0;min-height:100vh;background:#f0f4f9;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;padding:24px">
<div style="background:#fff;border-radius:20px;padding:36px 28px;max-width:420px;width:100%;border:1px solid #cdd6e4;text-align:center">
  <div style="width:64px;height:64px;border-radius:18px;background:${iconBg};color:${iconColor};display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:800;margin:0 auto 20px">${icon}</div>
  <h1 style="margin:0 0 10px;font-size:22px;font-weight:800;color:#0a1628">${title}</h1>
  <p style="margin:0 0 24px;font-size:14px;color:#4a6580;line-height:1.6">${message}</p>
  <p style="font-size:13px;color:#8fa8c0">${deeplink ? "Redirigiendo a la app..." : "Puedes cerrar esta ventana y volver a la app."}</p>
</div>
${redirectScript}
</body></html>`;
}
