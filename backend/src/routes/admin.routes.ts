import { Router } from 'express';
import { adminOrderController } from '../controllers/admin-order.controller';
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

export default router;
