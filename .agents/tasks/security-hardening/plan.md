# AgriMarket Security Hardening Implementation Plan

## Executive Summary

This plan addresses **41 security vulnerabilities** across 4 priority levels in the AgriMarket Ethiopian agricultural e-commerce platform. The work is decomposed into 4 sequential features (FEAT-001 through FEAT-004) covering:

1. **FEAT-001 (CRITICAL)**: SQL injection elimination + exposed credential fixes
2. **FEAT-002 (CRITICAL)**: Insecure token storage + CSRF protection + file upload hardening  
3. **FEAT-003 (HIGH)**: Rate limiting gaps + enhanced XSS + account lockout + token invalidation
4. **FEAT-004 (MEDIUM)**: Database indexes + Redis resilience + audit logging + 2FA prep + documentation

Each feature leaves the codebase in a working, testable state. Features are strictly sequential due to shared authentication and middleware dependencies.

---

## Project Context

- **Backend**: Express.js 4.18 + TypeScript 5.3 + Prisma ORM 5.7 + PostgreSQL + Redis (optional)
- **Frontend**: Next.js 16.3 + TypeScript 5 + Axios
- **Current State**: 
  - Rate limiting partially implemented (express-rate-limit 7.1.5 installed)
  - Helmet security headers configured
  - Zod validation on all inputs
  - **CRITICAL GAPS**: Raw SQL with string concatenation, real credentials in .env, JWT in localStorage, no CSRF protection, mimetype-only file validation

---

## Breaking Changes & Mitigation

### Breaking Change 1: JWT Cookie Migration (FEAT-002)
**Impact**: Frontend must handle cookie-based auth instead of localStorage  
**Mitigation**: 
- Backend sets cookies AND returns tokens in response (backward compatible transition period possible)
- Frontend changes can be deployed simultaneously with backend
- No user action required (cookies auto-set on next login)

### Breaking Change 2: CSRF Token Requirement (FEAT-002)
**Impact**: All state-changing requests need CSRF token header  
**Mitigation**:
- Frontend axios interceptor automatically adds header
- Backend only enforces on routes with csrfProtection middleware
- Deploy frontend first, then enable CSRF middleware

### Breaking Change 3: Account Lockout (FEAT-003)
**Impact**: 5 failed logins lock account for 15 minutes  
**Mitigation**:
- Clear error message tells user to wait or contact support
- Admin unlock mechanism should be added in future (not in this plan)

---

## Dependencies to Install

### Backend (c:\Users\admin\Kuperfume\backend)

```json
{
  "dependencies": {
    "cookie-parser": "^1.4.6",
    "dompurify": "^3.0.6",
    "jsdom": "^23.0.1",
    "file-type": "^16.5.4",
    "express-request-id": "^2.0.1"
  },
  "devDependencies": {
    "@types/cookie-parser": "^1.4.7",
    "@types/dompurify": "^3.0.5",
    "@types/jsdom": "^21.1.6"
  }
}
```

Install: `cd backend && npm install cookie-parser dompurify jsdom file-type express-request-id && npm install -D @types/cookie-parser @types/dompurify @types/jsdom`

---

## Database Migrations

### Migration 1: Performance Indexes (FEAT-004)
After modifying `backend/prisma/schema.prisma` to add indexes:
```bash
cd backend
npx prisma migrate dev --name add-performance-indexes
npx prisma generate
```

### Migration 2: 2FA Preparation Fields (FEAT-004)
After adding `twoFactorEnabled` and `twoFactorSecret` to User model:
```bash
cd backend
npx prisma migrate dev --name add-2fa-fields
npx prisma generate
```

---

## Implementation Details by Feature

### FEAT-001: SQL Injection & Credential Exposure (CRITICAL)

**Files Modified:**
- `backend/src/repositories/search.repository.ts` - Replace 5 raw SQL methods with Prisma ORM
- `backend/src/repositories/saved-search.repository.ts` - Replace 5 raw SQL methods with Prisma ORM
- `backend/.env.example` - Update credential placeholders and add generation instructions
- `backend/SECURITY.md` - **CREATE NEW** - Document credential management

