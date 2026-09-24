# 🚀 AGRIMARKET - PRODUCTION DEPLOYMENT QUICK START

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- SMTP email account (Gmail, SendGrid, AWS SES, etc.)

---

## 1. Environment Setup

Create `.env` file in `backend/` directory:

```bash
# === CRITICAL: CHANGE ALL SECRETS! ===

# Application
NODE_ENV=production
PORT=3001
API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/agrimarket?schema=public"

# JWT (MUST BE DIFFERENT!)
JWT_ACCESS_SECRET="CHANGE-ME-64-chars-access-secret-here-use-openssl-rand-base64-64"
JWT_REFRESH_SECRET="CHANGE-ME-64-chars-refresh-secret-different-from-access"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Bcrypt
BCRYPT_SALT_ROUNDS=12

# Email (SMTP - Example: Gmail)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
EMAIL_FROM="noreply@agrimarket.com"
EMAIL_FROM_NAME="AgriMarket"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD="your-redis-password"
REDIS_DB="0"
REDIS_TTL="900"
CACHE_ENABLED="true"

# Security
SESSION_SECRET="CHANGE-ME-session-secret-64-chars-minimum"

# CORS
CORS_ORIGIN="https://yourdomain.com"
CORS_CREDENTIALS="true"

# Rate Limiting
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
AUTH_RATE_LIMIT_MAX_REQUESTS="5"
SEARCH_RATE_LIMIT_MAX_REQUESTS="20"

# Logging
LOG_LEVEL="info"
LOG_FILE_ERROR="logs/error.log"
LOG_FILE_COMBINED="logs/combined.log"
LOG_QUERIES="false"
LOG_REQUESTS="true"
DETAILED_ERRORS="false"

# Business Rules
BASE_DELIVERY_FEE="50"
MIN_ORDER_AMOUNT="100"
MAX_ORDER_AMOUNT="100000"

# Features
ENABLE_EMAIL_VERIFICATION="true"
ENABLE_RECOMMENDATIONS="true"
ENABLE_REVIEWS="true"
ENABLE_WISHLISTS="true"

# Payment (Set when ready)
USE_MOCK_PAYMENT="true"
# CHAPA_SECRET_KEY="your-chapa-secret"
# TELEBIRR_APP_ID="your-telebirr-id"
```

---

## 2. Generate Secure Secrets

### On Linux/Mac:
```bash
# JWT Access Secret
openssl rand -base64 64

# JWT Refresh Secret (run again for different value)
openssl rand -base64 64

# Session Secret
openssl rand -base64 64
```

### On Windows PowerShell:
```powershell
# JWT Access Secret
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# JWT Refresh Secret (run again)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Session Secret
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## 3. Gmail SMTP Setup (Free Option)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
3. **Use in .env:**
   ```bash
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_SECURE="false"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="xxxx xxxx xxxx xxxx"  # App password (no spaces)
   ```

---

## 4. Database Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate:deploy

# (Optional) Seed database with sample data
npm run db:seed
```

---

## 5. Build & Start

### Development:
```bash
npm run dev
```

### Production:
```bash
# Build
npm run build

# Start
npm start
```

---

## 6. Verify Deployment

### Health Check:
```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "redis": "connected",
    "uptime": 123.456,
    "timestamp": "2026-09-24T..."
  }
}
```

### Test API:
```bash
# Get API info
curl http://localhost:3001/api/v1

# Register user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "firstName": "Test",
    "lastName": "User"
  }'
```

---

## 7. Docker Deployment (Recommended)

```bash
# Start all services (PostgreSQL, Redis, API, Nginx)
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f api

# Stop services
docker-compose -f docker-compose.prod.yml down
```

---

## 8. PM2 Process Manager (Alternative)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start dist/server.js --name agrimarket-api

# View logs
pm2 logs agrimarket-api

# Monitor
pm2 monit

# Save configuration
pm2 save

# Auto-restart on reboot
pm2 startup
```

---

## 9. Nginx Reverse Proxy

Example `/etc/nginx/sites-available/agrimarket`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/agrimarket /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 10. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal is configured automatically
```

---

## 11. Monitoring & Logs

### View Logs:
```bash
# Error logs
tail -f logs/error.log

# All logs
tail -f logs/combined.log

# PM2 logs
pm2 logs agrimarket-api

# Docker logs
docker-compose -f docker-compose.prod.yml logs -f api
```

### Monitor Health:
```bash
# Check health endpoint every 30 seconds
watch -n 30 'curl -s http://localhost:3001/health | jq'
```

---

## 12. Backup Strategy

### Database Backup:
```bash
# Manual backup
pg_dump -U postgres agrimarket > backup_$(date +%Y%m%d).sql

# Automated daily backup (crontab)
0 2 * * * pg_dump -U postgres agrimarket > /backups/agrimarket_$(date +\%Y\%m\%d).sql
```

### Restore:
```bash
psql -U postgres agrimarket < backup_20260924.sql
```

---

## 13. Common Issues & Solutions

### Issue: Application won't start
**Solution:** Check environment variables
```bash
npm run db:generate
npm run build
```

### Issue: Email not sending
**Solution:** Verify SMTP settings, check firewall
```bash
# Test SMTP connection
telnet smtp.gmail.com 587
```

### Issue: Database connection failed
**Solution:** Check PostgreSQL is running
```bash
sudo systemctl status postgresql
sudo systemctl start postgresql
```

### Issue: Redis connection failed
**Solution:** Check Redis is running
```bash
sudo systemctl status redis
sudo systemctl start redis
```

---

## 14. Performance Tuning

### PostgreSQL:
```sql
-- Increase connection pool
ALTER SYSTEM SET max_connections = '200';

-- Enable query logging (temporary)
ALTER SYSTEM SET log_min_duration_statement = '100';
```

### Redis:
```bash
# Increase memory limit
redis-cli CONFIG SET maxmemory 512mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### Node.js:
```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

---

## 15. Scaling Checklist

### For 1,000+ Users:
- [ ] Add database read replicas
- [ ] Configure Redis Sentinel
- [ ] Set up load balancer
- [ ] Enable database connection pooling
- [ ] Configure CDN for static assets

### For 10,000+ Users:
- [ ] Move to Kubernetes
- [ ] Implement microservices
- [ ] Add message queue (RabbitMQ/Redis)
- [ ] Implement caching layers
- [ ] Set up monitoring (DataDog/New Relic)

---

## 🆘 Support

### Issues:
- Check `PRODUCTION-READINESS-REPORT.md` for detailed info
- Review `FIXES-APPLIED.md` for recent changes
- Check logs in `logs/` directory

### Documentation:
- API Endpoints: See `README.md`
- Database Schema: See `prisma/schema.prisma`
- Environment Variables: See `.env.example`

---

## ✅ Post-Deployment Checklist

After deployment, verify:

- [ ] Health endpoint returns 200 OK
- [ ] User registration works
- [ ] Email verification sends email
- [ ] Login works and returns JWT
- [ ] Protected routes require authentication
- [ ] Database queries are fast (<200ms)
- [ ] Redis caching works (check hit rate)
- [ ] Error logs are being written
- [ ] Rate limiting is working
- [ ] CORS is configured correctly

---

**Deployment Guide Version:** 1.0  
**Last Updated:** 2026-09-24  
**Backend Version:** 1.0.0

**Ready to deploy! 🚀**
