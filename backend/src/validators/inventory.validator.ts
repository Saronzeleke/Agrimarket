import { z } from 'zod';

/**
 * Validation schemas for inventory endpoints
 */

export const updateInventorySchema = z.object({
  currentStock: z.number().int().min(0, 'Stock cannot be negative').optional(),
  reservedStock: z.number().int().min(0, 'Reserved stock cannot be negative').optional(),
  lowStockThreshold: z.number().int().min(0, 'Threshold cannot be negative').optional(),
});

export const addStockSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
});

export const adjustStockSchema = z.object({
  quantity: z.number().int().refine((val) => val !== 0, {
    message: 'Quantity cannot be zero',
  }),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(500, 'Reason cannot exceed 500 characters'),
});

export const inventoryHistorySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export const bulkAddStockSchema = z.object({
  updates: z
    .array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      })
    )
    .min(1, 'At least one update is required')
    .max(100, 'Maximum 100 products can be updated at once'),
});

export const inventoryIdSchema = z.object({
  inventoryId: z.string().uuid('Invalid inventory ID'),
});

export const productIdSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
});

export type UpdateInventory = z.infer<typeof updateInventorySchema>;
export type AddStock = z.infer<typeof addStockSchema>;
export type AdjustStock = z.infer<typeof adjustStockSchema>;
export type InventoryHistory = z.infer<typeof inventoryHistorySchema>;
export type BulkAddStock = z.infer<typeof bulkAddStockSchema>;
export type InventoryId = z.infer<typeof inventoryIdSchema>;
export type ProductId = z.infer<typeof productIdSchema>;
