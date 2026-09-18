/**
 * Recommendation Controller
 * 
 * Handles product recommendation endpoints.
 */

import { Request, Response } from 'express';
import { recommendationService } from '../services/recommendation.service';
import { recommendationQuerySchema } from '../validators/recommendation.validator';
import { sendSuccess } from '../utils/response';
import { ValidationError } from '../utils/errors';

export const recommendationController = {
  /**
   * Get personalized recommendations for logged-in user
   * GET /api/v1/recommendations/for-you
   */
  async getForYou(req: Request, res: Response) {
    const userId = req.user!.id;
    const validation = recommendationQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const recommendations = await recommendationService.getForYouFeed(userId, limit);

    return sendSuccess(res, { recommendations });
  },

  /**
   * Get personalized recommendations
   * GET /api/v1/recommendations/personalized
   */
  async getPersonalized(req: Request, res: Response) {
    const userId = req.user!.id;
    const validation = recommendationQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const recommendations = await recommendationService.getPersonalizedRecommendations(userId, limit);

    return sendSuccess(res, { recommendations });
  },

  /**
   * Get similar products
   * GET /api/v1/recommendations/similar/:productId
   */
  async getSimilar(req: Request, res: Response) {
    const { productId } = req.params;
    const validation = recommendationQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const recommendations = await recommendationService.getSimilarProducts(productId, limit);

    return sendSuccess(res, { recommendations });
  },

  /**
   * Get "Customers also bought" recommendations
   * GET /api/v1/recommendations/also-bought/:productId
   */
  async getAlsoBought(req: Request, res: Response) {
    const { productId } = req.params;
    const validation = recommendationQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const recommendations = await recommendationService.getCustomersAlsoBought(productId, limit);

    return sendSuccess(res, { recommendations });
  },

  /**
   * Get trending products
   * GET /api/v1/recommendations/trending
   */
  async getTrending(req: Request, res: Response) {
    const validation = recommendationQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const recommendations = await recommendationService.getTrendingProducts(limit);

    return sendSuccess(res, { recommendations });
  },

  /**
   * Get best-selling products
   * GET /api/v1/recommendations/best-sellers
   */
  async getBestSellers(req: Request, res: Response) {
    const validation = recommendationQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const recommendations = await recommendationService.getBestSellers(limit);

    return sendSuccess(res, { recommendations });
  },

  /**
   * Get new arrivals
   * GET /api/v1/recommendations/new-arrivals
   */
  async getNewArrivals(req: Request, res: Response) {
    const validation = recommendationQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const recommendations = await recommendationService.getNewArrivals(limit);

    return sendSuccess(res, { recommendations });
  },

  /**
   * Get top-rated products
   * GET /api/v1/recommendations/top-rated
   */
  async getTopRated(req: Request, res: Response) {
    const validation = recommendationQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const recommendations = await recommendationService.getTopRatedProducts(limit);

    return sendSuccess(res, { recommendations });
  },

  /**
   * Get popular products in a category
   * GET /api/v1/recommendations/popular-in-category/:categoryId
   */
  async getPopularInCategory(req: Request, res: Response) {
    const { categoryId } = req.params;
    const validation = recommendationQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const recommendations = await recommendationService.getPopularInCategory(categoryId, limit);

    return sendSuccess(res, { recommendations });
  },

  /**
   * Get recently viewed products
   * GET /api/v1/recommendations/recently-viewed
   */
  async getRecentlyViewed(req: Request, res: Response) {
    const userId = req.user!.id;
    const validation = recommendationQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const recommendations = await recommendationService.getRecentlyViewed(userId, limit);

    return sendSuccess(res, { recommendations });
  },

  /**
   * Get products from favorite sellers
   * GET /api/v1/recommendations/favorite-sellers
   */
  async getFromFavoriteSellers(req: Request, res: Response) {
    const userId = req.user!.id;
    const validation = recommendationQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const recommendations = await recommendationService.getFromFavoriteSellers(userId, limit);

    return sendSuccess(res, { recommendations });
  },
};
