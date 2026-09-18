/**
 * Seller Routes
 * 
 * Seller dashboard endpoints.
 */

import { Router } from 'express'
import productController from '../controllers/product.controller'
import { sellerOrderController } from '../controllers/seller-order.controller'
import { authenticate } from '../middleware/auth.middleware'
import { requireSeller } from '../middleware/rbac.middleware'
import { asyncHandler } from '../utils/helpers'

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

/**
 * Order management
 */

// GET /api/v1/seller/orders/stats - Get order statistics
router.get('/orders/stats', asyncHandler(sellerOrderController.getStats))

// GET /api/v1/seller/orders/top-products - Get top selling products
router.get('/orders/top-products', asyncHandler(sellerOrderController.getTopProducts))

// GET /api/v1/seller/orders - Get seller's orders
router.get('/orders', asyncHandler(sellerOrderController.getOrders))

// GET /api/v1/seller/orders/:orderId - Get specific order
router.get('/orders/:orderId', asyncHandler(sellerOrderController.getOrder))

// PATCH /api/v1/seller/orders/:orderId/status - Update order status
router.patch('/orders/:orderId/status', asyncHandler(sellerOrderController.updateOrderStatus))

export default router
