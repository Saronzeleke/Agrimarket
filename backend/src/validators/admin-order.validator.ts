import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

// Validation schemas for admin order endpoints
 
export const getAdminOrdersSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  customerId: z.string().uuid().optional(),
  sellerId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  search: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const updateAdminOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
});

export const platformStatsSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

export const recentOrdersSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const bulkUpdateStatusSchema = z.object({
  orderIds: z.array(z.string().uuid()).min(1, 'At least one order ID is required').max(100, 'Maximum 100 orders at once'),
  status: z.nativeEnum(OrderStatus),
});

export type GetAdminOrders = z.infer<typeof getAdminOrdersSchema>;
export type UpdateAdminOrderStatus = z.infer<typeof updateAdminOrderStatusSchema>;
export type PlatformStats = z.infer<typeof platformStatsSchema>;
export type RecentOrders = z.infer<typeof recentOrdersSchema>;
export type BulkUpdateStatus = z.infer<typeof bulkUpdateStatusSchema>;
