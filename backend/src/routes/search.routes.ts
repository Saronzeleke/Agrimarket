import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/helpers';
import { searchLimiter } from '../middleware/rate-limit.middleware';
import { cacheMiddleware, userCacheMiddleware, invalidateUserCacheMiddleware } from '../middleware/cache.middleware';

const router = Router();
// Public search endpoints (with rate limiting and caching)

// Advanced product search (with optional auth for logging) - cache 5 minutes
router.get('/', searchLimiter, cacheMiddleware(300), optionalAuthenticate, asyncHandler(searchController.searchProducts));

// Autocomplete suggestions (public) - cache 5 minutes
router.get('/suggestions', searchLimiter, cacheMiddleware(300), asyncHandler(searchController.getAutocompleteSuggestions));

// Popular searches (public) - cache 15 minutes
router.get('/popular', cacheMiddleware(900), asyncHandler(searchController.getPopularSearches));
// Protected search endpoints (require authentication, with user-specific caching)

// Recent searches (authenticated users only) - cache per user, 10 minutes
router.get('/recent', authenticate, userCacheMiddleware(600), asyncHandler(searchController.getUserRecentSearches));

// Saved searches - cache per user, 10 minutes
router.post('/saved', authenticate, invalidateUserCacheMiddleware(), asyncHandler(searchController.saveSearch));
router.get('/saved', authenticate, userCacheMiddleware(600), asyncHandler(searchController.getUserSavedSearches));
router.get('/saved/:id', authenticate, userCacheMiddleware(600), asyncHandler(searchController.getSavedSearch));
router.patch('/saved/:id', authenticate, invalidateUserCacheMiddleware(), asyncHandler(searchController.updateSavedSearch));
router.delete('/saved/:id', authenticate, invalidateUserCacheMiddleware(), asyncHandler(searchController.deleteSavedSearch));
router.get('/saved/:id/execute', authenticate, userCacheMiddleware(300), asyncHandler(searchController.executeSavedSearch));

export default router;
