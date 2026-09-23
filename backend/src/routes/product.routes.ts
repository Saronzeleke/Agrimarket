//Product catalog endpoints with caching.

import { Router } from 'express'
import productController from '../controllers/product.controller'
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware'
import { requireSeller, authorize } from '../middleware/rbac.middleware'
import { Role } from '@prisma/client'
import { cacheMiddleware, invalidateCacheMiddleware } from '../middleware/cache.middleware'

const router = Router()
//Public routes (with caching)

// GET /api/v1/products - List products with filters (cache 10 minutes)
router.get('/', cacheMiddleware(600), optionalAuthenticate, productController.list)

// GET /api/v1/products/slug/:slug - Get product by slug (cache 15 minutes)
router.get('/slug/:slug', cacheMiddleware(900), optionalAuthenticate, productController.getBySlug)

// GET /api/v1/products/:id - Get product by ID (cache 15 minutes)
router.get('/:id', cacheMiddleware(900), optionalAuthenticate, productController.getById)

// GET /api/v1/products/:id/related - Get related products (cache 15 minutes)
router.get('/:id/related', cacheMiddleware(900), productController.getRelated)
// Seller routes (protected, with cache invalidation)

// POST /api/v1/products - Create product (invalidate product caches)
router.post('/', authenticate, requireSeller, invalidateCacheMiddleware('response:/api/v1/products*'), productController.create)

// PUT /api/v1/products/:id - Update product (invalidate product caches)
router.put('/:id', authenticate, requireSeller, invalidateCacheMiddleware('response:/api/v1/products*'), productController.update)

// DELETE /api/v1/products/:id - Delete product (invalidate product caches)
router.delete('/:id', authenticate, requireSeller, invalidateCacheMiddleware('response:/api/v1/products*'), productController.delete)

// PATCH /api/v1/products/:id/toggle-active - Toggle active status (invalidate product caches)
router.patch(
  '/:id/toggle-active',
  authenticate,
  authorize([Role.SELLER, Role.ADMIN]),
  invalidateCacheMiddleware('response:/api/v1/products*'),
  productController.toggleActive
)

export default router
