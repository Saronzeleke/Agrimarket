import { Request, Response } from 'express';
import { adminOrderService } from '../services/admin-order.service';
import {
  getAdminOrdersSchema,
  updateAdminOrderStatusSchema,
  platformStatsSchema,
  recentOrdersSchema,
  bulkUpdateStatusSchema,
} from '../validators/admin-order.validator';
import { orderIdSchema } from '../validators/order.validator';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export const adminOrderController = {
  /**
   * Get all orders (admin view)
   * GET /api/v1/admin/orders?status=PENDING&page=1&limit=20&search=john&startDate=2024-01-01&endDate=2024-12-31
   */
  async getAllOrders(req: Request, res: Response) {
    const validation = getAdminOrdersSchema.safeParse(req.query);

    if (!validation.success) {
      throw new BadRequestError('Invalid query parameters', validation.error.issues);
    }

    const result = await adminOrderService.getAllOrders(validation.data);

    successResponse(res, result, 'Orders retrieved successfully');
  },

  /**
   * Get order details (admin view)
   * GET /api/v1/admin/orders/:orderId
   */
  async getOrderDetails(req: Request, res: Response) {
    const validation = orderIdSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid order ID', validation.error.issues);
    }

    const { orderId } = validation.data;
    const order = await adminOrderService.getOrderDetails(orderId);

    successResponse(res, { order }, 'Order details retrieved successfully');
  },

  /**
   * Update order status (admin)
   * PATCH /api/v1/admin/orders/:orderId/status
   */
  async updateOrderStatus(req: Request, res: Response) {
    const idValidation = orderIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      throw new BadRequestError('Invalid order ID', idValidation.error.issues);
    }

    const dataValidation = updateAdminOrderStatusSchema.safeParse(req.body);
    if (!dataValidation.success) {
      throw new BadRequestError('Invalid status data', dataValidation.error.issues);
    }

    const { orderId } = idValidation.data;
    const { status } = dataValidation.data;

    const result = await adminOrderService.updateOrderStatus(orderId, status);

    successResponse(res, result, 'Order status updated successfully');
  },

  /**
   * Get platform statistics
   * GET /api/v1/admin/orders/stats/platform?startDate=2024-01-01&endDate=2024-12-31
   */
  async getPlatformStats(req: Request, res: Response) {
    const validation = platformStatsSchema.safeParse(req.query);

    if (!validation.success) {
      throw new BadRequestError('Invalid query parameters', validation.error.issues);
    }

    const stats = await adminOrderService.getPlatformStats(validation.data);

    successResponse(res, { stats }, 'Platform statistics retrieved successfully');
  },

  /**
   * Get recent orders
   * GET /api/v1/admin/orders/recent?limit=10
   */
  async getRecentOrders(req: Request, res: Response) {
    const validation = recentOrdersSchema.safeParse(req.query);

    if (!validation.success) {
      throw new BadRequestError('Invalid query parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const orders = await adminOrderService.getRecentOrders(limit);

    successResponse(res, { orders }, 'Recent orders retrieved successfully');
  },

  /**
   * Bulk update order statuses
   * POST /api/v1/admin/orders/bulk-update-status
   */
  async bulkUpdateStatus(req: Request, res: Response) {
    const validation = bulkUpdateStatusSchema.safeParse(req.body);

    if (!validation.success) {
      throw new BadRequestError('Invalid bulk update data', validation.error.issues);
    }

    const { orderIds, status } = validation.data;
    const result = await adminOrderService.bulkUpdateStatus(orderIds, status);

    successResponse(res, result, 'Bulk status update completed');
  },
};
