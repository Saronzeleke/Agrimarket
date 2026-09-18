/**
 * Seller Analytics Controller
 * 
 * Handles seller dashboard and analytics endpoints.
 */

import { Request, Response } from 'express';
import { sellerAnalyticsService } from '../services/seller-analytics.service';
import {
  dashboardOverviewSchema,
  salesOverTimeSchema,
  productPerformanceSchema,
  revenueByCategorySchema,
  customerInsightsSchema,
  recentActivitySchema,
} from '../validators/seller-analytics.validator';
import { sendSuccess } from '../utils/response';
import { ValidationError } from '../utils/errors';

export const sellerAnalyticsController = {
  /**
   * Get dashboard overview
   * GET /api/v1/seller/analytics/dashboard?period=month
   */
  async getDashboardOverview(req: Request, res: Response) {
    const validation = dashboardOverviewSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new ValidationError('User is not a seller');
    }

    const { period } = validation.data;
    const overview = await sellerAnalyticsService.getDashboardOverview(sellerId, period);

    return sendSuccess(res, { overview });
  },

  /**
   * Get sales over time
   * GET /api/v1/seller/analytics/sales?startDate=2024-01-01&endDate=2024-12-31&interval=month
   */
  async getSalesOverTime(req: Request, res: Response) {
    const validation = salesOverTimeSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new ValidationError('User is not a seller');
    }

    const { startDate, endDate, interval } = validation.data;
    const result = await sellerAnalyticsService.getSalesOverTime(
      sellerId,
      { startDate, endDate, groupBy: interval }
    );

    return sendSuccess(res, result);
  },

  /**
   * Get product performance
   * GET /api/v1/seller/analytics/products?period=month&sortBy=revenue&limit=10
   */
  async getProductPerformance(req: Request, res: Response) {
    const validation = productPerformanceSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new ValidationError('User is not a seller');
    }

    const products = await sellerAnalyticsService.getProductPerformance(sellerId, validation.data);

    return sendSuccess(res, { products });
  },

  /**
   * Get revenue by category
   * GET /api/v1/seller/analytics/revenue?startDate=2024-01-01&endDate=2024-12-31
   */
  async getRevenueByCategory(req: Request, res: Response) {
    const validation = revenueByCategorySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new ValidationError('User is not a seller');
    }

    const { startDate, endDate } = validation.data;
    const categories = await sellerAnalyticsService.getRevenueByCategory(sellerId, startDate, endDate);

    return sendSuccess(res, { categories });
  },

  /**
   * Get customer insights
   * GET /api/v1/seller/analytics/customers?period=month&limit=10
   */
  async getCustomerInsights(req: Request, res: Response) {
    const validation = customerInsightsSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new ValidationError('User is not a seller');
    }

    const insights = await sellerAnalyticsService.getCustomerInsights(sellerId, validation.data);

    return sendSuccess(res, insights);
  },

  /**
   * Get recent activity
   * GET /api/v1/seller/analytics/activity?limit=20
   */
  async getRecentActivity(req: Request, res: Response) {
    const validation = recentActivitySchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new ValidationError('User is not a seller');
    }

    const { limit } = validation.data;
    const activities = await sellerAnalyticsService.getRecentActivity(sellerId, limit);

    return sendSuccess(res, { activities });
  },
};
