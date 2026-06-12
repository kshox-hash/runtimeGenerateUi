import { Request, Response } from "express";
import { StatisticsService } from "./stadistics.service";
import { ReviewsService } from "./reviews.service";

const statsService = new StatisticsService();
const reviewsService = new ReviewsService();

function uid(req: Request): string {
  return String(req.params["userId"]);
}

function isForbidden(req: Request): boolean {
  return req.user?.userId !== uid(req);
}

export const statisticsController = {
  async increment(req: Request, res: Response): Promise<Response> {
    try {
      if (isForbidden(req)) return res.status(403).json({ ok: false, message: "Forbidden" });
      const { metric, moduleId } = req.body;
      if (!metric) return res.status(400).json({ ok: false, message: "metric es requerido" });
      await statsService.increment(uid(req), metric, moduleId);
      return res.status(200).json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error?.message || "Error interno" });
    }
  },

  async getDashboard(req: Request, res: Response): Promise<Response> {
    try {
      if (isForbidden(req)) return res.status(403).json({ ok: false, message: "Forbidden" });
      const data = await statsService.getDashboard(uid(req));
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error?.message || "Error interno" });
    }
  },

  async getHomeStats(req: Request, res: Response): Promise<Response> {
    try {
      if (isForbidden(req)) return res.status(403).json({ ok: false, message: "Forbidden" });
      const data = await statsService.getHomeStats(uid(req));
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error?.message || "Error interno" });
    }
  },

  async getLinkOpensTrend(req: Request, res: Response): Promise<Response> {
    try {
      if (isForbidden(req)) return res.status(403).json({ ok: false, message: "Forbidden" });
      const days = req.query.days ? Number(req.query.days) : 30;
      const data = await statsService.getLinkOpensTrend(uid(req), days);
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error?.message || "Error interno" });
    }
  },

  async getModuleRanking(req: Request, res: Response): Promise<Response> {
    try {
      if (isForbidden(req)) return res.status(403).json({ ok: false, message: "Forbidden" });
      const data = await statsService.getModuleRanking(uid(req));
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error?.message || "Error interno" });
    }
  },

  async createReview(req: Request, res: Response): Promise<Response> {
    try {
      if (isForbidden(req)) return res.status(403).json({ ok: false, message: "Forbidden" });
      const { rating, comment, clientName, moduleId } = req.body;
      if (!rating) return res.status(400).json({ ok: false, message: "rating es requerido" });
      const review = await reviewsService.create(uid(req), Number(rating), comment, clientName, moduleId);
      return res.status(201).json(review);
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error?.message || "Error interno" });
    }
  },

  async getReviewsSummary(req: Request, res: Response): Promise<Response> {
    try {
      if (isForbidden(req)) return res.status(403).json({ ok: false, message: "Forbidden" });
      const data = await reviewsService.getSummary(uid(req));
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error?.message || "Error interno" });
    }
  },

  async getAllReviews(req: Request, res: Response): Promise<Response> {
    try {
      if (isForbidden(req)) return res.status(403).json({ ok: false, message: "Forbidden" });
      const page = req.query.page ? Number(req.query.page) : 1;
      const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
      const data = await reviewsService.getAll(uid(req), page, pageSize);
      return res.status(200).json(data);
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error?.message || "Error interno" });
    }
  },

  async deleteReview(req: Request, res: Response): Promise<Response> {
    try {
      if (isForbidden(req)) return res.status(403).json({ ok: false, message: "Forbidden" });
      const reviewId = req.params["reviewId"] as string;
      await reviewsService.delete(reviewId, uid(req));
      return res.status(200).json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ ok: false, message: error?.message || "Error interno" });
    }
  },
};