**SQL Injection Elimination Pattern:**

❌ **BEFORE** (search.repository.ts line ~230):
```typescript
const products: any[] = await prisma.$queryRawUnsafe(
  `SELECT * FROM products WHERE name LIKE $1`, 
  `%${query}%`  // String concatenation - VULNERABLE
);
```

✅ **AFTER**:
```typescript
const products = await prisma.product.findMany({
  where: {
    name: { contains: query, mode: 'insensitive' }
  }
});
```

For complex ranking queries, use Prisma.sql tagged templates:
```typescript
import { Prisma } from '@prisma/client';
const products = await prisma.$queryRaw(
  Prisma.sql`SELECT * FROM products WHERE name ILIKE ${`%${query}%`}`
);
```

**Credential Fixes:**
- .env.example line 19: `DATABASE_URL="postgresql://agrimarket_user:CHANGE_ME_STRONG_PASSWORD@localhost:5432/agrimarket"`
- Add comment: `# Generate password: openssl rand -base64 32`
- Lines 26-27, 83: Add generation comments for JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, SESSION_SECRET
- Verify no real emails, passwords, or API keys in .env.example

**Verification:**
```bash
cd backend
npm run lint  # Must pass
grep -r "\$queryRawUnsafe\|\$executeRawUnsafe" src/repositories/search*.ts  # Should return nothing
grep -i "Sharon\|sharonkuye369\|tftzlyavgjyvjkcg" .env.example  # Should return nothing
npm run dev  # Start server
# Test: curl http://localhost:3001/api/v1/search?query=coffee
```

---

### FEAT-002: Insecure Token Storage + CSRF + File Upload (CRITICAL)

**Files Modified:**
- `backend/src/controllers/auth.controller.ts` - Add cookie setting/clearing
- `backend/src/middleware/auth.middleware.ts` - Read JWT from cookies
- `backend/src/middleware/security.middleware.ts` - Add CSRF middleware, enhance file validation
- `backend/src/app.ts` - Add cookie-parser and CSRF middleware
- `backend/package.json` - Add dependencies
- `frontend/lib/api/client.ts` - Remove localStorage, add withCredentials, add CSRF header
- Find and fix all frontend auth pages/components using localStorage for tokens

**Cookie Implementation Pattern:**

auth.controller.ts register() and login() methods:
```typescript
const tokens = await authService.register(data);

// Set httpOnly cookies
res.cookie('accessToken', tokens.accessToken, {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000  // 15 minutes
});

res.cookie('refreshToken', tokens.refreshToken, {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});

sendSuccess(res, { user: tokens.user, tokens });  // Still return in body for compatibility
```

logout() method:
```typescript
res.clearCookie('accessToken');
res.clearCookie('refreshToken');
sendSuccess(res, { message: 'Logged out successfully' });
```

**CSRF Protection:**

security.middleware.ts - Add new middleware:
```typescript
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Generate token on first request
  if (!req.cookies['XSRF-TOKEN']) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', token, { 
      httpOnly: false,  // JS needs to read it
      secure: config.isProduction, 
      sameSite: 'strict' 
    });
    req.csrfToken = token;
  }

  // Validate on state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const headerToken = req.headers['x-xsrf-token'];
    const cookieToken = req.cookies['XSRF-TOKEN'];
    
    if (!headerToken || headerToken !== cookieToken) {
      throw new ValidationError('Invalid CSRF token');
    }
  }
  
  next();
};
```

app.ts - Apply before routes:
```typescript
import cookieParser from 'cookie-parser';
app.use(cookieParser());
app.use(csrfProtection);  // Apply globally or per-route
```

**Frontend Changes:**

