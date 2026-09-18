import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/helpers';

const router = Router();

/**
 * All cart routes require authentication
 */

// Get cart
router.get('/', authenticate, asyncHandler(cartController.getCart));

// Get cart item count
router.get('/count', authenticate, asyncHandler(cartController.getCartItemCount));

// Validate cart before checkout
router.get('/validate', authenticate, asyncHandler(cartController.validateCart));

// Add item to cart
router.post('/items', authenticate, asyncHandler(cartController.addToCart));

// Update cart item quantity
router.patch('/items/:itemId', authenticate, asyncHandler(cartController.updateCartItem));

// Remove item from cart
router.delete('/items/:itemId', authenticate, asyncHandler(cartController.removeFromCart));

// Clear cart
router.delete('/items', authenticate, asyncHandler(cartController.clearCart));

export default router;
