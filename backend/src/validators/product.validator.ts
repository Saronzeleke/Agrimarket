/**
 * Product Validation Schemas
 * 
 * Zod schemas for product endpoints.
 */

import { z } from 'zod'
import { CONSTANTS } from '../config/constants'

/**
 * Create product schema
 */
export const createProductSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z
    .string()
    .min(
      CONSTANTS.PRODUCT_NAME_MIN_LENGTH,
      `Name must be at least ${CONSTANTS.PRODUCT_NAME_MIN_LENGTH} characters`
    )
    .max(
      CONSTANTS.PRODUCT_NAME_MAX_LENGTH,
      `Name must not exceed ${CONSTANTS.PRODUCT_NAME_MAX_LENGTH} characters`
    ),
  description: z
    .string()
    .min(
      CONSTANTS.PRODUCT_DESCRIPTION_MIN_LENGTH,
      `Description must be at least ${CONSTANTS.PRODUCT_DESCRIPTION_MIN_LENGTH} characters`
    )
    .max(
      CONSTANTS.PRODUCT_DESCRIPTION_MAX_LENGTH,
      `Description must not exceed ${CONSTANTS.PRODUCT_DESCRIPTION_MAX_LENGTH} characters`
    ),
  price: z.number().positive('Price must be positive'),
  unit: z.enum(['kg', 'quintal', 'liter', 'piece', 'dozen'], {
    errorMap: () => ({ message: 'Invalid unit of measurement' }),
  }),
  productionLocation: z.string().optional(),
  harvestDate: z.string().datetime().optional(),
  qualityGrade: z.enum(['A', 'B', 'C', 'Premium']).optional(),
})

/**
 * Update product schema
 */
export const updateProductSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID').optional(),
  name: z
    .string()
    .min(CONSTANTS.PRODUCT_NAME_MIN_LENGTH)
    .max(CONSTANTS.PRODUCT_NAME_MAX_LENGTH)
    .optional(),
  description: z
    .string()
    .min(CONSTANTS.PRODUCT_DESCRIPTION_MIN_LENGTH)
    .max(CONSTANTS.PRODUCT_DESCRIPTION_MAX_LENGTH)
    .optional(),
  price: z.number().positive('Price must be positive').optional(),
  unit: z.enum(['kg', 'quintal', 'liter', 'piece', 'dozen']).optional(),
  productionLocation: z.string().optional().nullable(),
  harvestDate: z.string().datetime().optional().nullable(),
  qualityGrade: z.enum(['A', 'B', 'C', 'Premium']).optional().nullable(),
  active: z.boolean().optional(),
})

/**
 * Product query filters schema
 */
export const productFiltersSchema = z.object({
  categoryId: z.string().uuid().optional(),
  sellerId: z.string().uuid().optional(),
  minPrice: z.string().transform(Number).optional(),
  maxPrice: z.string().transform(Number).optional(),
  location: z.string().optional(),
  rating: z.string().transform(Number).optional(),
  inStock: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  search: z.string().optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
})

/**
 * Category create schema
 */
export const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(500).optional(),
  icon: z.string().max(50).optional(),
  order: z.number().int().min(0).optional(),
})

/**
 * Category update schema
 */
export const updateCategorySchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
  order: z.number().int().min(0).optional(),
  active: z.boolean().optional(),
})