lib/api/client.ts:
```typescript
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true  // Send cookies cross-origin
});

// Remove localStorage token logic from request interceptor
apiClient.interceptors.request.use((config) => {
  // Add CSRF token
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  
  if (csrfToken) {
    config.headers['X-XSRF-TOKEN'] = csrfToken;
  }
  
  return config;
});

// Simplified response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/auth/login";  // Cookies cleared by backend
    }
    return Promise.reject(error);
  }
);
```

**File Upload Magic Number Validation:**

security.middleware.ts validateFileUpload():
```typescript
import { fileTypeFromBuffer } from 'file-type';

export const validateFileUpload = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  // Existing size check...
  
  // Magic number validation
  const detectedType = await fileTypeFromBuffer(req.file.buffer);
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!detectedType || !allowedTypes.includes(detectedType.mime)) {
    throw new ValidationError('Invalid file type. File signature does not match allowed image formats.');
  }
  
  next();
};
```

Update multer config to use memoryStorage for buffer access.

**Verification:**
```bash
cd backend && npm install && npm run lint
cd frontend && npm run lint
# Start both servers
cd backend && npm run dev
cd frontend && npm run dev
# Manual browser test:
# 1. Open DevTools -> Application -> Cookies
# 2. Navigate to http://localhost:3000/auth/login
# 3. Log in -> Verify accessToken and refreshToken cookies with HttpOnly flag
# 4. Check XSRF-TOKEN cookie exists (NOT HttpOnly)
# 5. Make POST request -> Verify X-XSRF-TOKEN header sent
# 6. Log out -> Verify cookies cleared
```

---

### FEAT-003: Enhanced Security Controls (HIGH)

**Files Modified:**
- `backend/src/routes/auth.routes.ts` - Apply email verification rate limiter
- `backend/src/middleware/security.middleware.ts` - Replace XSS sanitization with DOMPurify
- `backend/src/services/auth.service.ts` - Add account lockout, token blacklist, refresh rotation
- `backend/src/middleware/auth.middleware.ts` - Check token blacklist
- `backend/src/utils/helpers.ts` - Add redirect URL validation
- `backend/src/app.ts` - Add Permissions-Policy header, request ID middleware
- `backend/src/middleware/error.middleware.ts` - Verify production error hiding
- `backend/package.json` - Add dependencies

**Account Lockout Implementation:**

auth.service.ts login() method:
```typescript
async login(credentials: LoginCredentials, ip: string): Promise<AuthResult> {
  const user = await userRepository.findByEmail(credentials.email);
  if (!user) {
    throw new InvalidCredentialsError();
  }

  // Check lockout
  const lockoutKey = `lockout:${credentials.email}`;
  const attemptKey = `failed_login:${credentials.email}`;
  
  if (await redis.get(lockoutKey)) {
    throw new BusinessLogicError('Account temporarily locked due to multiple failed login attempts. Try again in 15 minutes.');
  }

  const isValid = await verifyPassword(credentials.password, user.password);
  
  if (!isValid) {
    // Increment failed attempts
    const attempts = await redis.incr(attemptKey);
    await redis.expire(attemptKey, 900);  // 15 min TTL
    
    if (attempts >= 5) {
      await redis.setex(lockoutKey, 900, 'locked');
      throw new BusinessLogicError('Account locked due to multiple failed login attempts.');
    }
    
    throw new InvalidCredentialsError(`Invalid credentials. ${5 - attempts} attempts remaining.`);
  }

  // Success - clear attempts
  await redis.del(attemptKey);
  
  // Continue with normal login flow...
}
```

**Token Blacklist:**

auth.service.ts:
```typescript
async logout(userId: string, accessToken: string): Promise<void> {
  const decoded = jwt.decode(accessToken) as any;
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  
  if (ttl > 0) {
    await redis.setex(`blacklist:${accessToken}`, ttl, '1');
  }
}
```

auth.middleware.ts authenticate():
```typescript
// After JWT verification
const isBlacklisted = await redis.get(`blacklist:${token}`);
if (isBlacklisted) {
  throw new UnauthorizedError('Token has been revoked');
}
```

