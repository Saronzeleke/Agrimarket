/**
 * Category Routes
 * 
 * Product category endpoints with caching.
 */

import { Router } from 'express'
import categoryController from '../controllers/category.controller'
import { authenticate } from '../middleware/auth.middleware'
import { requireAdmin } from '../middleware/rbac.middleware'
import { cacheMiddleware, invalidateCacheMiddleware } from '../middleware/cache.middleware'

const router = Router()

/**
 * Public routes (with aggressive caching - categories rarely change)
 */

// GET /api/v1/categories - List all categories (cache 1 hour)
router.get('/', cacheMiddleware(3600), categoryController.list)

// GET /api/v1/categories/:slug - Get category by slug (cache 1 hour)
router.get('/:slug', cacheMiddleware(3600), categoryController.getBySlug)

/**
 * Admin routes (protected, with cache invalidation)
 */

// POST /api/v1/categories - Create category (invalidate all category caches)
router.post('/', authenticate, requireAdmin, invalidateCacheMiddleware('response:/api/v1/categories*'), categoryController.create)

// PUT /api/v1/categories/:id - Update category (invalidate all category caches)
router.put('/:id', authenticate, requireAdmin, invalidateCacheMiddleware('response:/api/v1/categories*'), categoryController.update)

// DELETE /api/v1/categories/:id - Delete category (invalidate all category caches)
router.delete('/:id', authenticate, requireAdmin, invalidateCacheMiddleware('response:/api/v1/categories*'), categoryController.delete)

export default router
