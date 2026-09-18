# Phase 19: Deployment Preparation

## Overview
This phase prepares the AgriMarket API for production deployment with Docker configuration, CI/CD pipeline, environment management, monitoring, and comprehensive deployment documentation.

## Deployment Goals

### Production Requirements
- ✅ **Zero-downtime deployment**: Rolling updates
- ✅ **Scalability**: Horizontal scaling support
- ✅ **High Availability**: Multi-instance setup
- ✅ **Security**: SSL/TLS, secrets management
- ✅ **Monitoring**: Real-time metrics and alerts
- ✅ **Backup**: Automated database backups
- ✅ **Recovery**: Disaster recovery plan

## Deployment Strategy

### 1. Docker Production Configuration

#### 1.1 Production Dockerfile
Create optimized multi-stage Dockerfile:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

**Benefits:**
- Smaller image size (multi-stage build)
- Only production dependencies
- Security (Alpine Linux)
- Optimized layers (better caching)

#### 1.2 Docker Compose Production
Separate production compose file:

```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.prod
    image: agrimarket-api:latest
    container_name: agrimarket-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
      REDIS_HOST: redis
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - agrimarket-network

  postgres:
    image: postgres:14-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - agrimarket-network

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - agrimarket-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - api
    networks:
      - agrimarket-network

volumes:
  postgres_data:
  redis_data:

networks:
  agrimarket-network:
    driver: bridge
```

#### 1.3 Nginx Reverse Proxy
Configure Nginx for load balancing and SSL:

```nginx
upstream api_backend {
    least_conn;
    server api:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.agrimarket.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.agrimarket.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 10M;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /health {
        access_log off;
        proxy_pass http://api_backend/health;
    }
}
```

### 2. Environment Management

#### 2.1 Environment Variables Structure
```
.env.development    # Local development
.env.staging        # Staging environment
.env.production     # Production environment (never commit!)
.env.template       # Template for documentation
```

#### 2.2 Secrets Management
Use Docker secrets or environment variable injection:

```yaml
# docker-compose.prod.yml with secrets
services:
  api:
    environment:
      DATABASE_URL: /run/secrets/db_url
      JWT_SECRET: /run/secrets/jwt_secret
      REDIS_PASSWORD: /run/secrets/redis_password
    secrets:
      - db_url
      - jwt_secret
      - redis_password

secrets:
  db_url:
    external: true
  jwt_secret:
    external: true
  redis_password:
    external: true
```

### 3. CI/CD Pipeline

#### 3.1 GitHub Actions Workflow
`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        working-directory: ./backend
      
      - name: Run linter
        run: npm run lint
        working-directory: ./backend
      
      - name: Run tests
        run: npm test
        working-directory: ./backend
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
      
      - name: Build
        run: npm run build
        working-directory: ./backend

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.PRODUCTION_HOST }}
          username: ${{ secrets.PRODUCTION_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/agrimarket
            docker-compose pull
            docker-compose up -d --no-deps --build api
            docker-compose exec -T api npx prisma migrate deploy
```

### 4. Database Management

#### 4.1 Migration Strategy
```bash
# Production migration script
#!/bin/bash

echo "Running database migrations..."

# Backup before migration
docker-compose exec postgres pg_dump -U agrimarket agrimarket_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
docker-compose exec api npx prisma migrate deploy

# Verify migrations
docker-compose exec api npx prisma migrate status

echo "Migrations completed!"
```

#### 4.2 Automated Backups
```bash
# backup.sh - Run daily via cron
#!/bin/bash

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=30

# Create backup
docker-compose exec postgres pg_dump -U agrimarket agrimarket_prod | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/backup_$DATE.sql.gz s3://agrimarket-backups/

# Clean old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$KEEP_DAYS -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

**Cron schedule:**
```cron
# Daily backup at 2 AM
0 2 * * * /opt/agrimarket/scripts/backup.sh >> /var/log/backup.log 2>&1
```

### 5. Monitoring & Logging

#### 5.1 Application Monitoring
Use Sentry for error tracking:

```typescript
// src/config/sentry.ts
import * as Sentry from '@sentry/node';
import config from './env';

export const initSentry = () => {
  if (config.isProduction && config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.nodeEnv,
      tracesSampleRate: 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app }),
      ],
    });
  }
};
```

#### 5.2 Log Aggregation
Configure Winston for structured logging:

```typescript
// Production logging to files + external service
const productionLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10485760,
      maxFiles: 10,
    }),
  ],
});

// Optional: Send to external service (DataDog, Loggly, etc.)
if (config.logging.externalService) {
  productionLogger.add(
    new winston.transports.Http({
      host: config.logging.host,
      path: config.logging.path,
      ssl: true,
    })
  );
}
```

#### 5.3 Health Check Monitoring
Set up uptime monitoring:

```yaml
# monitoring/docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

volumes:
  prometheus_data:
  grafana_data:
```

### 6. Security Hardening

#### 6.1 SSL/TLS Certificates
Use Let's Encrypt with Certbot:

```bash
# Install Certbot
apt-get install certbot python3-certbot-nginx

# Generate certificate
certbot --nginx -d api.agrimarket.com

# Auto-renewal (cron)
0 0 * * * certbot renew --quiet
```

#### 6.2 Firewall Configuration
```bash
# UFW firewall rules
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

