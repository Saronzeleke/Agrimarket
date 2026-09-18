import { z } from 'zod';

/**
 * Validation schemas for seller analytics endpoints
 */

export const dashboardOverviewSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).optional().default('month'),
});

export const salesOverTimeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  groupBy: z.enum(['day', 'week', 'month']).optional().default('day'),
});

export const productPerformanceSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sortBy: z.enum(['revenue', 'quantity', 'orders']).optional().default('revenue'),
});

export const revenueByCategorySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const customerInsightsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const recentActivitySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>;
export type SalesOverTime = z.infer<typeof salesOverTimeSchema>;
export type ProductPerformance = z.infer<typeof productPerformanceSchema>;
export type RevenueByCategory = z.infer<typeof revenueByCategorySchema>;
export type CustomerInsights = z.infer<typeof customerInsightsSchema>;
export type RecentActivity = z.infer<typeof recentActivitySchema>;
