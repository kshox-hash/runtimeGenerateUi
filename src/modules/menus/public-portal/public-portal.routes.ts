import { Router } from "express";
import { publicPortalController } from "./public-portal.controller";
import { quotesSubmitController } from "../../quotes/quotes.controller"; // 

const router = Router();

router.get("/shop/:publicSlug", publicPortalController.open);
router.get("/shop/:publicSlug/cotizador", publicPortalController.openQuotes);
router.post("/shop/:publicSlug/quotes/submit", quotesSubmitController.submit); 

export default router;