import { Router } from "express";
import { publicPortalController } from "./public-portal.controller";
import { quotesSubmitController } from "../../quotes/quotes.controller";
import { portalSessionMiddleware } from "./portal-session.middleware";
import { statisticsController } from "../../stadistics/stadistics.controller";

const router = Router();

router.get("/shop/:publicSlug",           publicPortalController.open);
router.get("/shop/:publicSlug/cotizador", publicPortalController.openQuotes);
router.post("/shop/:publicSlug/quotes/submit", portalSessionMiddleware, quotesSubmitController.submit);
router.post("/api/public/:publicSlug/reviews", portalSessionMiddleware, publicPortalController.submitReview);
router.get("/api/public/reviews/:userId", statisticsController.getPublicReviews);

export default router;