**Refresh Token Rotation:**

auth.service.ts refreshToken():
```typescript
async refreshToken(oldRefreshToken: string): Promise<AuthTokens> {
  const payload = await verifyRefreshToken(oldRefreshToken);
  
  // Blacklist old refresh token
  const decoded = jwt.decode(oldRefreshToken) as any;
  const ttl = decoded.exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) {
    await redis.setex(`blacklist:${oldRefreshToken}`, ttl, '1');
  }
  
  // Generate new tokens (both access AND refresh)
  return generateTokens({
    userId: payload.userId,
    email: payload.email,
    role: payload.role
  });
}
```

**Enhanced XSS Sanitization:**

security.middleware.ts:
```typescript
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window as unknown as Window);

function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;
  
  // Aggressive: strip ALL HTML
  return DOMPurify.sanitize(str, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

// For rich text fields (product descriptions, reviews):
export function sanitizeRichText(str: string): string {
  return DOMPurify.sanitize(str, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
}
```

**Verification:**
```bash
cd backend && npm install && npm run lint
# Test account lockout:
# Try wrong password 5 times -> 6th attempt should be locked
# Test token blacklist:
# Login, save token, logout, try to use saved token -> should fail
# Test refresh rotation:
# Use refresh token -> get new tokens, try old refresh token again -> should fail
```

---

### FEAT-004: Performance & Operational Security (MEDIUM)

**Files Modified:**
- `backend/prisma/schema.prisma` - Add 6+ performance indexes
- `backend/src/repositories/audit-log.repository.ts` - **CREATE NEW**
- `backend/src/services/auth.service.ts` - Add audit logging calls
- All Redis usage locations - Add graceful degradation
- `backend/SECURITY.md` - Expand with comprehensive security documentation
- `backend/public/.well-known/security.txt` - **CREATE NEW**
- `backend/PRODUCTION_CHECKLIST.md` - **CREATE NEW**
- `backend/src/validators/*.validator.ts` - Audit and enhance constraints

**Database Indexes:**

schema.prisma Product model:
```prisma
model Product {
  // ... existing fields ...
  
  @@index([sellerId])
  @@index([categoryId])
  @@index([slug])
  @@index([active])
  @@index([name])
  @@index([price])
  @@index([rating])
  @@index([createdAt])
  // NEW COMPOUND INDEXES:
  @@index([active, categoryId, rating])  // Filtered category browsing
  @@index([active, sellerId])            // Seller product listings
  @@map("products")
}
```

schema.prisma Order model:
```prisma
model Order {
  // ... existing fields ...
  
  @@index([customerId])
  @@index([orderNumber])
  @@index([status])
  @@index([createdAt])
  // NEW COMPOUND INDEXES:
  @@index([customerId, status])    // User order history filtered
  @@index([status, createdAt])     // Admin dashboard sorted
  @@map("orders")
}
```

schema.prisma OrderItem model:
```prisma
model OrderItem {
  // ... existing fields ...
  
  @@index([orderId])
  @@index([productId])
  @@index([sellerId])
  // NEW COMPOUND INDEX:
  @@index([sellerId, createdAt])   // Seller order tracking
  @@map("order_items")
}
```

schema.prisma Review model:
```prisma
model Review {
  // ... existing fields ...
  
  @@index([productId])
  @@index([rating])
  @@index([approved])
  @@index([createdAt])
  // NEW COMPOUND INDEX:
  @@index([productId, createdAt, approved])  // Product reviews with moderation
  @@map("reviews")
}
```

Run migration:
```bash
cd backend
npx prisma migrate dev --name add-performance-indexes
npx prisma generate
```

**2FA Preparation:**

schema.prisma User model:
```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  // ... existing fields ...
  
  // NEW 2FA FIELDS (preparation only, not yet implemented):
  twoFactorEnabled  Boolean   @default(false)
  twoFactorSecret   String?   // Encrypted TOTP secret
  
  // ... relations ...
}
```

