import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/helpers';

const router = Router();

/**
 * Public search endpoints
 */

// Advanced product search (with optional auth for logging)
router.get('/', optionalAuthenticate, asyncHandler(searchController.searchProducts));

// Autocomplete suggestions (public)
router.get('/suggestions', asyncHandler(searchController.getAutocompleteSuggestions));

// Popular searches (public)
router.get('/popular', asyncHandler(searchController.getPopularSearches));

/**
 * Protected search endpoints (require authentication)
 */

// Recent searches (authenticated users only)
router.get('/recent', authenticate, asyncHandler(searchController.getUserRecentSearches));

// Saved searches
router.post('/saved', authenticate, asyncHandler(searchController.saveSearch));
router.get('/saved', authenticate, asyncHandler(searchController.getUserSavedSearches));
router.get('/saved/:id', authenticate, asyncHandler(searchController.getSavedSearch));
router.patch('/saved/:id', authenticate, asyncHandler(searchController.updateSavedSearch));
router.delete('/saved/:id', authenticate, asyncHandler(searchController.deleteSavedSearch));
router.get('/saved/:id/execute', authenticate, asyncHandler(searchController.executeSavedSearch));

export default router;
