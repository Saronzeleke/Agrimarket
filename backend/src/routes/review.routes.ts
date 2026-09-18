/**
 * Review Routes
 * 
 * Product review and rating endpoints.
 */

import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/helpers';

const router = Router();

/**
 * Public routes (no authentication required)
 */

// GET /api/v1/products/:productId/reviews - Get product reviews
router.get('/products/:productId/reviews', asyncHandler(reviewController.getProductReviews));

// GET /api/v1/products/:productId/reviews/stats - Get product review statistics
router.get('/products/:productId/reviews/stats', asyncHandler(reviewController.getProductStats));

/**
 * Protected routes (authentication required)
 */
router.use(authenticate);

// POST /api/v1/reviews - Submit a review
router.post('/reviews', asyncHandler(reviewController.submitReview));

// GET /api/v1/reviews/:reviewId - Get review by ID
router.get('/reviews/:reviewId', asyncHandler(reviewController.getReviewById));

// PATCH /api/v1/reviews/:reviewId - Update a review
router.patch('/reviews/:reviewId', asyncHandler(reviewController.updateReview));

// DELETE /api/v1/reviews/:reviewId - Delete a review
router.delete('/reviews/:reviewId', asyncHandler(reviewController.deleteReview));

// POST /api/v1/reviews/:reviewId/helpful - Toggle helpful vote
router.post('/reviews/:reviewId/helpful', asyncHandler(reviewController.toggleHelpful));

// POST /api/v1/reviews/:reviewId/flag - Flag a review
router.post('/reviews/:reviewId/flag', asyncHandler(reviewController.flagReview));

export default router;
