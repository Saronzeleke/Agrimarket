import { Request, Response } from 'express';
import { wishlistService } from '../services/wishlist.service';
import {
  addToWishlistSchema,
  wishlistItemIdSchema,
  moveToCartSchema,
  productIdSchema,
} from '../validators/wishlist.validator';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export const wishlistController = {
  /**
   * Get user's wishlist
   * GET /api/v1/wishlist
   */
  async getWishlist(req: Request, res: Response) {
    const userId = req.user!.id;
    const wishlist = await wishlistService.getWishlist(userId);
    successResponse(res, { wishlist }, 'Wishlist retrieved successfully');
  },

  /**
   * Add product to wishlist
   * POST /api/v1/wishlist/items
   */
  async addToWishlist(req: Request, res: Response) {
    const validation = addToWishlistSchema.safeParse(req.body);

    if (!validation.success) {
      throw new BadRequestError('Invalid wishlist data', validation.error.issues);
    }

    const userId = req.user!.id;
    const { productId } = validation.data;

    const item = await wishlistService.addToWishlist(userId, productId);

    successResponse(res, { item }, 'Item added to wishlist successfully', 201);
  },

  /**
   * Remove item from wishlist
   * DELETE /api/v1/wishlist/items/:itemId
   */
  async removeFromWishlist(req: Request, res: Response) {
    const validation = wishlistItemIdSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid item ID', validation.error.issues);
    }

    const userId = req.user!.id;
    const { itemId } = validation.data;

    await wishlistService.removeFromWishlist(userId, itemId);

    successResponse(res, null, 'Item removed from wishlist successfully');
  },

  /**
   * Remove product from wishlist by product ID
   * DELETE /api/v1/wishlist/products/:productId
   */
  async removeProductFromWishlist(req: Request, res: Response) {
    const validation = productIdSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid product ID', validation.error.issues);
    }

    const userId = req.user!.id;
    const { productId } = validation.data;

    await wishlistService.removeProductFromWishlist(userId, productId);

    successResponse(res, null, 'Product removed from wishlist successfully');
  },

  /**
   * Clear all items from wishlist
   * DELETE /api/v1/wishlist/items
   */
  async clearWishlist(req: Request, res: Response) {
    const userId = req.user!.id;
    await wishlistService.clearWishlist(userId);
    successResponse(res, null, 'Wishlist cleared successfully');
  },

  /**
   * Move item from wishlist to cart
   * POST /api/v1/wishlist/items/:itemId/move-to-cart
   */
  async moveToCart(req: Request, res: Response) {
    const itemIdValidation = wishlistItemIdSchema.safeParse(req.params);
    if (!itemIdValidation.success) {
      throw new BadRequestError('Invalid item ID', itemIdValidation.error.issues);
    }

    const dataValidation = moveToCartSchema.safeParse(req.body);
    if (!dataValidation.success) {
      throw new BadRequestError('Invalid move data', dataValidation.error.issues);
    }

    const userId = req.user!.id;
    const { itemId } = itemIdValidation.data;
    const { quantity } = dataValidation.data;

    const result = await wishlistService.moveToCart(userId, itemId, quantity);

    successResponse(res, result, 'Item moved to cart successfully');
  },

  /**
   * Move all available items from wishlist to cart
   * POST /api/v1/wishlist/move-all-to-cart
   */
  async moveAllToCart(req: Request, res: Response) {
    const userId = req.user!.id;
    const results = await wishlistService.moveAllToCart(userId);
    
    const message = results.failed > 0
      ? `Moved ${results.successful} items to cart. ${results.failed} items could not be moved.`
      : `Successfully moved all ${results.successful} items to cart.`;

    successResponse(res, results, message);
  },

  /**
   * Check if product is in wishlist
   * GET /api/v1/wishlist/check/:productId
   */
  async checkProduct(req: Request, res: Response) {
    const validation = productIdSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid product ID', validation.error.issues);
    }

    const userId = req.user!.id;
    const { productId } = validation.data;

    const inWishlist = await wishlistService.isInWishlist(userId, productId);

    successResponse(res, { inWishlist }, 'Check completed successfully');
  },

  /**
   * Get wishlist item count
   * GET /api/v1/wishlist/count
   */
  async getWishlistItemCount(req: Request, res: Response) {
    const userId = req.user!.id;
    const count = await wishlistService.getWishlistItemCount(userId);
    successResponse(res, { count }, 'Wishlist item count retrieved successfully');
  },
};
