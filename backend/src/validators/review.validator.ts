/**
 * Review Validators
 * 
 * Zod schemas for validating review request data.
 */

import { z } from 'zod';

/**
 * Submit review schema
 */
export const submitReviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  orderId: z.string().uuid('Invalid order ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be at most 100 characters').optional(),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be at most 1000 characters').optional(),
});

/**
 * Update review schema
 */
export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().min(3).max(100).optional(),
  comment: z.string().min(10).max(1000).optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

/**
 * Get product reviews query parameters
 */
export const getProductReviewsSchema = z.object({
  rating: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(5))
    .optional(),
  verifiedOnly: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1))
    .default('1' as any),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .default('20' as any),
  sortBy: z.enum(['recent', 'rating', 'helpful']).default('recent'),
});

/**
 * Seller response schema
 */
export const sellerResponseSchema = z.object({
  response: z.string().min(10, 'Response must be at least 10 characters').max(500, 'Response must be at most 500 characters'),
});

/**
 * Moderate review schema
 */
export const moderateReviewSchema = z.object({
  approved: z.boolean(),
});