Run migration:
```bash
npx prisma migrate dev --name add-2fa-fields
npx prisma generate
```

**Redis Graceful Degradation Pattern:**

Everywhere Redis is used:
```typescript
let cachedData;
try {
  cachedData = await redis.get(key);
} catch (err) {
  logger.warn('Redis unavailable, continuing without cache', { error: err.message });
  cachedData = null;  // Proceed without cache
}

if (!cachedData) {
  // Fetch from database as fallback
  const data = await fetchFromDatabase();
  
  // Try to cache, but don't fail if Redis is down
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (err) {
    logger.warn('Failed to cache data, Redis unavailable', { error: err.message });
  }
  
  return data;
}
```

**Audit Logging:**

Create audit-log.repository.ts:
```typescript
import { prisma } from '../config/database';

export const auditLogRepository = {
  async logUserAction(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    details: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType,
          entityId,
          details,
          ipAddress,
          userAgent
        }
      });
    } catch (err) {
      logger.error('Failed to log audit event', { error: err, userId, action });
      // Don't throw - audit logging failure shouldn't break business logic
    }
  }
};
```

Use in auth.service.ts login():
```typescript
await auditLogRepository.logUserAction(
  user.id,
  'USER_LOGIN',
  'USER',
  user.id,
  { email: user.email },
  ip,
  userAgent
);
```

**Security Documentation:**

Create backend/SECURITY.md with sections:
1. Threat Model
2. Authentication & Authorization
3. Rate Limiting Strategy
4. XSS Prevention (DOMPurify)
5. CSRF Protection (double-submit cookie)
6. SQL Injection Prevention (Prisma ORM)
7. Token Management (httpOnly cookies, blacklist, rotation)
8. Account Lockout Policy (5 attempts / 15 min)
9. File Upload Security (magic numbers)
10. Audit Logging
11. Password Requirements
12. Error Handling
13. Secrets Management (generation, rotation)
14. Database Security (indexes, backup)
15. Future Enhancements (2FA ready)

Create backend/public/.well-known/security.txt:
```
Contact: mailto:security@agrimarket.com
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en, am
```

Create backend/PRODUCTION_CHECKLIST.md:
- [ ] All .env variables set with production values
- [ ] JWT_ACCESS_SECRET and JWT_REFRESH_SECRET generated with openssl (64+ chars)
- [ ] SESSION_SECRET generated with openssl (64+ chars)
- [ ] DATABASE_URL uses strong password (32+ chars)
- [ ] SMTP_PASS is app-specific password or OAuth token
- [ ] NODE_ENV=production
- [ ] DETAILED_ERRORS=false
- [ ] CORS_ORIGIN set to production frontend domain
- [ ] Redis configured and reachable
- [ ] Database backups configured (daily)
- [ ] SSL/TLS certificates installed
- [ ] Rate limits appropriate for production traffic
- [ ] Monitoring and alerting configured
- [ ] Security headers verified (helmet)
- [ ] CSRF protection enabled
- [ ] Audit logs retention policy defined
- [ ] Reviewed all 41 security items in this plan

**Verification:**
```bash
cd backend
npx prisma migrate dev --name add-performance-indexes
npx prisma migrate dev --name add-2fa-fields
npx prisma generate
npm run lint
npm test

# Performance test indexes:
# Connect to PostgreSQL
psql $DATABASE_URL
EXPLAIN ANALYZE SELECT * FROM products WHERE active = true AND "categoryId" = 'some-id' ORDER BY rating DESC LIMIT 20;
# Should show "Index Scan" using the compound index

# Manual checks:
cat backend/SECURITY.md  # Verify comprehensive
cat backend/public/.well-known/security.txt  # Verify RFC 9116 format
cat backend/PRODUCTION_CHECKLIST.md  # Verify complete

# Redis resilience test:
# Stop Redis: sudo systemctl stop redis (or equivalent)
npm run dev
# Hit authenticated endpoint -> should work (slower, logs Redis warnings)
```

---

