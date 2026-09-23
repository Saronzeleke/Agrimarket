import { Router } from 'express';
import { wishlistController } from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/helpers';

const router = Router();
// All wishlist routes require authentication

// Get wishlist
router.get('/', authenticate, asyncHandler(wishlistController.getWishlist));

// Get wishlist item count
router.get('/count', authenticate, asyncHandler(wishlistController.getWishlistItemCount));

// Check if product is in wishlist
router.get('/check/:productId', authenticate, asyncHandler(wishlistController.checkProduct));

// Add product to wishlist
router.post('/items', authenticate, asyncHandler(wishlistController.addToWishlist));

// Move item from wishlist to cart
router.post('/items/:itemId/move-to-cart', authenticate, asyncHandler(wishlistController.moveToCart));

// Move all items from wishlist to cart
router.post('/move-all-to-cart', authenticate, asyncHandler(wishlistController.moveAllToCart));

// Remove item from wishlist
router.delete('/items/:itemId', authenticate, asyncHandler(wishlistController.removeFromWishlist));

// Remove product from wishlist by product ID
router.delete('/products/:productId', authenticate, asyncHandler(wishlistController.removeProductFromWishlist));

// Clear wishlist
router.delete('/items', authenticate, asyncHandler(wishlistController.clearWishlist));

export default router;
