/**
 * Notification Routes
 * 
 * User notification endpoints.
 */

import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/helpers';

const router = Router();

/**
 * All notification routes require authentication
 */
router.use(authenticate);

// GET /api/v1/notifications/unread/count - Get unread notification count
router.get('/unread/count', asyncHandler(notificationController.getUnreadCount));

// GET /api/v1/notifications/recent - Get recent notifications
router.get('/recent', asyncHandler(notificationController.getRecentNotifications));

// PATCH /api/v1/notifications/read-all - Mark all as read
router.patch('/read-all', asyncHandler(notificationController.markAllAsRead));

// GET /api/v1/notifications - Get user notifications with pagination
router.get('/', asyncHandler(notificationController.getNotifications));

// GET /api/v1/notifications/:notificationId - Get notification by ID
router.get('/:notificationId', asyncHandler(notificationController.getNotificationById));

// PATCH /api/v1/notifications/:notificationId/read - Mark as read
router.patch('/:notificationId/read', asyncHandler(notificationController.markAsRead));

// PATCH /api/v1/notifications/:notificationId/unread - Mark as unread
router.patch('/:notificationId/unread', asyncHandler(notificationController.markAsUnread));

// DELETE /api/v1/notifications/:notificationId - Delete notification
router.delete('/:notificationId', asyncHandler(notificationController.deleteNotification));

// DELETE /api/v1/notifications - Delete all notifications
router.delete('/', asyncHandler(notificationController.deleteAllNotifications));

export default router;
