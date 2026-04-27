import { Request, Response } from "express";
import { loginUser } from "../services/login.service";

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

    return res.json({
      ok: true,
      token: result.token,
      user: result.user,
    });
  } catch (error: any) {
    return res.status(401).json({
      ok: false,
      message: error.message,
    });
  }
}