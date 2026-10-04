# Production Deployment Checklist

This comprehensive checklist ensures AgriMarket backend is production-ready with proper security, performance, and reliability configurations.

---

## ✅ Environment Configuration

### Environment Variables

- [ ] `NODE_ENV=production` is set
- [ ] `PORT` is configured (default: 3000)
- [ ] `FRONTEND_URL` points to production frontend domain
- [ ] `CORS_ORIGIN` is set to production frontend URL (not `*`)
- [ ] `CORS_CREDENTIALS=true` only if using cookies

### Security Settings

- [ ] `DETAILED_ERRORS=false` (don't expose stack traces)
- [ ] `LOG_QUERIES=false` (don't log SQL queries with sensitive data)
- [ ] `RATE_LIMIT_ENABLED=true`
- [ ] `RATE_LIMIT_WINDOW` and `RATE_LIMIT_MAX` set appropriately
- [ ] `AUTH_RATE_LIMIT_MAX=5` (or appropriate value)

---

## 🔐 Secrets and Credentials

### Database

- [ ] `DATABASE_URL` uses strong password (32+ characters, generated with `openssl rand -base64 32`)
- [ ] Database connection uses SSL/TLS (`?sslmode=require` in connection string)
- [ ] Database user has least-privilege permissions (no DROP, ALTER tables)
- [ ] PostgreSQL version is supported and updated

### JWT Tokens

- [ ] `JWT_ACCESS_SECRET` regenerated (64 bytes: `openssl rand -base64 64`)
- [ ] `JWT_REFRESH_SECRET` regenerated (different from access secret)
- [ ] `JWT_ACCESS_EXPIRY` set (default: 15m)
- [ ] `JWT_REFRESH_EXPIRY` set (default: 7d)
- [ ] Secrets are NOT the same as development/staging

### Session and Encryption

- [ ] `SESSION_SECRET` regenerated (64 bytes)
- [ ] `BCRYPT_SALT_ROUNDS=12` (or higher for more security, slower login)

### Email Service (SMTP)

- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` configured
- [ ] `SMTP_PASS` is production credential (not test/sandbox)
- [ ] `SMTP_SECURE=true` for TLS
- [ ] Test email sending works

### Payment Gateways

- [ ] `CHAPA_SECRET_KEY` is **production** key (not sandbox)
- [ ] `CHAPA_WEBHOOK_SECRET` regenerated
- [ ] `TELEBIRR_APP_KEY` is production key
- [ ] `TELEBIRR_PUBLIC_KEY` configured
- [ ] `TELEBIRR_APP_ID` configured
- [ ] Webhook endpoints are accessible and secured
- [ ] Test transactions in production mode verified

### File Storage

- [ ] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` configured (if using Cloudinary)
- [ ] OR `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` configured (if using S3)
- [ ] Upload limits configured (`MAX_FILE_SIZE=5242880` for 5MB)
- [ ] File type restrictions enforced

### Redis Cache

- [ ] `REDIS_HOST`, `REDIS_PORT` configured
- [ ] `REDIS_PASSWORD` set (if Redis has authentication)
- [ ] `REDIS_DB` set (default: 0)
- [ ] `REDIS_TTL` configured (default: 3600)
- [ ] `CACHE_ENABLED=true`
- [ ] Redis persistence (AOF or RDB) enabled for data durability

---

## 🗄️ Database Setup

- [ ] Production database created and accessible
- [ ] Prisma migrations applied: `npx prisma migrate deploy`
- [ ] Prisma Client generated: `npx prisma generate`
- [ ] Database indexes verified (see `schema.prisma`)
- [ ] Database backup configured (automated daily backups)
- [ ] Point-in-time recovery (PITR) enabled
- [ ] Backup restoration tested
- [ ] Database monitoring and alerting configured

---

## 🚀 Application Deployment

### Build and Dependencies

- [ ] `npm ci` (clean install, not `npm install`)
- [ ] `npm run build` completes successfully
- [ ] TypeScript compilation has no errors
- [ ] All dependencies are production versions (no dev-only packages in runtime)
- [ ] `package-lock.json` committed and up to date

### Process Management

- [ ] Application runs with process manager (PM2, Docker, Kubernetes)
- [ ] Auto-restart on crash configured
- [ ] Graceful shutdown handlers implemented
- [ ] Multiple instances for load balancing (if needed)

### Logging

- [ ] Structured logging configured (JSON format)
- [ ] Log rotation enabled (daily or size-based)
- [ ] Logs shipped to centralized logging system (CloudWatch, Datadog, etc.)
- [ ] Log retention policy configured (minimum 30 days)
- [ ] Sensitive data (passwords, tokens) not logged

---

## 🔒 Security Hardening

### HTTPS and TLS

- [ ] **HTTPS enabled and enforced** (redirect HTTP to HTTPS)
- [ ] SSL/TLS certificate installed (Let's Encrypt, AWS ACM, etc.)
- [ ] Certificate auto-renewal configured
- [ ] TLS 1.2+ only (disable TLS 1.0, 1.1)
- [ ] Strong cipher suites configured

### Rate Limiting

- [ ] Rate limiting enabled on all endpoints
- [ ] Auth endpoints have stricter limits (5 requests per 15 minutes)
- [ ] Account lockout on failed login attempts (5 attempts = 15 min lockout)
- [ ] Redis available for distributed rate limiting

### CORS Policy

- [ ] `CORS_ORIGIN` set to frontend domain only (not `*`)
- [ ] `CORS_CREDENTIALS=true` only if needed
- [ ] Preflight requests handled correctly

### Input Validation

- [ ] All API inputs validated with Zod schemas
- [ ] File uploads validated (type, size, content)
- [ ] SQL injection prevented (Prisma ORM)
- [ ] XSS prevention on user-generated content

### Headers and CSP

- [ ] Security headers configured:
  - `Helmet.js` middleware enabled
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Strict-Transport-Security` (HSTS) enabled
  - `Content-Security-Policy` configured

### Audit Logging

- [ ] Audit logging enabled for sensitive operations
- [ ] USER_LOGIN, USER_LOGOUT, PASSWORD_CHANGED, PASSWORD_RESET logged
- [ ] ORDER_CREATED, PAYMENT_CONFIRMED logged
- [ ] ADMIN_ACTION logged (if applicable)
- [ ] Audit log retention policy configured (minimum 1 year)

---

## 📊 Monitoring and Alerting

### Application Monitoring

- [ ] Error tracking configured (Sentry, Rollbar, CloudWatch)
- [ ] Performance monitoring (APM) enabled
- [ ] Health check endpoint `/health` working
- [ ] Uptime monitoring configured (UptimeRobot, Pingdom, etc.)

### Infrastructure Monitoring

- [ ] CPU, memory, disk usage monitored
- [ ] Database connection pool monitored
- [ ] Redis connection monitored
- [ ] Alerts configured for:
  - High error rate (> 1%)
  - High response time (> 1s for 95th percentile)
  - Low disk space (< 20%)
  - Database connection failures
  - Redis connection failures

### Business Metrics

- [ ] Order creation rate tracked
- [ ] Payment success/failure rate tracked
- [ ] User registration rate tracked
- [ ] API endpoint usage analytics

---

## 🔄 Backup and Disaster Recovery

- [ ] Database backups automated (daily at minimum)
- [ ] Backup restoration tested successfully
- [ ] Backup retention policy (e.g., 30 days)
- [ ] Redis persistence enabled (AOF or RDB snapshots)
- [ ] File uploads backed up (S3 versioning, Cloudinary backup)
- [ ] Disaster recovery plan documented
- [ ] Recovery Time Objective (RTO) defined
- [ ] Recovery Point Objective (RPO) defined

---

## 🧪 Testing and Validation

### Pre-Deployment Testing

- [ ] All unit tests pass: `npm test`
- [ ] Integration tests pass
- [ ] E2E tests pass (if available)
- [ ] Load testing completed (expected traffic + 50% margin)
- [ ] Security testing completed (OWASP Top 10 checks)

### Post-Deployment Validation

- [ ] Health check endpoint returns 200 OK
- [ ] User registration works
- [ ] User login works
- [ ] Password reset works
- [ ] Product search works
- [ ] Order creation works
- [ ] Payment processing works (test transaction)
- [ ] Email notifications sent successfully
- [ ] File uploads work
- [ ] Admin functions work

---

## 📋 Documentation

- [ ] API documentation up to date
- [ ] Environment variables documented
- [ ] Deployment procedures documented
- [ ] Rollback procedures documented
- [ ] Incident response plan documented
- [ ] Security policy (SECURITY.md) up to date
- [ ] security.txt file accessible at `/.well-known/security.txt`
- [ ] On-call procedures defined

---

## 🔧 Performance Optimization

- [ ] Database query optimization (use EXPLAIN ANALYZE)
- [ ] Composite indexes on frequently queried columns
- [ ] Redis caching enabled for expensive queries
- [ ] Response compression enabled (gzip/brotli)
- [ ] CDN configured for static assets (if applicable)
- [ ] Connection pooling configured (Prisma default: 10)
- [ ] N+1 query problems resolved

---

## 📞 Operations Readiness

- [ ] On-call rotation defined
- [ ] Incident response procedures documented
- [ ] Escalation paths defined
- [ ] Runbooks for common issues created
- [ ] Team trained on deployment and rollback procedures
- [ ] Customer support informed of launch
- [ ] Status page configured (if applicable)

---

## 🎯 Final Verification

- [ ] All items above are checked ✅
- [ ] Production deployment tested in staging first
- [ ] Rollback plan tested and ready
- [ ] Stakeholders notified of deployment
- [ ] Monitoring dashboard accessible
- [ ] On-call engineer available during and after deployment

---

## 📅 Post-Launch

### First 24 Hours

- [ ] Monitor error rates continuously
- [ ] Check application logs for anomalies
- [ ] Verify all critical user flows work
- [ ] Monitor database performance
- [ ] Check payment gateway transactions

### First Week

- [ ] Review performance metrics daily
- [ ] Analyze user feedback
- [ ] Check audit logs for suspicious activity
- [ ] Verify backup restoration works
- [ ] Review and optimize slow queries

### First Month

- [ ] Security audit conducted
- [ ] Performance review and optimization
- [ ] Credential rotation (if 90 days passed)
- [ ] Review and update documentation
- [ ] Plan for scaling if needed

---

**Last Updated**: 2024-10-04  
**Review Before**: Every production deployment  
**Owner**: DevOps/Engineering Team
