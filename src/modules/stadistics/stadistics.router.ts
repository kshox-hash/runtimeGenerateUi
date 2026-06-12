import express from "express";
import { authMiddleware } from "../../middlewares/auth_middleware";
import { statisticsController } from "./stadistics.controller";

const router = express.Router();

router.use(authMiddleware);

// Stats
router.post("/stats/:userId/increment", statisticsController.increment);
router.get("/stats/:userId/dashboard", statisticsController.getDashboard);
router.get("/stats/:userId/home", statisticsController.getHomeStats);
router.get("/stats/:userId/link-opens", statisticsController.getLinkOpensTrend);
router.get("/stats/:userId/module-ranking", statisticsController.getModuleRanking);

// Reviews — summary must be before /:userId to avoid route conflict
router.get("/stats/:userId/reviews/summary", statisticsController.getReviewsSummary);
router.post("/stats/:userId/reviews", statisticsController.createReview);
router.get("/stats/:userId/reviews", statisticsController.getAllReviews);
router.delete("/stats/:userId/reviews/:reviewId", statisticsController.deleteReview);

export default router;
