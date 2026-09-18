# Phase 17: Security Review & Hardening

## Overview
This phase focuses on comprehensive security hardening of the AgriMarket API to protect against common vulnerabilities and attacks.

## Security Measures Implemented

### 1. HTTP Security Headers (Helmet)
- **Content Security Policy (CSP)**: Restricts resource loading to prevent XSS
- **Strict-Transport-Security (HSTS)**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables browser XSS protection

### 2. CORS (Cross-Origin Resource Sharing)
- **Origin Validation**: Only allows requests from whitelisted origins
- **Credentials Support**: Enables cookies/auth headers for cross-origin requests
- **Method Restrictions**: Limits allowed HTTP methods
- **Preflight Caching**: Reduces preflight request overhead

Configuration:
```typescript
Production Origins: [configured frontend URL]
Development Origins: [http://localhost:3000, http://localhost:5173]
Allowed Methods: GET, POST, PUT, PATCH, DELETE
Allowed Headers: Content-Type, Authorization
Max Age: 10 minutes
```

### 3. Rate Limiting
Multiple rate limiters to prevent abuse:

#### Global API Limiter
- **Limit**: 100 requests per 15 minutes per IP
- **Scope**: All API endpoints
- **Purpose**: Prevent general API abuse

#### Authentication Limiter
- **Limit**: 5 requests per 15 minutes per IP
- **Scope**: Login, register, resend verification
- **Purpose**: Prevent brute force attacks

#### Password Reset Limiter
- **Limit**: 3 requests per hour per IP
- **Scope**: Forgot password, reset password
- **Purpose**: Prevent password reset abuse

#### Order Limiter
- **Limit**: 10 requests per hour per IP
- **Scope**: Order creation, order cancellation, checkout
- **Purpose**: Prevent order spam/fraud

#### Review Limiter
- **Limit**: 5 requests per hour per IP
- **Scope**: Create/update reviews, flag reviews, helpful votes
- **Purpose**: Prevent review spam

#### Search Limiter
- **Limit**: 30 requests per minute per IP
- **Scope**: Search queries, autocomplete
- **Purpose**: Prevent search abuse

### 4. XSS Protection
Custom middleware that:
- Sanitizes HTML input to remove malicious scripts
- Strips dangerous HTML tags (script, iframe, object, embed)
- Removes javascript: protocol from URLs
- Preserves legitimate HTML structure

### 5. Input Sanitization
- Trims whitespace from string inputs
- Normalizes data structure
- Applied to all request bodies, query parameters, and URL params
- Prevents injection attacks

### 6. File Upload Validation
Validates file uploads with:
- **Size Limit**: 5MB maximum per file
- **Type Validation**: Only allows images (jpg, jpeg, png, gif, webp)
- **Extension Check**: Verifies file extension matches MIME type
- **Security**: Prevents malicious file uploads

### 7. Suspicious Activity Monitoring
Monitors and logs:
- SQL injection attempts (UNION, SELECT, DROP patterns)
- Path traversal attempts (../, ..\, absolute paths)
- Script injection attempts (<script>, javascript:)
- Automated bot behavior (suspicious user agents)
- Excessive requests from single IP

Logging includes:
- Request method and URL
- IP address
- User agent
- Request body (sanitized)
- Timestamp

### 8. Password Security
- **Bcrypt Hashing**: 12 rounds
- **Password Requirements**:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Password Reset Tokens**: 1-hour expiry
- **Email Verification Tokens**: 24-hour expiry

### 9. JWT Security
- **Access Tokens**: 15-minute expiry
- **Refresh Tokens**: 7-day expiry
- **Signing**: HS256 algorithm with strong secret
- **Claims**: User ID, email, role
- **Refresh Token Rotation**: New refresh token on each refresh

## Files Created/Modified

### New Files
1. `src/middleware/security.middleware.ts` - Security middleware functions
2. `src/middleware/rate-limit.middleware.ts` - Rate limiting configurations
3. `PHASE-17-SETUP.md` - This documentation file

### Modified Files
1. `src/app.ts` - Integrated security middleware
2. `src/routes/auth.routes.ts` - Added rate limiters
3. `src/routes/order.routes.ts` - Added rate limiters
4. `src/routes/checkout.routes.ts` - Added rate limiters
5. `src/routes/review.routes.ts` - Added rate limiters
6. `src/routes/search.routes.ts` - Added rate limiters