## Final Verification Checklist

After all 4 features implemented:

### Backend Security Audit
- [ ] `grep -r "\$queryRawUnsafe\|\$executeRawUnsafe" backend/src` returns no matches
- [ ] `grep -r "localStorage" frontend/` only in node_modules (no JWT storage)
- [ ] `.gitignore` includes `.env` and `.env.*` patterns
- [ ] `.env.example` has NO real credentials, all placeholders
- [ ] All endpoints have appropriate rate limiting
- [ ] CSRF protection active on state-changing routes
- [ ] File uploads validate magic numbers not just MIME types
- [ ] Production errors hide stack traces and internal details
- [ ] JWT tokens in httpOnly, Secure, SameSite=Strict cookies
- [ ] Account lockout after 5 failed logins
- [ ] Token blacklist on logout
- [ ] Refresh tokens rotate (old invalidated)
- [ ] Password reset tokens single-use
- [ ] Email verification tokens expire in 24h
- [ ] Audit logs capture authentication and sensitive operations

### Database
- [ ] Prisma migrations applied successfully
- [ ] 6+ performance indexes added
- [ ] 2FA fields (twoFactorEnabled, twoFactorSecret) present in User model
- [ ] Query performance improved (test with EXPLAIN ANALYZE)

### Testing
- [ ] `npm run lint` passes in backend/
- [ ] `npm run lint` passes in frontend/
- [ ] `npm test` passes in backend/
- [ ] Manual login/logout flow works end-to-end
- [ ] Browser DevTools shows httpOnly cookies
- [ ] CSRF token in X-XSRF-TOKEN header on POST requests
- [ ] Failed login lockout triggers correctly
- [ ] Token blacklist prevents reuse after logout
- [ ] Redis failure doesn't crash application

### Documentation
- [ ] backend/SECURITY.md comprehensive and accurate
- [ ] backend/PRODUCTION_CHECKLIST.md complete
- [ ] backend/public/.well-known/security.txt exists
- [ ] .env.example has credential generation instructions

---

## Rollback Plan

If critical issues arise:

1. **Database Migrations**: `npx prisma migrate reset` (WARNING: data loss in dev)
2. **Code Revert**: `git revert <commit-hash>` for each feature commit
3. **Dependencies**: Remove added packages from package.json, `npm install`
4. **Cookies to localStorage**: Temporarily revert FEAT-002 if auth breaks
5. **CSRF Disable**: Comment out csrfProtection middleware if false positives

---

## Performance Impact

Expected changes:
- **Database queries**: 30-50% faster on indexed columns (products, orders, reviews)
- **Redis graceful degradation**: 2-3x slower on cache miss, but no crashes
- **File upload validation**: +50-100ms per file (magic number check)
- **Account lockout**: Redis lookup adds ~5ms per login
- **Token blacklist**: Redis lookup adds ~5ms per authenticated request
- **Overall API response time**: <10ms overhead for security checks

---

## Post-Implementation Recommendations

1. **Security Audit**: Third-party penetration testing
2. **Monitoring**: Set up Sentry or similar for error tracking
3. **Rate Limit Tuning**: Monitor production traffic and adjust limits
4. **2FA Implementation**: Complete the 2FA flow (fields already in schema)
5. **Content Security Policy**: Tighten CSP headers after frontend audit
6. **API Documentation**: Update Swagger/OpenAPI docs with security requirements
7. **Load Testing**: Verify performance under production traffic loads
8. **Backup Verification**: Test database restore procedures
9. **Incident Response Plan**: Document security incident handling
10. **Regular Updates**: Keep dependencies updated (npm audit, Dependabot)

---

## Support & Escalation

If blocked during implementation:
1. Check context.json for project-specific patterns
2. Review existing similar code (e.g., other repositories for Prisma patterns)
3. Test incrementally (don't implement all steps before verifying)
4. Preserve existing functionality (security fixes should not change behavior)
5. Document any deviations from plan in FEAT findings field

---

**End of Plan**
