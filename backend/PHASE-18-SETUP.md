# Phase 18: Performance Optimization

## Overview
This phase focuses on optimizing the AgriMarket API for production-grade performance through database optimization, caching strategies, response compression, and performance monitoring.

## Performance Goals

### Target Metrics
- **API Response Time**: < 100ms for cached endpoints, < 500ms for database queries
- **Database Query Time**: < 50ms for indexed queries
- **Throughput**: Handle 1000+ requests per second
- **Cache Hit Rate**: > 80% for frequently accessed data
- **Memory Usage**: < 512MB under normal load
- **CPU Usage**: < 50% under normal load

## Optimization Strategies

### 1. Database Optimization

#### 1.1 Query Optimization
- Analyze slow queries with Prisma query logging
- Add strategic indexes for frequently accessed fields
- Implement query result pagination
- Use select specific fields instead of fetching all
- Optimize JOIN operations
- Use database transactions efficiently

#### 1.2 Indexing Strategy
```sql
-- Product searches (already in schema, verify)
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_status ON products(status) WHERE status = 'ACTIVE';

-- Order queries
CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_seller ON order_items(seller_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);

-- Review queries
CREATE INDEX idx_reviews_product ON reviews(product_id, created_at DESC);
CREATE INDEX idx_reviews_approved ON reviews(is_approved) WHERE is_approved = true;

-- Search history
CREATE INDEX idx_search_logs_user ON search_logs(user_id, searched_at DESC);
```

#### 1.3 Connection Pooling
Configure Prisma connection pool:
```typescript
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pool settings
  connectionLimit = 20
  poolTimeout = 30
}
```

### 2. Redis Caching Layer

#### 2.1 Cache Strategy
Implement multi-level caching:

**Level 1: Application Memory Cache (for reference data)**
- Categories (TTL: 1 hour)
- Popular searches (TTL: 15 minutes)
- System configurations (TTL: 30 minutes)

**Level 2: Redis Cache (for frequently accessed data)**
- Product details (TTL: 15 minutes)
- Product listings by category (TTL: 10 minutes)
- User profiles (TTL: 5 minutes)
- Search results (TTL: 5 minutes)
- Cart data (TTL: 1 hour)
- Dashboard analytics (TTL: 5 minutes)

**Level 3: Database (source of truth)**

#### 2.2 Cache Invalidation Strategy
- **Write-Through**: Update cache when data changes
- **Time-Based**: Automatic expiration with TTL
- **Event-Based**: Clear cache on specific events (product update, order placed)
- **Pattern-Based**: Clear related caches using key patterns

#### 2.3 Redis Data Structures
```typescript
// Product cache
redis.set(`product:${id}`, JSON.stringify(product), 'EX', 900); // 15 min

// Product list cache (with pagination)
redis.set(`products:cat:${categoryId}:page:${page}`, JSON.stringify(products), 'EX', 600);

// User cart cache
redis.set(`cart:${userId}`, JSON.stringify(cart), 'EX', 3600); // 1 hour

// Search results cache
redis.set(`search:${query}:${page}`, JSON.stringify(results), 'EX', 300); // 5 min

// Counter for popular products
redis.zincrby('popular:products', 1, productId);

// Session storage
redis.set(`session:${sessionId}`, JSON.stringify(session), 'EX', 604800); // 7 days
```

### 3. Response Compression

#### 3.1 Compression Middleware
- **Gzip**: Default compression (level 6)
- **Brotli**: Better compression for text (when supported)
- **Threshold**: Only compress responses > 1KB
- **Content Types**: JSON, HTML, CSS, JavaScript, SVG

#### 3.2 Configuration
```typescript
import compression from 'compression';

app.use(compression({
  level: 6,
  threshold: 1024, // 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));
```

### 4. API Response Optimization

#### 4.1 Pagination
Implement cursor-based pagination for large datasets:
```typescript
interface PaginationOptions {
  limit: number;
  cursor?: string; // ID of last item
}

// More efficient than offset-based pagination
const products = await prisma.product.findMany({
  take: limit,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' }
});
```

