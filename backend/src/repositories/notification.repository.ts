/**
 * Notification Repository
 * 
 * Database operations for user notifications.
 */

import prisma from '../config/database';
import { NotificationType, Prisma } from '@prisma/client';

export const notificationRepository = {
  /**
   * Create a new notification
   */
  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
      },
    });
  },

  /**
   * Create multiple notifications (bulk)
   */
  async createMany(notifications: Array<{
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: any;
  }>) {
    return prisma.notification.createMany({
      data: notifications.map((n) => ({
        userId: n.userId,
        type: n.type,
        title: n.title,
        message: n.message,
        metadata: n.metadata || {},
      })),
    });
  },

  /**
   * Get notifications for a user with pagination
   */
  async findByUser(
    userId: string,
    options: {
      read?: boolean;
      type?: NotificationType;
      skip?: number;
      limit?: number;
    } = {}
  ) {
    const { read, type, skip = 0, limit = 20 } = options;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(read !== undefined && { read }),
      ...(type && { type }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { notifications, total };
  },

  /**
   * Get notification by ID
   */
  async findById(id: string) {
    return prisma.notification.findUnique({
      where: { id },
    });
  },

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });
  },

  /**
   * Mark notification as unread
   */
  async markAsUnread(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { read: false },
    });
  },

  /**
   * Delete a notification
   */
  async delete(id: string) {
    return prisma.notification.delete({
      where: { id },
    });
  },

  /**
   * Delete all notifications for a user
   */
  async deleteAllForUser(userId: string) {
    return prisma.notification.deleteMany({
      where: { userId },
    });
  },

  /**
   * Delete old read notifications (cleanup)
   */
  async deleteOldReadNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return prisma.notification.deleteMany({
      where: {
        read: true,
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
  },

  /**
   * Get recent notifications for a user
   */
  async getRecent(userId: string, limit: number = 10) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  /**
   * Check if user has unread notifications
   */
  async hasUnread(userId: string): Promise<boolean> {
    const count = await this.getUnreadCount(userId);
    return count > 0;
  },

  /**
   * Get notifications by type for a user
   */
  async findByType(userId: string, type: NotificationType, limit: number = 20) {
    return prisma.notification.findMany({
      where: {
        userId,
        type,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },
};
