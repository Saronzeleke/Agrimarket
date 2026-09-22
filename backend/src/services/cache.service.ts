/**
 * Cache Service
 * 
 * Provides caching functionality using Redis with fallback support.
 */
import { Redis } from 'ioredis';
import { getRedisClient } from '../config/redis';
import config from '../config/env';
import logger from '../config/logger';

export class CacheService {
  private redis: Redis | null;
  private prefix: string = 'agrimarket:';
  private enabled: boolean;

  constructor() {
    this.redis = getRedisClient();
    this.enabled = config.cache.enabled && this.redis !== null;
  }
// Check if cache is enabled and connected
  isEnabled(): boolean {
    return this.enabled && this.redis?.status === 'ready';
  }
// Generate cache key with prefix
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }
// Get value from cache
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const value = await this.redis!.get(this.getKey(key));
      
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }
// Set value in cache with TTL
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      const expiry = ttl || config.redis.ttl;

      await this.redis!.setex(this.getKey(key), expiry, serialized);
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error });
      return false;
    }
  }
// Delete key from cache
  async del(key: string): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      await this.redis!.del(this.getKey(key));
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error });
      return false;
    }
  }
// Delete multiple keys matching pattern
  async delPattern(pattern: string): Promise<number> {
    if (!this.isEnabled()) {
      return 0;
    }

    try {
      const keys = await this.redis!.keys(this.getKey(pattern));
      
      if (keys.length === 0) {
        return 0;
      }

      await this.redis!.del(...keys);
      return keys.length;
    } catch (error) {
      logger.error('Cache delete pattern error', { pattern, error });
      return 0;
    }
  }
// Check if key exists in cache
  async exists(key: string): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      const result = await this.redis!.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error });
      return false;
    }
  }
// Get or set pattern - get from cache or execute function and cache result
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      logger.debug('Cache hit', { key });
      return cached;
    }

    logger.debug('Cache miss', { key });

    // Execute function to get fresh data
    const freshData = await fetchFn();

    // Cache the result
    await this.set(key, freshData, ttl);

    return freshData;
  }
// Increment counter
  async increment(key: string, amount: number = 1): Promise<number> {
    if (!this.isEnabled()) {
      return 0;
    }

    try {
      const result = await this.redis!.incrby(this.getKey(key), amount);
      return result;
    } catch (error) {
      logger.error('Cache increment error', { key, error });
      return 0;
    }
  }
// Decrement counter
  async decrement(key: string, amount: number = 1): Promise<number> {
    if (!this.isEnabled()) {
      return 0;
    }

    try {
      const result = await this.redis!.decrby(this.getKey(key), amount);
      return result;
    } catch (error) {
      logger.error('Cache decrement error', { key, error });
      return 0;
    }
  }
// Add item to sorted set with score
  async zadd(key: string, score: number, member: string): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      await this.redis!.zadd(this.getKey(key), score, member);
      return true;
    } catch (error) {
      logger.error('Cache zadd error', { key, error });
      return false;
    }
  }
//  Get top N members from sorted set (highest scores)
  async zrevrange(key: string, start: number = 0, stop: number = -1): Promise<string[]> {
    if (!this.isEnabled()) {
      return [];
    }

    try {
      const result = await this.redis!.zrevrange(this.getKey(key), start, stop);
      return result;
    } catch (error) {
      logger.error('Cache zrevrange error', { key, error });
      return [];
    }
  }
// Get cache statistics
  async getStats(): Promise<{
    connected: boolean;
    keys: number;
    memory: string;
    hits: number;
    misses: number;
  }> {
    if (!this.isEnabled()) {
      return {
        connected: false,
        keys: 0,
        memory: '0',
        hits: 0,
        misses: 0,
      };
    }

    try {
      const info = await this.redis!.info('stats');
      const dbSize = await this.redis!.dbsize();
      const memory = await this.redis!.info('memory');

      // Parse info string
      const parseInfo = (infoStr: string, key: string): number => {
        const match = infoStr.match(new RegExp(`${key}:(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      };

      const parseMemory = (memStr: string): string => {
        const match = memStr.match(/used_memory_human:([^\r\n]+)/);
        return match ? match[1].trim() : '0';
      };

      return {
        connected: true,
        keys: dbSize,
        memory: parseMemory(memory),
        hits: parseInfo(info, 'keyspace_hits'),
        misses: parseInfo(info, 'keyspace_misses'),
      };
    } catch (error) {
      logger.error('Cache stats error', { error });
      return {
        connected: false,
        keys: 0,
        memory: '0',
        hits: 0,
        misses: 0,
      };
    }
  }
// Clear all cache keys with prefix
  async clear(): Promise<number> {
    return this.delPattern('*');
  }
// Set hash field
  async hset(key: string, field: string, value: any): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.redis!.hset(this.getKey(key), field, serialized);
      return true;
    } catch (error) {
      logger.error('Cache hset error', { key, field, error });
      return false;
    }
  }
// Get hash field
  async hget<T>(key: string, field: string): Promise<T | null> {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const value = await this.redis!.hget(this.getKey(key), field);
      
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache hget error', { key, field, error });
      return null;
    }
  }
// Get all hash fields
  async hgetall<T>(key: string): Promise<Record<string, T>> {
    if (!this.isEnabled()) {
      return {};
    }

    try {
      const hash = await this.redis!.hgetall(this.getKey(key));
      const result: Record<string, T> = {};

      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value) as T;
        } catch {
          result[field] = value as any;
        }
      }

      return result;
    } catch (error) {
      logger.error('Cache hgetall error', { key, error });
      return {};
    }
  }
// Delete hash field
  async hdel(key: string, field: string): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      await this.redis!.hdel(this.getKey(key), field);
      return true;
    } catch (error) {
      logger.error('Cache hdel error', { key, field, error });
      return false;
    }
  }

  // Set expiry on key
  async expire(key: string, seconds: number): Promise<boolean> {
    if (!this.isEnabled()) {
      return false;
    }

    try {
      await this.redis!.expire(this.getKey(key), seconds);
      return true;
    } catch (error) {
      logger.error('Cache expire error', { key, error });
      return false;
    }
  }

  // Get time to live for key
 
  async ttl(key: string): Promise<number> {
    if (!this.isEnabled()) {
      return -1;
    }

    try {
      const result = await this.redis!.ttl(this.getKey(key));
      return result;
    } catch (error) {
      logger.error('Cache ttl error', { key, error });
      return -1;
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
export default cacheService;
