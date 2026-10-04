/**
 * Audit Log Repository
 * Database operations for audit logging
 */

import prisma from '../config/database';
import { AuditLog } from '@prisma/client';
import logger from '../config/logger';

export class AuditLogRepository {
  /**
   * Log a user action with context
   */
  async logUserAction(
    userId: string | null,
    action: string,
    entityType: string,
    entityId: string,
    details?: Record<string, any> | null,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog | null> {
    try {
      return await prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId,
          details: details || null,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        },
      });
    } catch (error) {
      // Log error but don't throw - audit logging should never break the application
      logger.error('Failed to create audit log', {
        action,
        entityType,
        entityId,
        error,
      });
      return null;
    }
  }

  /**
   * Get audit logs for a specific user
   */
  async findByUserId(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get audit logs for a specific entity
   */
  async findByEntity(
    entityType: string,
    entityId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get audit logs by action type
   */
  async findByAction(
    action: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: { action },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get recent audit logs (admin/security monitoring)
   */
  async findRecent(
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get audit logs within a date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLog[]> {
    return prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get audit logs count for a user
   */
  async countByUserId(userId: string): Promise<number> {
    return prisma.auditLog.count({
      where: { userId },
    });
  }

  /**
   * Get audit logs count for an action
   */
  async countByAction(action: string): Promise<number> {
    return prisma.auditLog.count({
      where: { action },
    });
  }
}

export default new AuditLogRepository();
