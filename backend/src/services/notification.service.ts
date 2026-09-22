// Notification Service

import { notificationRepository } from '../repositories/notification.repository';
import { NotificationType } from '@prisma/client';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { emailService } from './email.service';
import logger from '../config/logger';

export const notificationService = {
  //  Create a notification
  
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
    sendEmail?: boolean;
  }) {
    const { userId, type, title, message, metadata, sendEmail = false } = data;

    // Create in-app notification
    const notification = await notificationRepository.create({
      userId,
      type,
      title,
      message,
      metadata,
    });

    // Send email notification if requested
    if (sendEmail) {
      try {
        await emailService.sendNotificationEmail(userId, {
          type,
          title,
          message,
          metadata,
        });
      } catch (error) {
        logger.error('Failed to send notification email:', error);
        // Don't fail the notification creation if email fails
      }
    }

    return notification;
  },
//  Get user notifications with pagination
  async getUserNotifications(
    userId: string,
    options: {
      read?: boolean;
      type?: NotificationType;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { read, type, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const result = await notificationRepository.findByUser(userId, {
      read,
      type,
      skip,
      limit,
    });

    const pages = Math.ceil(result.total / limit);

    return {
      notifications: result.notifications,
      pagination: {
        page,
        limit,
        total: result.total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  },
// Get notification by ID
  async getNotificationById(notificationId: string, userId: string) {
    const notification = await notificationRepository.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Notification');
    }

    // Check ownership
    if (notification.userId !== userId) {
      throw new AuthorizationError('You can only access your own notifications');
    }

    return notification;
  },
//  Get unread notification count
  async getUnreadCount(userId: string) {
    const count = await notificationRepository.getUnreadCount(userId);
    return { unreadCount: count };
  },
// Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.getNotificationById(notificationId, userId);
    
    if (notification.read) {
      return notification; // Already read
    }

    return notificationRepository.markAsRead(notificationId);
  },
// Mark all notifications as read
  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  },
//  Mark notification as unread
  async markAsUnread(notificationId: string, userId: string) {
    const notification = await this.getNotificationById(notificationId, userId);
    
    if (!notification.read) {
      return notification; // Already unread
    }

    return notificationRepository.markAsUnread(notificationId);
  },
// Delete a notification
  async deleteNotification(notificationId: string, userId: string) {
    await this.getNotificationById(notificationId, userId);
    await notificationRepository.delete(notificationId);
    return { message: 'Notification deleted successfully' };
  },
//  Delete all notifications for a user
  async deleteAllNotifications(userId: string) {
    await notificationRepository.deleteAllForUser(userId);
    return { message: 'All notifications deleted successfully' };
  },
// Get recent notifications
  async getRecentNotifications(userId: string, limit: number = 10) {
    const notifications = await notificationRepository.getRecent(userId, limit);
    return { notifications };
  },

  // Notification Creators for Specific Events

// Order created notification
  async notifyOrderCreated(userId: string, orderId: string, orderNumber: string) {
    return this.createNotification({
      userId,
      type: NotificationType.ORDER_CREATED,
      title: 'Order Created',
      message: `Your order #${orderNumber} has been created successfully.`,
      metadata: { orderId },
      sendEmail: true,
    });
  },
// Order confirmed notification
  async notifyOrderConfirmed(userId: string, orderId: string, orderNumber: string) {
    return this.createNotification({
      userId,
      type: NotificationType.ORDER_CONFIRMED,
      title: 'Order Confirmed',
      message: `Your order #${orderNumber} has been confirmed and is being prepared.`,
      metadata: { orderId },
      sendEmail: true,
    });
  },
// Order shipped notification
  async notifyOrderShipped(userId: string, orderId: string, orderNumber: string) {
    return this.createNotification({
      userId,
      type: NotificationType.ORDER_SHIPPED,
      title: 'Order Shipped',
      message: `Your order #${orderNumber} has been shipped and is on its way!`,
      metadata: { orderId },
      sendEmail: true,
    });
  },
// Order delivered notification
  async notifyOrderDelivered(userId: string, orderId: string, orderNumber: string) {
    return this.createNotification({
      userId,
      type: NotificationType.ORDER_DELIVERED,
      title: 'Order Delivered',
      message: `Your order #${orderNumber} has been delivered. Enjoy your purchase!`,
      metadata: { orderId },
      sendEmail: true,
    });
  },
// Order cancelled notification
  async notifyOrderCancelled(userId: string, orderId: string, orderNumber: string) {
    return this.createNotification({
      userId,
      type: NotificationType.ORDER_CANCELLED,
      title: 'Order Cancelled',
      message: `Your order #${orderNumber} has been cancelled.`,
      metadata: { orderId },
      sendEmail: true,
    });
  },
// Payment confirmed notification
  async notifyPaymentConfirmed(userId: string, orderId: string, amount: number) {
    return this.createNotification({
      userId,
      type: NotificationType.PAYMENT_CONFIRMED,
      title: 'Payment Confirmed',
      message: `Your payment of ${amount} ETB has been confirmed.`,
      metadata: { orderId, amount },
      sendEmail: true,
    });
  },
// Payment failed notification
  async notifyPaymentFailed(userId: string, orderId: string, reason?: string) {
    return this.createNotification({
      userId,
      type: NotificationType.PAYMENT_FAILED,
      title: 'Payment Failed',
      message: `Your payment failed. ${reason || 'Please try again.'}`,
      metadata: { orderId, reason },
      sendEmail: true,
    });
  },
// Low stock notification (for sellers)
  async notifyLowStock(sellerId: string, productId: string, productName: string, currentStock: number) {
    return this.createNotification({
      userId: sellerId,
      type: NotificationType.LOW_STOCK,
      title: 'Low Stock Alert',
      message: `${productName} is running low on stock (${currentStock} units remaining).`,
      metadata: { productId, currentStock },
      sendEmail: true,
    });
  },
// New review notification (for sellers)
  async notifyNewReview(
    sellerId: string,
    productId: string,
    productName: string,
    rating: number,
    reviewId: string
  ) {
    return this.createNotification({
      userId: sellerId,
      type: NotificationType.NEW_REVIEW,
      title: 'New Review Received',
      message: `${productName} received a new ${rating}-star review.`,
      metadata: { productId, reviewId, rating },
      sendEmail: true,
    });
  },
//  Account verification notification
  async notifyAccountVerification(userId: string, email: string) {
    return this.createNotification({
      userId,
      type: NotificationType.ACCOUNT_VERIFICATION,
      title: 'Verify Your Account',
      message: `Please verify your email address (${email}) to activate your account.`,
      metadata: { email },
      sendEmail: false, // Email sent separately via auth flow
    });
  },
// Password reset notification
  async notifyPasswordReset(userId: string) {
    return this.createNotification({
      userId,
      type: NotificationType.PASSWORD_RESET,
      title: 'Password Reset Request',
      message: 'A password reset was requested for your account. If this wasn\'t you, please secure your account.',
      metadata: {},
      sendEmail: false, // Email sent separately via auth flow
    });
  },
// Bulk notify sellers about their orders
  async notifySellerNewOrder(
    sellerUserIds: string[],
    orderId: string,
    orderNumber: string
  ) {
    const notifications = sellerUserIds.map((userId) => ({
      userId,
      type: NotificationType.ORDER_CREATED,
      title: 'New Order Received',
      message: `You have a new order #${orderNumber}.`,
      metadata: { orderId },
    }));

    await notificationRepository.createMany(notifications);

    // Send emails asynchronously
    for (const userId of sellerUserIds) {
      emailService.sendNotificationEmail(userId, {
        type: NotificationType.ORDER_CREATED,
        title: 'New Order Received',
        message: `You have a new order #${orderNumber}.`,
        metadata: { orderId },
      }).catch((error) => {
        logger.error(`Failed to send email to seller ${userId}:`, error);
      });
    }
  },
};
