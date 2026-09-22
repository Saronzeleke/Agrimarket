// Validation schemas for order endpoints

import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

export const orderIdSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
});

export const orderNumberSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required'),
});

export const getOrdersSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type OrderId = z.infer<typeof orderIdSchema>;
export type OrderNumber = z.infer<typeof orderNumberSchema>;
export type GetOrders = z.infer<typeof getOrdersSchema>;
