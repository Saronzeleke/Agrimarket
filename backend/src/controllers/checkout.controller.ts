import { Request, Response } from 'express';
import { checkoutService } from '../services/checkout.service';
import {
  checkoutSummarySchema,
  processCheckoutSchema,
} from '../validators/checkout.validator';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export const checkoutController = {
  /**
   * Get checkout summary
   * GET /api/v1/checkout/summary?addressId=uuid
   */
  async getCheckoutSummary(req: Request, res: Response) {
    const validation = checkoutSummarySchema.safeParse(req.query);

    if (!validation.success) {
      throw new BadRequestError('Invalid parameters', validation.error.issues);
    }

    const userId = req.user!.id;
    const { addressId } = validation.data;

    const summary = await checkoutService.getCheckoutSummary(userId, addressId);

    successResponse(res, summary, 'Checkout summary retrieved successfully');
  },

  /**
   * Process checkout and create order
   * POST /api/v1/checkout
   */
  async processCheckout(req: Request, res: Response) {
    const validation = processCheckoutSchema.safeParse(req.body);

    if (!validation.success) {
      throw new BadRequestError('Invalid checkout data', validation.error.issues);
    }

    const userId = req.user!.id;
    const result = await checkoutService.processCheckout(userId, validation.data);

    successResponse(res, result, 'Order created successfully', 201);
  },

  /**
   * Get available payment methods
   * GET /api/v1/checkout/payment-methods
   */
  async getPaymentMethods(req: Request, res: Response) {
    const paymentMethods = checkoutService.getPaymentMethods();

    successResponse(res, { paymentMethods }, 'Payment methods retrieved successfully');
  },
};
