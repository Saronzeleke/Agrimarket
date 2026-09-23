//Product recommendation endpoints with caching.

import { Router } from 'express';
import { recommendationController } from '../controllers/recommendation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/helpers';
import { cacheMiddleware, userCacheMiddleware } from '../middleware/cache.middleware';

const router = Router();
// Public recommendation routes (with caching - 10 minutes)

// GET /api/v1/recommendations/similar/:productId - Get similar products
router.get('/similar/:productId', cacheMiddleware(600), asyncHandler(recommendationController.getSimilar));

// GET /api/v1/recommendations/also-bought/:productId - Customers also bought
router.get('/also-bought/:productId', cacheMiddleware(600), asyncHandler(recommendationController.getAlsoBought));

// GET /api/v1/recommendations/trending - Get trending products (cache 5 minutes - changes frequently)
router.get('/trending', cacheMiddleware(300), asyncHandler(recommendationController.getTrending));

// GET /api/v1/recommendations/best-sellers - Get best-selling products
router.get('/best-sellers', cacheMiddleware(600), asyncHandler(recommendationController.getBestSellers));

// GET /api/v1/recommendations/new-arrivals - Get new arrivals
router.get('/new-arrivals', cacheMiddleware(600), asyncHandler(recommendationController.getNewArrivals));

// GET /api/v1/recommendations/top-rated - Get top-rated products
router.get('/top-rated', cacheMiddleware(600), asyncHandler(recommendationController.getTopRated));

// GET /api/v1/recommendations/popular-in-category/:categoryId - Popular in category
router.get('/popular-in-category/:categoryId', cacheMiddleware(600), asyncHandler(recommendationController.getPopularInCategory));
// Protected routes (authentication required, per-user caching)

router.use(authenticate);

// GET /api/v1/recommendations/for-you - Personalized "For You" feed (cache 5 minutes per user)
router.get('/for-you', userCacheMiddleware(300), asyncHandler(recommendationController.getForYou));

// GET /api/v1/recommendations/personalized - Personalized recommendations (cache 5 minutes per user)
router.get('/personalized', userCacheMiddleware(300), asyncHandler(recommendationController.getPersonalized));

// GET /api/v1/recommendations/recently-viewed - Recently viewed products (cache 5 minutes per user)
router.get('/recently-viewed', userCacheMiddleware(300), asyncHandler(recommendationController.getRecentlyViewed));

// GET /api/v1/recommendations/favorite-sellers - Products from favorite sellers (cache 10 minutes per user)
router.get('/favorite-sellers', userCacheMiddleware(600), asyncHandler(recommendationController.getFromFavoriteSellers));

export default router;
