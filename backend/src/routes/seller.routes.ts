/**
 * Seller Routes
 * 
 * Seller dashboard endpoints.
 */

import { Router } from 'express'
import productController from '../controllers/product.controller'
import { authenticate } from '../middleware/auth.middleware'
import { requireSeller } from '../middleware/rbac.middleware'

const router = Router()

/**
 * All seller routes require authentication
 */
router.use(authenticate)
router.use(requireSeller)

/**
 * Product management
 */

// GET /api/v1/seller/products - Get seller's products
router.get('/products', productController.getSellerProducts)

// GET /api/v1/seller/products/stats - Get product statistics
router.get('/products/stats', productController.getStats)

// GET /api/v1/seller/products/low-stock - Get low stock products
router.get('/products/low-stock', productController.getLowStock)

export default router
