import { z } from 'zod';

/**
 * Validation schemas for wishlist endpoints
 */

export const addToWishlistSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
});

export const wishlistItemIdSchema = z.object({
  itemId: z.string().uuid('Invalid item ID'),
});

export const moveToCartSchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(1000, 'Quantity cannot exceed 1000')
    .optional()
    .default(1),
});

export const productIdSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
});

export type AddToWishlist = z.infer<typeof addToWishlistSchema>;
export type WishlistItemId = z.infer<typeof wishlistItemIdSchema>;
export type MoveToCart = z.infer<typeof moveToCartSchema>;
export type ProductId = z.infer<typeof productIdSchema>;
