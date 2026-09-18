/**
 * Admin Analytics Controller
 * 
 * Handles admin dashboard and platform-wide analytics endpoints.
 */

import { Request, Response } from 'express';
import { adminAnalyticsService } from '../services/admin-analytics.service';
import {
  platformOverviewSchema,
  salesAnalyticsSchema,
  topSellersSchema,
  revenueByCategorySchema,
  userGrowthSchema,
  platformActivitySchema,
  paymentMethodAnalyticsSchema,
} from '../validators/admin-analytics.validator';
import { sendSuccess } from '../utils/response';
import { ValidationError } from '../utils/errors';

export const adminAnalyticsController = {
  /**
   * Get platform overview dashboard
   * GET /api/v1/admin/analytics/overview?period=month
   */
  async getPlatformOverview(req: Request, res: Response) {
    const validation = platformOverviewSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { period } = validation.data;
    const overview = await adminAnalyticsService.getPlatformOverview(period);

    return sendSuccess(res, { overview });
  },

  /**
   * Get sales analytics over time
   * GET /api/v1/admin/analytics/sales?startDate=2024-01-01&endDate=2024-12-31&groupBy=month
   */
  async getSalesAnalytics(req: Request, res: Response) {
    const validation = salesAnalyticsSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { startDate, endDate, groupBy } = validation.data;
    const result = await adminAnalyticsService.getSalesAnalytics({
      startDate,
      endDate,
      groupBy,
    });

    return sendSuccess(res, result);
  },

  /**
   * Get top performing sellers
   * GET /api/v1/admin/analytics/top-sellers?period=month&limit=10
   */
  async getTopSellers(req: Request, res: Response) {
    const validation = topSellersSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const sellers = await adminAnalyticsService.getTopSellers(validation.data);

    return sendSuccess(res, { sellers });
  },

  /**
   * Get revenue by category
   * GET /api/v1/admin/analytics/revenue-by-category?startDate=2024-01-01&endDate=2024-12-31
   */
  async getRevenueByCategory(req: Request, res: Response) {
    const validation = revenueByCategorySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { startDate, endDate } = validation.data;
    const categories = await adminAnalyticsService.getRevenueByCategory(startDate, endDate);

    return sendSuccess(res, { categories });
  },

  /**
   * Get user growth analytics
   * GET /api/v1/admin/analytics/user-growth?startDate=2024-01-01&endDate=2024-12-31&groupBy=month
   */
  async getUserGrowth(req: Request, res: Response) {
    const validation = userGrowthSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { startDate, endDate, groupBy } = validation.data;
    const result = await adminAnalyticsService.getUserGrowth({
      startDate,
      endDate,
      groupBy,
    });

    return sendSuccess(res, result);
  },

  /**
   * Get platform activity feed
   * GET /api/v1/admin/analytics/activity?limit=50
   */
  async getPlatformActivity(req: Request, res: Response) {
    const validation = platformActivitySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const activities = await adminAnalyticsService.getPlatformActivity(limit);

    return sendSuccess(res, { activities });
  },

  /**
   * Get user demographics by region
   * GET /api/v1/admin/analytics/demographics
   */
  async getUserDemographics(req: Request, res: Response) {
    const demographics = await adminAnalyticsService.getUserDemographics();

    return sendSuccess(res, { demographics });
  },

  /**
   * Get payment method analytics
   * GET /api/v1/admin/analytics/payment-methods?startDate=2024-01-01&endDate=2024-12-31
   */
  async getPaymentMethodAnalytics(req: Request, res: Response) {
    const validation = paymentMethodAnalyticsSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const { startDate, endDate } = validation.data;
    const paymentMethods = await adminAnalyticsService.getPaymentMethodAnalytics(startDate, endDate);

    return sendSuccess(res, { paymentMethods });
  },
};
