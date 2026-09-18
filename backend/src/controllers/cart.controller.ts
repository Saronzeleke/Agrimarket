import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemIdSchema,
} from '../validators/cart.validator';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export const cartController = {
  /**
   * Get user's cart
   * GET /api/v1/cart
   */
  async getCart(req: Request, res: Response) {
    const userId = req.user!.id;
    const cart = await cartService.getCart(userId);
    successResponse(res, { cart }, 'Cart retrieved successfully');
  },

  /**
   * Add item to cart
   * POST /api/v1/cart/items
   */
  async addToCart(req: Request, res: Response) {
    const validation = addToCartSchema.safeParse(req.body);

    if (!validation.success) {
      throw new BadRequestError('Invalid cart data', validation.error.issues);
    }

    const userId = req.user!.id;
    const item = await cartService.addToCart(userId, validation.data);

    successResponse(res, { item }, 'Item added to cart successfully', 201);
  },

  /**
   * Update cart item quantity
   * PATCH /api/v1/cart/items/:itemId
   */
  async updateCartItem(req: Request, res: Response) {
    const itemIdValidation = cartItemIdSchema.safeParse(req.params);
    if (!itemIdValidation.success) {
      throw new BadRequestError('Invalid item ID', itemIdValidation.error.issues);
    }

    const dataValidation = updateCartItemSchema.safeParse(req.body);
    if (!dataValidation.success) {
      throw new BadRequestError('Invalid update data', dataValidation.error.issues);
    }

    const userId = req.user!.id;
    const { itemId } = itemIdValidation.data;
    const item = await cartService.updateCartItem(userId, itemId, dataValidation.data);

    successResponse(res, { item }, 'Cart item updated successfully');
  },

  /**
   * Remove item from cart
   * DELETE /api/v1/cart/items/:itemId
   */
  async removeFromCart(req: Request, res: Response) {
    const validation = cartItemIdSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid item ID', validation.error.issues);
    }

    const userId = req.user!.id;
    const { itemId } = validation.data;

    await cartService.removeFromCart(userId, itemId);

    successResponse(res, null, 'Item removed from cart successfully');
  },

  /**
   * Clear all items from cart
   * DELETE /api/v1/cart/items
   */
  async clearCart(req: Request, res: Response) {
    const userId = req.user!.id;
    await cartService.clearCart(userId);
    successResponse(res, null, 'Cart cleared successfully');
  },

  /**
   * Get cart item count
   * GET /api/v1/cart/count
   */
  async getCartItemCount(req: Request, res: Response) {
    const userId = req.user!.id;
    const count = await cartService.getCartItemCount(userId);
    successResponse(res, { count }, 'Cart item count retrieved successfully');
  },

  /**
   * Validate cart before checkout
   * GET /api/v1/cart/validate
   */
  async validateCart(req: Request, res: Response) {
    const userId = req.user!.id;
    const validation = await cartService.validateCart(userId);
    successResponse(res, validation, 'Cart validation completed');
  },
};
