/**
 * Product Routes
 * 
 * Product catalog endpoints.
 */

import { Router } from 'express'
import productController from '../controllers/product.controller'
import { authenticate, optionalAuthenticate } from '../middleware/auth.middleware'
import { requireSeller, authorize } from '../middleware/rbac.middleware'
import { Role } from '@prisma/client'

const router = Router()

/**
 * Public routes
 */

// GET /api/v1/products - List products with filters
router.get('/', optionalAuthenticate, productController.list)

// GET /api/v1/products/slug/:slug - Get product by slug
router.get('/slug/:slug', optionalAuthenticate, productController.getBySlug)

// GET /api/v1/products/:id - Get product by ID
router.get('/:id', optionalAuthenticate, productController.getById)

// GET /api/v1/products/:id/related - Get related products
router.get('/:id/related', productController.getRelated)

/**
 * Seller routes (protected)
 */

// POST /api/v1/products - Create product
router.post('/', authenticate, requireSeller, productController.create)

// PUT /api/v1/products/:id - Update product
router.put('/:id', authenticate, requireSeller, productController.update)

// DELETE /api/v1/products/:id - Delete product
router.delete('/:id', authenticate, requireSeller, productController.delete)

// PATCH /api/v1/products/:id/toggle-active - Toggle active status
router.patch(
  '/:id/toggle-active',
  authenticate,
  authorize([Role.SELLER, Role.ADMIN]),
  productController.toggleActive
)

export default router
