// Admin Analytics Validators
 

import { z } from 'zod';

//  Platform overview query parameters
 
export const platformOverviewSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']).default('month'),
});

// Sales analytics query parameters
 
export const salesAnalyticsSchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

// Top sellers query parameters
 
export const topSellersSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .default('20' as any),
});

//  Revenue by category query parameters
 
export const revenueByCategorySchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});

// User growth query parameters

export const userGrowthSchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  groupBy: z.enum(['day', 'week', 'month']).default('day'),
});

// Platform activity query parameters
 
export const platformActivitySchema = z.object({
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .default('50' as any),
});

// Payment method analytics query parameters
 
export const paymentMethodAnalyticsSchema = z.object({
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});
