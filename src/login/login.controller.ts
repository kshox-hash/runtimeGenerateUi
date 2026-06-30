import { Request, Response } from "express";
import { loginUser } from "./login.service";

const KNOWN_AUTH_MSGS = new Set([
  "Usuario no existe",
  "Credenciales inválidas",
  "Token de Google inválido",
  "Google no devolvió correo",
]);
import jwt from "jsonwebtoken";
import passport from "passport";

export function googleStartController(req: Request, res: Response, next: any) {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
}

export async function googleCallbackController(req: Request, res: Response) {
  const authUser = req.user as any;

  // flujo portal
  if (authUser?.__type === "portal") {
    const token = jwt.sign(
      { email: authUser.email, name: authUser.name ?? "", picture: authUser.picture ?? "", slug: authUser.slug },
      process.env.JWT_SECRET!,
      { expiresIn: "7d", issuer: "portal" },
    );
    res.cookie("portal_session", token, {
      httpOnly: true,
      secure:   true,
      sameSite: "lax",
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect("/shop/" + encodeURIComponent(authUser.slug));
  }

  // flujo app (dueño del negocio)
  if (!authUser?.token || !authUser?.user) {
    return res.status(401).send("No se pudo iniciar sesión");
  }

  const deeplinkBase = process.env.APP_DEEPLINK_URL || "automatiza://auth";
  const redirectUrl =
    `${deeplinkBase}` +
    `?token=${encodeURIComponent(authUser.token)}` +
    `&userId=${encodeURIComponent(authUser.user.id)}` +
    `&email=${encodeURIComponent(authUser.user.email)}` +
    `&name=${encodeURIComponent(authUser.user.name ?? "")}` +
    `&picture=${encodeURIComponent(authUser.user.picture ?? "")}`;
  return res.redirect(redirectUrl);
}


export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        ok: false,
        message: "Correo y contraseña son obligatorios",
      });
    }

    const result = await loginUser(email, password);

    return res.status(200).json({
      ok: true,
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    console.error("LOGIN ERROR:", error.message);
    const msg = KNOWN_AUTH_MSGS.has(error?.message) ? error.message : "Error de autenticación.";
    return res.status(401).json({ ok: false, message: msg });
  }
}



import { loginWithGoogle } from "./login.service";

export async function googleLoginController(req: Request, res: Response) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        ok: false,
        message: "Token de Google obligatorio",
      });
    }

    const result = await loginWithGoogle(idToken);

    return res.status(200).json({
      ok: true,
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    console.error("GOOGLE LOGIN ERROR:", error.message);
    const msg = KNOWN_AUTH_MSGS.has(error?.message) ? error.message : "Error de autenticación.";
    return res.status(401).json({ ok: false, message: msg });
  }
}