import { Request, Response } from 'express';
import { sellerOrderService } from '../services/seller-order.service';
import {
  getSellerOrdersSchema,
  updateSellerOrderStatusSchema,
  topProductsSchema,
} from '../validators/seller-order.validator';
import { orderIdSchema } from '../validators/order.validator';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export const sellerOrderController = {
  /**
   * Get seller's orders
   * GET /api/v1/seller/orders?status=CONFIRMED&page=1&limit=20&search=john
   */
  async getOrders(req: Request, res: Response) {
    const validation = getSellerOrdersSchema.safeParse(req.query);

    if (!validation.success) {
      throw new BadRequestError('Invalid query parameters', validation.error.issues);
    }

    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new BadRequestError('User is not a seller');
    }

    const result = await sellerOrderService.getSellerOrders(sellerId, validation.data);

    successResponse(res, result, 'Orders retrieved successfully');
  },

  /**
   * Get specific order details
   * GET /api/v1/seller/orders/:orderId
   */
  async getOrder(req: Request, res: Response) {
    const validation = orderIdSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid order ID', validation.error.issues);
    }

    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new BadRequestError('User is not a seller');
    }

    const { orderId } = validation.data;
    const order = await sellerOrderService.getSellerOrder(orderId, sellerId);

    successResponse(res, { order }, 'Order retrieved successfully');
  },

  /**
   * Update order status
   * PATCH /api/v1/seller/orders/:orderId/status
   */
  async updateOrderStatus(req: Request, res: Response) {
    const idValidation = orderIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      throw new BadRequestError('Invalid order ID', idValidation.error.issues);
    }

    const dataValidation = updateSellerOrderStatusSchema.safeParse(req.body);
    if (!dataValidation.success) {
      throw new BadRequestError('Invalid status data', dataValidation.error.issues);
    }

    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new BadRequestError('User is not a seller');
    }

    const { orderId } = idValidation.data;
    const { status } = dataValidation.data;

    const result = await sellerOrderService.updateOrderStatus(orderId, sellerId, status);

    successResponse(res, result, 'Order status updated successfully');
  },

  /**
   * Get seller order statistics
   * GET /api/v1/seller/orders/stats
   */
  async getStats(req: Request, res: Response) {
    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new BadRequestError('User is not a seller');
    }

    const stats = await sellerOrderService.getSellerOrderStats(sellerId);

    successResponse(res, { stats }, 'Order statistics retrieved successfully');
  },

  /**
   * Get top selling products
   * GET /api/v1/seller/orders/top-products?limit=10
   */
  async getTopProducts(req: Request, res: Response) {
    const validation = topProductsSchema.safeParse(req.query);

    if (!validation.success) {
      throw new BadRequestError('Invalid query parameters', validation.error.issues);
    }

    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new BadRequestError('User is not a seller');
    }

    const { limit } = validation.data;
    const products = await sellerOrderService.getTopSellingProducts(sellerId, limit);

    successResponse(res, { products }, 'Top products retrieved successfully');
  },
};
