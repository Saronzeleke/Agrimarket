/**
 * Seller Routes
 * 
 * Seller dashboard endpoints.
 */

import { Router } from 'express'
import productController from '../controllers/product.controller'
import { sellerOrderController } from '../controllers/seller-order.controller'
import { inventoryController } from '../controllers/inventory.controller'
import { sellerAnalyticsController } from '../controllers/seller-analytics.controller'
import { reviewController } from '../controllers/review.controller'
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

/**
 * Inventory management
 */

// GET /api/v1/seller/inventory/stats - Get inventory statistics
router.get('/inventory/stats', asyncHandler(inventoryController.getStats))

// GET /api/v1/seller/inventory/low-stock - Get low stock products
router.get('/inventory/low-stock', asyncHandler(inventoryController.getLowStockProducts))

// GET /api/v1/seller/inventory/out-of-stock - Get out of stock products
router.get('/inventory/out-of-stock', asyncHandler(inventoryController.getOutOfStockProducts))

// POST /api/v1/seller/inventory/bulk-add - Bulk add stock
router.post('/inventory/bulk-add', asyncHandler(inventoryController.bulkAddStock))

// GET /api/v1/seller/inventory/product/:productId - Get inventory for product
router.get('/inventory/product/:productId', asyncHandler(inventoryController.getInventory))

// PATCH /api/v1/seller/inventory/:inventoryId - Update inventory
router.patch('/inventory/:inventoryId', asyncHandler(inventoryController.updateInventory))

// POST /api/v1/seller/inventory/:inventoryId/add - Add stock
router.post('/inventory/:inventoryId/add', asyncHandler(inventoryController.addStock))

// POST /api/v1/seller/inventory/:inventoryId/adjust - Adjust stock
router.post('/inventory/:inventoryId/adjust', asyncHandler(inventoryController.adjustStock))

// GET /api/v1/seller/inventory/:inventoryId/history - Get inventory history
router.get('/inventory/:inventoryId/history', asyncHandler(inventoryController.getHistory))

/**
 * Reviews & Ratings
 */

// GET /api/v1/seller/reviews - Get seller's product reviews
router.get('/reviews', asyncHandler(reviewController.getSellerReviews))

// POST /api/v1/seller/reviews/:reviewId/respond - Respond to a review
router.post('/reviews/:reviewId/respond', asyncHandler(reviewController.addSellerResponse))

/**
 * Analytics & Dashboard
 */

// GET /api/v1/seller/analytics/dashboard - Get dashboard overview
router.get('/analytics/dashboard', asyncHandler(sellerAnalyticsController.getDashboardOverview))

// GET /api/v1/seller/analytics/sales - Get sales over time
router.get('/analytics/sales', asyncHandler(sellerAnalyticsController.getSalesOverTime))

// GET /api/v1/seller/analytics/products - Get product performance
router.get('/analytics/products', asyncHandler(sellerAnalyticsController.getProductPerformance))

// GET /api/v1/seller/analytics/revenue - Get revenue by category
router.get('/analytics/revenue', asyncHandler(sellerAnalyticsController.getRevenueByCategory))

// GET /api/v1/seller/analytics/customers - Get customer insights
router.get('/analytics/customers', asyncHandler(sellerAnalyticsController.getCustomerInsights))

// GET /api/v1/seller/analytics/activity - Get recent activity
router.get('/analytics/activity', asyncHandler(sellerAnalyticsController.getRecentActivity))

export default router
