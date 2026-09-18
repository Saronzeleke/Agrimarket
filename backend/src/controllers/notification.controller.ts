/**
 * Notification Controller
 * 
 * Handles user notification endpoints.
 */

import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { getNotificationsSchema } from '../validators/notification.validator';
import { sendSuccess } from '../utils/response';
import { ValidationError } from '../utils/errors';

export const notificationController = {
  /**
   * Get user notifications
   * GET /api/v1/notifications
   */
  async getNotifications(req: Request, res: Response) {
    const userId = req.user!.id;
    const validation = getNotificationsSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const result = await notificationService.getUserNotifications(userId, validation.data);

    return sendSuccess(res, result);
  },

  /**
   * Get notification by ID
   * GET /api/v1/notifications/:notificationId
   */
  async getNotificationById(req: Request, res: Response) {
    const { notificationId } = req.params;
    const userId = req.user!.id;

    const notification = await notificationService.getNotificationById(notificationId, userId);

    return sendSuccess(res, { notification });
  },

  /**
   * Get unread notification count
   * GET /api/v1/notifications/unread/count
   */
  async getUnreadCount(req: Request, res: Response) {
    const userId = req.user!.id;
    const result = await notificationService.getUnreadCount(userId);

    return sendSuccess(res, result);
  },

  /**
   * Get recent notifications
   * GET /api/v1/notifications/recent
   */
  async getRecentNotifications(req: Request, res: Response) {
    const userId = req.user!.id;
    const { limit } = req.query;

    const result = await notificationService.getRecentNotifications(
      userId,
      limit ? parseInt(limit as string) : undefined
    );

    return sendSuccess(res, result);
  },

  /**
   * Mark notification as read
   * PATCH /api/v1/notifications/:notificationId/read
   */
  async markAsRead(req: Request, res: Response) {
    const { notificationId } = req.params;
    const userId = req.user!.id;

    const notification = await notificationService.markAsRead(notificationId, userId);

    return sendSuccess(res, { notification });
  },

  /**
   * Mark all notifications as read
   * PATCH /api/v1/notifications/read-all
   */
  async markAllAsRead(req: Request, res: Response) {
    const userId = req.user!.id;
    const result = await notificationService.markAllAsRead(userId);

    return sendSuccess(res, result);
  },

  /**
   * Mark notification as unread
   * PATCH /api/v1/notifications/:notificationId/unread
   */
  async markAsUnread(req: Request, res: Response) {
    const { notificationId } = req.params;
    const userId = req.user!.id;

    const notification = await notificationService.markAsUnread(notificationId, userId);

    return sendSuccess(res, { notification });
  },

  /**
   * Delete notification
   * DELETE /api/v1/notifications/:notificationId
   */
  async deleteNotification(req: Request, res: Response) {
    const { notificationId } = req.params;
    const userId = req.user!.id;

    const result = await notificationService.deleteNotification(notificationId, userId);

    return sendSuccess(res, result);
  },

  /**
   * Delete all notifications
   * DELETE /api/v1/notifications
   */
  async deleteAllNotifications(req: Request, res: Response) {
    const userId = req.user!.id;
    const result = await notificationService.deleteAllNotifications(userId);

    return sendSuccess(res, result);
  },
};
