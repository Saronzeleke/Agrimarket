//Tracks request performance and logs slow requests.

import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import cacheService from '../services/cache.service';
// Performance metrics interface

interface PerformanceMetrics {
  totalRequests: number;
  totalDuration: number;
  avgDuration: number;
  slowRequests: number;
  errorRequests: number;
  lastReset: string;
}
// Request performance tracking middleware
 
export const performanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  // Track response
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage().heapUsed;
    const memoryDelta = endMemory - startMemory;

    // Log slow requests (>1 second)
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration,
        status: res.statusCode,
        memory: Math.round(memoryDelta / 1024 / 1024 * 100) / 100, // MB
      });
    }

    // Log errors
    if (res.statusCode >= 500) {
      logger.error('Server error request', {
        method: req.method,
        url: req.url,
        duration,
        status: res.statusCode,
      });
    }

    // Update metrics
    try {
      await updateMetrics({
        duration,
        isError: res.statusCode >= 500,
        isSlow: duration > 1000,
      });
    } catch (error) {
      logger.error('Failed to update performance metrics', { error });
    }
  });

  next();
};
//Update performance metrics in cache
 
async function updateMetrics(data: {
  duration: number;
  isError: boolean;
  isSlow: boolean;
}): Promise<void> {
  if (!cacheService.isEnabled()) {
    return;
  }

  try {
    // Get current metrics
    let metrics = await cacheService.get<PerformanceMetrics>('metrics:performance');

    if (!metrics) {
      metrics = {
        totalRequests: 0,
        totalDuration: 0,
        avgDuration: 0,
        slowRequests: 0,
        errorRequests: 0,
        lastReset: new Date().toISOString(),
      };
    }

    // Update metrics
    metrics.totalRequests++;
    metrics.totalDuration += data.duration;
    metrics.avgDuration = Math.round(metrics.totalDuration / metrics.totalRequests);

    if (data.isSlow) {
      metrics.slowRequests++;
    }

    if (data.isError) {
      metrics.errorRequests++;
    }

    // Save metrics (TTL: 1 hour)
    await cacheService.set('metrics:performance', metrics, 3600);
  } catch (error) {
    logger.error('Failed to update metrics', { error });
  }
}
// Get performance metrics

export async function getPerformanceMetrics(): Promise<PerformanceMetrics | null> {
  try {
    return await cacheService.get<PerformanceMetrics>('metrics:performance');
  } catch (error) {
    logger.error('Failed to get performance metrics', { error });
    return null;
  }
}
// Reset performance metrics
 
export async function resetPerformanceMetrics(): Promise<void> {
  try {
    await cacheService.del('metrics:performance');
  } catch (error) {
    logger.error('Failed to reset performance metrics', { error });
  }
}
// Get system health metrics
 
export async function getSystemHealthMetrics() {
  const memory = process.memoryUsage();
  const uptime = process.uptime();
  const cacheStats = await cacheService.getStats();
  const perfMetrics = await getPerformanceMetrics();

  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(uptime),
    memory: {
      total: Math.round(memory.heapTotal / 1024 / 1024), // MB
      used: Math.round(memory.heapUsed / 1024 / 1024), // MB
      external: Math.round(memory.external / 1024 / 1024), // MB
      rss: Math.round(memory.rss / 1024 / 1024), // MB
    },
    cpu: {
      usage: process.cpuUsage(),
    },
    cache: {
      connected: cacheStats.connected,
      keys: cacheStats.keys,
      memory: cacheStats.memory,
      hitRate: cacheStats.hits + cacheStats.misses > 0
        ? Math.round((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100)
        : 0,
    },
    performance: perfMetrics || {
      totalRequests: 0,
      avgDuration: 0,
      slowRequests: 0,
      errorRequests: 0,
    },
  };
}

export default {
  performanceMiddleware,
  getPerformanceMetrics,
  resetPerformanceMetrics,
  getSystemHealthMetrics,
};
