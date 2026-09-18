import { Request, Response } from 'express';
import { orderService } from '../services/order.service';
import {
  orderIdSchema,
  orderNumberSchema,
  getOrdersSchema,
} from '../validators/order.validator';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export const orderController = {
  /**
   * Get order by ID
   * GET /api/v1/orders/:orderId
   */
  async getOrder(req: Request, res: Response) {
    const validation = orderIdSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid order ID', validation.error.issues);
    }

    const userId = req.user!.id;
    const { orderId } = validation.data;

    const order = await orderService.getOrder(orderId, userId);

    successResponse(res, { order }, 'Order retrieved successfully');
  },

  /**
   * Get order by order number
   * GET /api/v1/orders/number/:orderNumber
   */
  async getOrderByNumber(req: Request, res: Response) {
    const validation = orderNumberSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid order number', validation.error.issues);
    }

    const userId = req.user!.id;
    const { orderNumber } = validation.data;

    const order = await orderService.getOrderByNumber(orderNumber, userId);

    successResponse(res, { order }, 'Order retrieved successfully');
  },

  /**
   * Get all customer orders
   * GET /api/v1/orders?status=PENDING&page=1&limit=20
   */
  async getOrders(req: Request, res: Response) {
    const validation = getOrdersSchema.safeParse(req.query);

    if (!validation.success) {
      throw new BadRequestError('Invalid query parameters', validation.error.issues);
    }

    const userId = req.user!.id;
    const result = await orderService.getCustomerOrders(userId, validation.data);

    successResponse(res, result, 'Orders retrieved successfully');
  },

  /**
   * Cancel order
   * POST /api/v1/orders/:orderId/cancel
   */
  async cancelOrder(req: Request, res: Response) {
    const validation = orderIdSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid order ID', validation.error.issues);
    }

    const userId = req.user!.id;
    const { orderId } = validation.data;

    const order = await orderService.cancelOrder(orderId, userId);

    successResponse(res, { order }, 'Order cancelled successfully');
  },

  /**
   * Get order statistics
   * GET /api/v1/orders/stats
   */
  async getOrderStats(req: Request, res: Response) {
    const userId = req.user!.id;
    const stats = await orderService.getOrderStats(userId);

    successResponse(res, { stats }, 'Order statistics retrieved successfully');
  },
};
