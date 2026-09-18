import { Router } from 'express';
import { adminOrderController } from '../controllers/admin-order.controller';
import { adminAnalyticsController } from '../controllers/admin-analytics.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/rbac.middleware';
import { asyncHandler } from '../utils/helpers';

const router = Router();

/**
 * All admin routes require authentication and admin role
 */
router.use(authenticate);
router.use(requireAdmin);

/**
 * Order management
 */

// GET /api/v1/admin/orders/stats/platform - Get platform statistics
router.get('/orders/stats/platform', asyncHandler(adminOrderController.getPlatformStats));

// GET /api/v1/admin/orders/recent - Get recent orders
router.get('/orders/recent', asyncHandler(adminOrderController.getRecentOrders));

// POST /api/v1/admin/orders/bulk-update-status - Bulk update order statuses
router.post('/orders/bulk-update-status', asyncHandler(adminOrderController.bulkUpdateStatus));

// GET /api/v1/admin/orders - Get all orders
router.get('/orders', asyncHandler(adminOrderController.getAllOrders));

// GET /api/v1/admin/orders/:orderId - Get order details
router.get('/orders/:orderId', asyncHandler(adminOrderController.getOrderDetails));

// PATCH /api/v1/admin/orders/:orderId/status - Update order status
router.patch('/orders/:orderId/status', asyncHandler(adminOrderController.updateOrderStatus));

/**
 * Analytics & Dashboard
 */

// GET /api/v1/admin/analytics/overview - Get platform overview
router.get('/analytics/overview', asyncHandler(adminAnalyticsController.getPlatformOverview));

// GET /api/v1/admin/analytics/sales - Get sales analytics over time
router.get('/analytics/sales', asyncHandler(adminAnalyticsController.getSalesAnalytics));

// GET /api/v1/admin/analytics/top-sellers - Get top performing sellers
router.get('/analytics/top-sellers', asyncHandler(adminAnalyticsController.getTopSellers));

// GET /api/v1/admin/analytics/revenue-by-category - Get revenue by category
router.get('/analytics/revenue-by-category', asyncHandler(adminAnalyticsController.getRevenueByCategory));

// GET /api/v1/admin/analytics/user-growth - Get user growth analytics
router.get('/analytics/user-growth', asyncHandler(adminAnalyticsController.getUserGrowth));

// GET /api/v1/admin/analytics/activity - Get platform activity feed
router.get('/analytics/activity', asyncHandler(adminAnalyticsController.getPlatformActivity));

// GET /api/v1/admin/analytics/demographics - Get user demographics
router.get('/analytics/demographics', asyncHandler(adminAnalyticsController.getUserDemographics));

// GET /api/v1/admin/analytics/payment-methods - Get payment method analytics
router.get('/analytics/payment-methods', asyncHandler(adminAnalyticsController.getPaymentMethodAnalytics));

export default router;
