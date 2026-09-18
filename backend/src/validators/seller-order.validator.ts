import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

/**
 * Validation schemas for seller order endpoints
 */

export const getSellerOrdersSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
});

export const updateSellerOrderStatusSchema = z.object({
  status: z.enum([OrderStatus.PROCESSING, OrderStatus.SHIPPED], {
    errorMap: () => ({ message: 'Sellers can only update status to PROCESSING or SHIPPED' }),
  }),
});

export const topProductsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type GetSellerOrders = z.infer<typeof getSellerOrdersSchema>;
export type UpdateSellerOrderStatus = z.infer<typeof updateSellerOrderStatusSchema>;
export type TopProducts = z.infer<typeof topProductsSchema>;