## Environment Variables
Ensure these are configured in `.env`:

```env
# JWT
JWT_SECRET=<strong-random-secret-minimum-32-characters>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX_REQUESTS=5

# Upload
UPLOAD_MAX_FILE_SIZE=5242880
UPLOAD_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

## Testing Security

### 1. Test Rate Limiting
```bash
# Test auth rate limiting (should block after 5 requests)
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

### 2. Test XSS Protection
```bash
# Should sanitize malicious input
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"Test1234!",
    "firstName":"<script>alert(\"XSS\")</script>",
    "lastName":"Normal"
  }'
```

### 3. Test SQL Injection Protection
```bash
# Should detect and log suspicious activity
curl -X GET "http://localhost:5000/api/v1/products?search=test' UNION SELECT * FROM users--"
```

### 4. Test CORS
```bash
# Should reject requests from non-whitelisted origins
curl -X GET http://localhost:5000/api/v1/products \
  -H "Origin: https://malicious-site.com"
```

### 5. Test File Upload Validation
```bash
# Should reject files over 5MB or non-image types
curl -X POST http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer <token>" \
  -F "file=@largefile.exe"
```

## Security Best Practices

### For Developers
1. **Never log sensitive data** (passwords, tokens, credit cards)
2. **Always validate input** on both client and server
3. **Use parameterized queries** to prevent SQL injection
4. **Keep dependencies updated** to patch security vulnerabilities
5. **Review security logs** regularly for suspicious activity

### For Deployment
1. **Use HTTPS only** in production (no HTTP)
2. **Set strong JWT secret** (minimum 32 random characters)
3. **Configure proper CORS origins** (no wildcards in production)
4. **Enable security headers** (already configured via Helmet)
5. **Set up monitoring** for security events
6. **Implement backup strategy** for database
7. **Use environment variables** for sensitive configuration
8. **Restrict database access** to application only
9. **Enable database encryption** at rest
10. **Set up firewall rules** to limit exposed ports

## Security Headers Reference

### Response Headers (Production)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self' data: https:
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1234567890
```

## Monitoring & Logging

### Security Events Logged
1. **Failed authentication attempts**
2. **Rate limit violations**
3. **Suspicious activity** (SQL injection, XSS, path traversal)
4. **Unauthorized access attempts**
5. **File upload failures**
6. **CORS violations**

### Log Location
- Development: Console output
- Production: `logs/app.log`, `logs/error.log`, `logs/security.log`

### Log Format
```json
{
  "level": "warn",
  "message": "Suspicious activity detected",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "ip": "192.168.1.1",
  "method": "GET",
  "url": "/api/v1/products",
  "userAgent": "BadBot/1.0",
  "details": {
    "type": "SQL_INJECTION_ATTEMPT",
    "pattern": "UNION SELECT"
  }
}
```

## Common Security Issues & Solutions

### Issue: CORS Errors in Development
**Solution**: Add your development URL to `CORS_ORIGIN` in `.env`

### Issue: Rate Limit Too Restrictive
**Solution**: Adjust limits in `src/middleware/rate-limit.middleware.ts`

### Issue: File Upload Rejected
**Solution**: Check file size (<5MB) and type (images only)

### Issue: JWT Token Expired
**Solution**: Use refresh token endpoint to get new access token

### Issue: Suspicious Activity False Positives
**Solution**: Review patterns in `security.middleware.ts` and adjust

## Next Steps

After completing Phase 17:
1. Review security logs for any issues
2. Perform penetration testing
3. Run security audit with `npm audit`
4. Proceed to Phase 18: Performance Optimization

## Security Checklist

- [x] HTTP security headers configured (Helmet)
- [x] CORS configured with origin validation
- [x] Rate limiting implemented (6 different limiters)
- [x] XSS protection middleware
- [x] Input sanitization middleware
- [x] File upload validation
- [x] Suspicious activity monitoring
- [x] Password security (bcrypt, validation)
- [x] JWT security (expiry, rotation)
- [x] SQL injection protection (Prisma ORM)
- [x] Error handling (no sensitive data leaks)
- [x] Security logging
- [x] Documentation

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
