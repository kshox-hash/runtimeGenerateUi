"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalSessionMiddleware = portalSessionMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function portalSessionMiddleware(req, res, next) {
    if (!process.env.GOOGLE_CLIENT_ID) {
        next();
        return;
    }
    // auth endpoint itself no requiere token
    if (/^\/[^/]+\/auth$/.test(req.path) && req.method === "POST") {
        next();
        return;
    }
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
        res.status(401).json({ ok: false, message: "No autenticado." });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(auth.slice(7), process.env.JWT_SECRET, { issuer: "portal" });
        req.portalUser = payload;
        next();
    }
    catch {
        res.status(401).json({ ok: false, message: "Sesión expirada. Iniciá sesión nuevamente." });
    }
}
