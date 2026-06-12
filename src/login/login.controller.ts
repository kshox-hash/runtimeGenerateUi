import { Request, Response } from "express";
import { loginUser } from "./login.service";

import passport from "passport";

export function googleStartController(req: Request, res: Response, next: any) {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
}

export async function googleCallbackController(req: Request, res: Response) {
  const authUser = req.user as any;

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

    return res.status(401).json({
      ok: false,
      message: error.message,
    });
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

    return res.status(401).json({
      ok: false,
      message: error.message,
    });
  }
}