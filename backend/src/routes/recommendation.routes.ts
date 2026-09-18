/**
 * Recommendation Routes
 * 
 * Product recommendation endpoints.
 */

import { Router } from 'express';
import { recommendationController } from '../controllers/recommendation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/helpers';

const router = Router();

/**
 * Public recommendation routes (no authentication required)
 */

// GET /api/v1/recommendations/similar/:productId - Get similar products
router.get('/similar/:productId', asyncHandler(recommendationController.getSimilar));

// GET /api/v1/recommendations/also-bought/:productId - Customers also bought
router.get('/also-bought/:productId', asyncHandler(recommendationController.getAlsoBought));

// GET /api/v1/recommendations/trending - Get trending products
router.get('/trending', asyncHandler(recommendationController.getTrending));

// GET /api/v1/recommendations/best-sellers - Get best-selling products
router.get('/best-sellers', asyncHandler(recommendationController.getBestSellers));

// GET /api/v1/recommendations/new-arrivals - Get new arrivals
router.get('/new-arrivals', asyncHandler(recommendationController.getNewArrivals));

// GET /api/v1/recommendations/top-rated - Get top-rated products
router.get('/top-rated', asyncHandler(recommendationController.getTopRated));

// GET /api/v1/recommendations/popular-in-category/:categoryId - Popular in category
router.get('/popular-in-category/:categoryId', asyncHandler(recommendationController.getPopularInCategory));

/**
 * Protected routes (authentication required)
 */
router.use(authenticate);

// GET /api/v1/recommendations/for-you - Personalized "For You" feed
router.get('/for-you', asyncHandler(recommendationController.getForYou));

// GET /api/v1/recommendations/personalized - Personalized recommendations
router.get('/personalized', asyncHandler(recommendationController.getPersonalized));

// GET /api/v1/recommendations/recently-viewed - Recently viewed products
router.get('/recently-viewed', asyncHandler(recommendationController.getRecentlyViewed));

// GET /api/v1/recommendations/favorite-sellers - Products from favorite sellers
router.get('/favorite-sellers', asyncHandler(recommendationController.getFromFavoriteSellers));

export default router;
