import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type AuthUser = {
  userId: string;
  email: string;
};

declare global {
  namespace Express {
    interface User {
      userId?: string;
      email?: string;

      token?: string;
      user?: {
        id: string;
        email: string;
        name?: string;
        picture?: string;
      };
    }
  }
}

import { JWT_SECRET } from "../config/env";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({ error: "Token requerido" });
    }

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Formato de token inválido" });
    }

    const token = authorization.replace("Bearer ", "").trim();

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    return next();
  } catch {
    return res.status(401).json({
      error: "Token inválido o expirado",
    });
  }
}

export {};