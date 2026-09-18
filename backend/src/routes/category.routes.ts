/**
 * Category Routes
 * 
 * Product category endpoints.
 */

import { Router } from 'express'
import categoryController from '../controllers/category.controller'
import { authenticate } from '../middleware/auth.middleware'
import { requireAdmin } from '../middleware/rbac.middleware'

const router = Router()

/**
 * Public routes
 */

// GET /api/v1/categories - List all categories
router.get('/', categoryController.list)

// GET /api/v1/categories/:slug - Get category by slug
router.get('/:slug', categoryController.getBySlug)

/**
 * Admin routes (protected)
 */

// POST /api/v1/categories - Create category
router.post('/', authenticate, requireAdmin, categoryController.create)

// PUT /api/v1/categories/:id - Update category
router.put('/:id', authenticate, requireAdmin, categoryController.update)

// DELETE /api/v1/categories/:id - Delete category
router.delete('/:id', authenticate, requireAdmin, categoryController.delete)

export default router
