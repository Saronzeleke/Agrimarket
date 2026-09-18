/**
 * Recommendation Validators
 * 
 * Zod schemas for validating recommendation request parameters.
 */

import { z } from 'zod';

/**
 * Recommendation query parameters
 */
export const recommendationQuerySchema = z.object({
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .default('20' as any),
});