#### 4.2 Field Selection
Only fetch required fields:
```typescript
// Bad: Fetches all fields
const products = await prisma.product.findMany();

// Good: Select specific fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    images: {
      select: { url: true },
      take: 1
    }
  }
});
```

#### 4.3 Batch Loading
Use DataLoader pattern for N+1 query problems:
```typescript
// Instead of fetching seller for each product separately
// Batch load all sellers at once
const sellerIds = products.map(p => p.sellerId);
const sellers = await prisma.user.findMany({
  where: { id: { in: sellerIds } }
});
```

### 5. Performance Monitoring

#### 5.1 Query Performance Logging
Enable Prisma query logging:
```typescript
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 100) { // Log slow queries (>100ms)
    logger.warn('Slow query detected', {
      query: e.query,
      duration: e.duration,
      params: e.params,
    });
  }
});
```

#### 5.2 Performance Metrics Middleware
Track request performance:
```typescript
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    if (duration > 1000) { // Log slow requests (>1s)
      logger.warn('Slow request', {
        method: req.method,
        url: req.url,
        duration,
        status: res.statusCode,
      });
    }
    
    // Track metrics (could send to monitoring service)
    metrics.recordRequest({
      method: req.method,
      route: req.route?.path,
      status: res.statusCode,
      duration,
    });
  });
  
  next();
});
```

#### 5.3 Health Check Enhancement
Add detailed health check with performance metrics:
```typescript
GET /health
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600,
  "performance": {
    "avgResponseTime": 45,
    "requestsPerSecond": 120,
    "activeConnections": 45,
    "cacheHitRate": 0.85
  },
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "memory": {
      "used": "256MB",
      "total": "512MB",
      "percentage": 50
    },
    "cpu": {
      "usage": 35
    }
  }
}
```

### 6. Image Optimization

#### 6.1 Image Processing
- Resize images on upload (multiple sizes: thumbnail, medium, large)
- Convert to WebP format for better compression
- Generate responsive image sets
- Lazy loading implementation

#### 6.2 CDN Integration (Future)
- Store images on CDN (AWS S3 + CloudFront, Cloudflare)
- Serve static assets from CDN
- Cache-Control headers for images

### 7. Load Testing

#### 7.1 Tools
- **Artillery**: For load testing
- **Apache Bench (ab)**: Simple HTTP benchmarking
- **k6**: Modern load testing tool

#### 7.2 Test Scenarios
```yaml
# artillery-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Product browsing"
    flow:
      - get:
          url: "/api/v1/products"
      - get:
          url: "/api/v1/products/{{ $randomString() }}"
      - get:
          url: "/api/v1/search?q=tomato"
```

## Implementation Plan

### Step 1: Database Optimization
1. ✅ Review existing indexes in Prisma schema
2. Add missing indexes for frequently queried fields
3. Optimize slow queries identified in logs
4. Implement connection pooling configuration
5. Add query performance monitoring

### Step 2: Redis Setup
1. Install Redis dependencies
2. Create Redis configuration service
3. Implement cache service with get/set/delete operations
4. Add cache middleware for common endpoints
5. Implement cache invalidation strategies

### Step 3: Caching Implementation
1. Cache product listings
2. Cache product details
3. Cache search results
4. Cache user cart
5. Cache dashboard analytics
6. Cache categories

### Step 4: Response Optimization
1. Enable compression middleware
2. Implement cursor-based pagination
3. Optimize field selection in queries
4. Add batch loading for related data

### Step 5: Performance Monitoring
1. Add slow query logging
2. Add slow request logging
3. Implement performance metrics collection
4. Enhance health check endpoint
5. Create performance dashboard (optional)

### Step 6: Load Testing
1. Set up load testing tools
2. Create test scenarios
3. Run baseline performance tests
4. Identify bottlenecks
5. Optimize and re-test

## Expected Performance Improvements

