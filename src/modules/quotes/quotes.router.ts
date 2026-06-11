import { Router } from "express";
import { productsController } from "./products/products.controller";
import { authMiddleware } from "../../middlewares/auth_middleware"; // ajusta el path

const router = Router();

// ✅ Ruta pública — ANTES de /:productId
router.get("/public/:userId", productsController.getActivePublic);

// Rutas protegidas
router.post("/",             authMiddleware, productsController.create);
router.get("/",              authMiddleware, productsController.getAll);
router.get("/:productId",    authMiddleware, productsController.getById);
router.put("/:productId",    authMiddleware, productsController.update);
router.delete("/:productId", authMiddleware, productsController.delete);

export default router;