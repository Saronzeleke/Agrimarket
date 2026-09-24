//Middleware for caching HTTP responses.

import { Request, Response, NextFunction } from 'express';
import cacheService from '../services/cache.service';
import logger from '../config/logger';

/**
 * Cache middleware factory, Caches GET requests only
 */
export const cacheMiddleware = (ttl?: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip cache if disabled
    if (!cacheService.isEnabled()) {
      return next();
    }

    // Generate cache key from URL and query params
    const cacheKey = `response:${req.originalUrl || req.url}`;

    try {
      // Try to get cached response
      const cachedResponse = await cacheService.get<{
        status: number;
        data: any;
      }>(cacheKey);

      if (cachedResponse) {
        logger.debug('Cache hit for response', { url: req.url });
        return res.status(cachedResponse.status).json(cachedResponse.data);
      }

      // Cache miss - intercept response
      const originalJson = res.json.bind(res);

      res.json = function (data: any) {
        // Cache the response
        cacheService.set(
          cacheKey,
          {
            status: res.statusCode,
            data,
          },
          ttl
        ).catch((error) => {
          logger.error('Failed to cache response', { url: req.url, error });
        });

        // Send response
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error', { url: req.url, error });
      next();
    }
  };
};

/**
 * Cache invalidation middleware, Invalidates cache on write operations (POST, PUT, PATCH, DELETE)
 */
export const invalidateCacheMiddleware = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only invalidate on write operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    // Intercept response to invalidate after successful operation
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      // Invalidate cache if response was successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.delPattern(pattern).catch((error) => {
          logger.error('Failed to invalidate cache', { pattern, error });
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * User-specific cache middleware, Caches data per user (requires authentication)
 */
export const userCacheMiddleware = (ttl?: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Require authentication
    if (!req.user?.id) {
      return next();
    }

    // Skip cache if disabled
    if (!cacheService.isEnabled()) {
      return next();
    }

    // Generate user-specific cache key
    const cacheKey = `user:${req.user.id}:response:${req.originalUrl || req.url}`;

    try {
      // Try to get cached response
      const cachedResponse = await cacheService.get<{
        status: number;
        data: any;
      }>(cacheKey);

      if (cachedResponse) {
        logger.debug('User cache hit', { userId: req.user.id, url: req.url });
        return res.status(cachedResponse.status).json(cachedResponse.data);
      }

      // Cache miss - intercept response
      const originalJson = res.json.bind(res);

      res.json = function (data: any) {
        // Cache the response
        cacheService.set(
          cacheKey,
          {
            status: res.statusCode,
            data,
          },
          ttl
        ).catch((error) => {
          logger.error('Failed to cache user response', {
            userId: req.user?.id,
            url: req.url,
            error,
          });
        });

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('User cache middleware error', {
        userId: req.user?.id,
        url: req.url,
        error,
      });
      next();
    }
  };
};
// Invalidate user-specific cache

export const invalidateUserCacheMiddleware = (userId?: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only invalidate on write operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    const targetUserId = userId || req.user?.id;

    if (!targetUserId) {
      return next();
    }

    // Intercept response to invalidate after successful operation
    const originalJson = res.json.bind(res);

    res.json = function (data: any) {
      // Invalidate cache if response was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheService.delPattern(`user:${targetUserId}:*`).catch((error) => {
          logger.error('Failed to invalidate user cache', {
            userId: targetUserId,
            error,
          });
        });
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Cache control headers middleware
 * Sets appropriate cache headers for client-side caching
 */
export const cacheControlMiddleware = (maxAge: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only set cache headers for GET requests
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
      res.set('Vary', 'Accept-Encoding');
    } else {
      res.set('Cache-Control', 'no-store');
    }

    next();
  };
};

export default {
  cacheMiddleware,
  invalidateCacheMiddleware,
  userCacheMiddleware,
  invalidateUserCacheMiddleware,
  cacheControlMiddleware,
};