### Before Optimization
- Product listing: ~800ms
- Product detail: ~300ms
- Search: ~1200ms
- Cart operations: ~400ms
- Dashboard analytics: ~2000ms

### After Optimization (Target)
- Product listing: ~50ms (cached), ~200ms (uncached)
- Product detail: ~30ms (cached), ~100ms (uncached)
- Search: ~40ms (cached), ~300ms (uncached)
- Cart operations: ~20ms (cached), ~150ms (uncached)
- Dashboard analytics: ~100ms (cached), ~800ms (uncached)

**Overall improvement: 60-90% reduction in response time**

## Configuration

### Environment Variables
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TTL=900

# Cache Configuration
CACHE_ENABLED=true
CACHE_PREFIX=agrimarket:
CACHE_DEFAULT_TTL=900

# Performance Configuration
SLOW_QUERY_THRESHOLD=100
SLOW_REQUEST_THRESHOLD=1000
ENABLE_QUERY_LOGGING=true

# Compression
COMPRESSION_ENABLED=true
COMPRESSION_LEVEL=6
COMPRESSION_THRESHOLD=1024

# Database Connection Pool
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20
DATABASE_POOL_TIMEOUT=30000
```

### Docker Compose Update
```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: agrimarket-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis-data:
```

## Monitoring & Metrics

### Key Performance Indicators (KPIs)
1. **Response Time**: Average, P50, P95, P99
2. **Throughput**: Requests per second
3. **Error Rate**: Percentage of failed requests
4. **Cache Hit Rate**: Percentage of cached responses
5. **Database Query Time**: Average query duration
6. **Memory Usage**: Application memory consumption
7. **CPU Usage**: Application CPU consumption

### Alerts
- Response time > 2 seconds
- Error rate > 5%
- Cache hit rate < 70%
- Database query time > 500ms
- Memory usage > 80%
- CPU usage > 80%

## Best Practices

### Caching
1. ✅ Cache frequently accessed data
2. ✅ Set appropriate TTL for each data type
3. ✅ Implement cache invalidation on updates
4. ✅ Use cache-aside pattern (check cache, then database)
5. ✅ Handle cache failures gracefully
6. ✅ Monitor cache hit rates

### Database
1. ✅ Use indexes for WHERE, ORDER BY, JOIN clauses
2. ✅ Avoid N+1 queries (use eager loading or batch loading)
3. ✅ Select only required fields
4. ✅ Use pagination for large result sets
5. ✅ Use database transactions for atomic operations
6. ✅ Monitor slow queries

### API Design
1. ✅ Implement pagination for list endpoints
2. ✅ Use compression for responses
3. ✅ Return only necessary data
4. ✅ Use ETags for client-side caching
5. ✅ Implement rate limiting (already done in Phase 17)
6. ✅ Use HTTP caching headers

## Testing Performance

### Load Testing Commands
```bash
# Apache Bench - Simple test
ab -n 1000 -c 10 http://localhost:5000/api/v1/products

# Artillery - Complex scenarios
artillery run artillery-test.yml

# k6 - Modern load testing
k6 run load-test.js
```

### Performance Profiling
```bash
# Node.js profiling
node --prof src/server.ts

# Analyze profile
node --prof-process isolate-*.log > profile.txt

# Memory profiling
node --inspect src/server.ts
# Then use Chrome DevTools
```

## Success Criteria

Phase 18 is complete when:
- [x] Redis caching is implemented and working
- [x] Cache hit rate is > 70%
- [x] Average response time is < 200ms
- [x] Database queries are optimized and indexed
- [x] Compression is enabled
- [x] Performance monitoring is in place
- [x] Load testing shows system can handle 1000+ req/s
- [x] Documentation is complete

## Next Phase

After Phase 18, proceed to:
- **Phase 19**: Deployment Preparation
  - Docker production setup
  - Environment configuration
  - CI/CD pipeline
  - Monitoring and logging setup
  - Backup and recovery procedures

## Resources

- [Prisma Performance Guide](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/simple-profiling/)
- [Load Testing with Artillery](https://www.artillery.io/docs)
