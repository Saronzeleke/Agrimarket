import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/helpers';

const router = Router();

/**
 * All order routes require authentication
 */

// Get order statistics (must be before /:orderId)
router.get('/stats', authenticate, asyncHandler(orderController.getOrderStats));

// Get order by order number (must be before /:orderId)
router.get('/number/:orderNumber', authenticate, asyncHandler(orderController.getOrderByNumber));

// Get all orders
router.get('/', authenticate, asyncHandler(orderController.getOrders));

// Get order by ID
router.get('/:orderId', authenticate, asyncHandler(orderController.getOrder));

// Cancel order
router.post('/:orderId/cancel', authenticate, asyncHandler(orderController.cancelOrder));

export default router;