#### 6.3 Docker Security
```dockerfile
# Run as non-root user
FROM node:18-alpine
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Read-only filesystem
COPY --chown=nodejs:nodejs . .
```

### 7. Scaling Strategy

#### 7.1 Horizontal Scaling
Docker Swarm or Kubernetes configuration:

```yaml
# docker-stack.yml (Docker Swarm)
version: '3.8'

services:
  api:
    image: agrimarket-api:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    networks:
      - agrimarket-network
```

#### 7.2 Load Balancing
Nginx upstream configuration with multiple instances:

```nginx
upstream api_backend {
    least_conn;
    server api_1:3001 weight=1;
    server api_2:3001 weight=1;
    server api_3:3001 weight=1;
}
```

### 8. Disaster Recovery

#### 8.1 Backup Strategy
- **Database**: Daily full backup + hourly incremental
- **Redis**: AOF persistence + daily RDB snapshot
- **Application Logs**: Retained for 90 days
- **Uploads**: Synced to S3/Cloud storage
- **Backup Location**: Off-site storage (S3, another region)

#### 8.2 Recovery Procedures
```bash
# Database restore
gunzip < backup_20240115_020000.sql.gz | docker-compose exec -T postgres psql -U agrimarket agrimarket_prod

# Redis restore
docker-compose stop redis
cp backup/dump.rdb /var/lib/docker/volumes/redis_data/_data/
docker-compose start redis

# Verify restoration
docker-compose exec api npm run db:verify
```

### 9. Performance Optimization

#### 9.1 CDN Setup
Configure CDN for static assets:

```nginx
# Cache static files
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### 9.2 Database Connection Pooling
```typescript
// Prisma connection pool
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connectionLimit = 20
  poolTimeout = 30
}
```

### 10. Deployment Checklist

#### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] SSL certificates obtained
- [ ] Database migrations tested
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Security scan completed

#### Deployment
- [ ] Create backup
- [ ] Deploy new version
- [ ] Run database migrations
- [ ] Verify health check
- [ ] Run smoke tests
- [ ] Monitor logs for errors
- [ ] Verify performance metrics

#### Post-Deployment
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify cache hit rates
- [ ] Test critical user flows
- [ ] Update documentation
- [ ] Notify team

### 11. Rollback Procedure

```bash
# Quick rollback script
#!/bin/bash

echo "Rolling back to previous version..."

# Stop current version
docker-compose stop api

# Pull previous image
docker pull agrimarket-api:previous

# Start with previous image
docker-compose up -d api

# Rollback database if needed
# gunzip < backup_before_deploy.sql.gz | docker-compose exec -T postgres psql -U agrimarket agrimarket_prod

echo "Rollback completed!"
```

## Deployment Environments

### Development
- Local Docker setup
- SQLite or local PostgreSQL
- Hot reload enabled
- Debug logging
- Mock payment provider

### Staging
- Cloud deployment (AWS/GCP/Azure)
- Production-like setup
- Real payment provider (test mode)
- Performance monitoring
- Load testing

### Production
- Multi-region deployment
- Auto-scaling enabled
- Real payment provider
- Full monitoring & alerts
- Automated backups
- CDN enabled

## Infrastructure Recommendations

### Small Scale (MVP)
- **Hosting**: Single VPS (DigitalOcean, Linode)
- **Database**: Managed PostgreSQL
- **Redis**: Managed Redis
- **Storage**: Object storage (S3, Spaces)
- **Cost**: ~$50-100/month

### Medium Scale
- **Hosting**: Multiple instances behind load balancer
- **Database**: Managed PostgreSQL with read replicas
- **Redis**: Managed Redis cluster
- **CDN**: CloudFlare or AWS CloudFront
- **Monitoring**: DataDog or New Relic
- **Cost**: ~$200-500/month

### Large Scale
- **Hosting**: Kubernetes cluster
- **Database**: Managed PostgreSQL with high availability
- **Redis**: Redis Cluster
- **CDN**: Multi-region CDN
- **Monitoring**: Full observability stack
- **Cost**: $1,000+/month

## Recommended Hosting Providers

### For Ethiopian Market
1. **AWS Africa (Cape Town)** - Low latency
2. **Azure** - Global presence
3. **DigitalOcean** - Simple, cost-effective
4. **Linode** - Developer-friendly
5. **Hetzner** - European servers, good pricing

### Managed Services
- **Database**: AWS RDS, DigitalOcean Managed Database
- **Redis**: AWS ElastiCache, Redis Cloud
- **Monitoring**: DataDog, New Relic, Sentry
- **CDN**: CloudFlare, AWS CloudFront

## Success Criteria

Phase 19 is complete when:
- [ ] Production Dockerfile created
- [ ] Docker Compose production setup
- [ ] Nginx reverse proxy configured
- [ ] CI/CD pipeline working
- [ ] Automated backups configured
- [ ] Monitoring and logging setup
- [ ] SSL/TLS certificates obtained
- [ ] Security hardening applied
- [ ] Deployment documentation complete
- [ ] Rollback procedure tested

## Next Phase

After Phase 19, proceed to:
- **Phase 20**: Documentation & Launch
  - API documentation (Swagger/OpenAPI)
  - User guides
  - Admin documentation
  - Developer onboarding
  - Marketing materials
  - Launch checklist

## Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
