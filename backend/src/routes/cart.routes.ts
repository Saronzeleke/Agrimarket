import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/helpers';
import { userCacheMiddleware, invalidateUserCacheMiddleware } from '../middleware/cache.middleware';

const router = Router();

/**
 * All cart routes require authentication (with user-specific caching)
 */

// Get cart - cache 1 hour per user
router.get('/', authenticate, userCacheMiddleware(3600), asyncHandler(cartController.getCart));

// Get cart item count - cache 1 hour per user
router.get('/count', authenticate, userCacheMiddleware(3600), asyncHandler(cartController.getCartItemCount));

// Validate cart before checkout - cache 5 minutes per user
router.get('/validate', authenticate, userCacheMiddleware(300), asyncHandler(cartController.validateCart));

// Add item to cart - invalidate user cart cache
router.post('/items', authenticate, invalidateUserCacheMiddleware(), asyncHandler(cartController.addToCart));

// Update cart item quantity - invalidate user cart cache
router.patch('/items/:itemId', authenticate, invalidateUserCacheMiddleware(), asyncHandler(cartController.updateCartItem));

// Remove item from cart - invalidate user cart cache
router.delete('/items/:itemId', authenticate, invalidateUserCacheMiddleware(), asyncHandler(cartController.removeFromCart));

// Clear cart - invalidate user cart cache
router.delete('/items', authenticate, invalidateUserCacheMiddleware(), asyncHandler(cartController.clearCart));

export default router;
