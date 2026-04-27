import { Request, Response } from "express";
import { loginUser } from "../services/login.service";

export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    console.log("BODY:", req.body);

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