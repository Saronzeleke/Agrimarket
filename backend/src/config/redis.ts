/**
 * Redis Configuration
 * 
 * Redis client setup for caching and session management.
 * Now includes graceful degradation and error handling.
 */

import Redis from 'ioredis';
import config from './env';
import logger from './logger';

/**
 * Redis client instance
 */
let redisClient: Redis | null = null;

/**
 * Initialize Redis connection
 */
export const initRedis = (): Redis => {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      db: config.redis.db,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    // Event listeners
    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('ready', () => {
      logger.info('Redis ready to accept commands');
    });

    redisClient.on('error', (error) => {
      // Log error but don't throw - allow graceful degradation
      logger.error('Redis connection error', { error: error.message });
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });

    return redisClient;
  } catch (error) {
    // Log error but don't throw - allow application to continue
    logger.error('Failed to initialize Redis', { error });
    logger.warn('Application will continue without Redis cache');
    return null as any; // Return null to signal Redis unavailable
  }
};

/**
 * Get Redis client instance
 */
export const getRedisClient = (): Redis | null => {
  return redisClient;
};

/**
 * Close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection', { error });
    }
  }
};

/**
 * Check if Redis is connected
 */
export const isRedisConnected = (): boolean => {
  return redisClient?.status === 'ready';
};

/**
 * Ping Redis to check connection
 */
export const pingRedis = async (): Promise<boolean> => {
  try {
    if (!redisClient) {
      return false;
    }
    const result = await redisClient.ping();
    return result === 'PONG';
  } catch (error) {
    logger.warn('Redis ping failed, continuing without cache', { error });
    return false;
  }
};

export default {
  initRedis,
  getRedisClient,
  closeRedis,
  isRedisConnected,
  pingRedis,
};
