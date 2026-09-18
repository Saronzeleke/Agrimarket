# AgriMarket Security Guide

## Overview
This document outlines the security measures implemented in the AgriMarket API.

## Table of Contents
1. [Security Headers](#security-headers)
2. [Rate Limiting](#rate-limiting)
3. [Input Validation & Sanitization](#input-validation--sanitization)
4. [Authentication & Authorization](#authentication--authorization)
5. [File Upload Security](#file-upload-security)
6. [CORS Policy](#cors-policy)
7. [Security Monitoring](#security-monitoring)
8. [Best Practices](#best-practices)

## Security Headers

All responses include the following security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Forces HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Enables XSS protection |
| `Content-Security-Policy` | (see below) | Restricts resource loading |

### Content Security Policy (Production)
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self';
font-src 'self';
object-src 'none';
media-src 'self';
frame-src 'none';
```

## Rate Limiting

### Rate Limiter Summary

| Endpoint Type | Limit | Window | Scope |
|--------------|-------|--------|-------|
| General API | 100 requests | 15 minutes | Per IP |
| Authentication | 5 requests | 15 minutes | Per IP |
| Password Reset | 3 requests | 1 hour | Per IP |
| Email Verification | 3 requests | 1 hour | Per IP |
| Order Creation | 10 requests | 1 hour | Per User/IP |
| Review Submission | 5 requests | 1 hour | Per User/IP |
| Search Queries | 30 requests | 1 minute | Per IP |

### Rate Limit Headers

When a request is rate-limited, the response includes:
- **Status Code**: `429 Too Many Requests`
- **Headers**:
  - `RateLimit-Limit`: Maximum requests allowed
  - `RateLimit-Remaining`: Requests remaining
  - `RateLimit-Reset`: Timestamp when limit resets

### Example Rate Limit Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again after 15 minutes."
  }
}
```

## Input Validation & Sanitization

### XSS Protection

All user input is automatically sanitized to prevent XSS attacks:

**Characters Encoded:**
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#x27;`
- `/` → `&#x2F;`

**Example:**
```javascript
// Input
firstName: "<script>alert('XSS')</script>"

// Sanitized Output
firstName: "&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;"
```

### Parameter Pollution Prevention

Duplicate query parameters are detected and logged:

```
❌ /products?category=fruits&category=vegetables
✅ /products?category=fruits
```

### Suspicious Activity Detection

The following patterns trigger security logging:

| Pattern | Description |
|---------|-------------|
| `<script` | Script injection |
| `javascript:` | JavaScript protocol |
| `on\w+=` | Event handler injection |
| `../` | Path traversal |
| `/etc/passwd` | System file access |
| `union.*select` | SQL injection |
| `exec(` | Command injection |

## Authentication & Authorization

### Password Requirements

Passwords must meet the following criteria:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number
- ✅ At least one special character

### Password Storage

- **Algorithm**: bcrypt
- **Cost Factor**: 12 rounds
- **Salt**: Automatically generated per password

### JWT Token Security

#### Access Tokens
- **Expiry**: 15 minutes
- **Use**: API authentication
- **Storage**: Memory (recommended) or sessionStorage

#### Refresh Tokens
- **Expiry**: 7 days
- **Use**: Obtaining new access tokens
- **Storage**: HttpOnly cookie (recommended) or localStorage

#### Token Claims
```json
{
  "userId": "clx123456789",
  "email": "user@example.com",
  "role": "BUYER",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| **BUYER** | Browse, purchase, review products |
| **SELLER** | Manage own products, view sales |
| **ADMIN** | Full system access, user management |

### Protected Routes

All routes under the following paths require authentication:
- `/api/v1/cart`
- `/api/v1/wishlist`
- `/api/v1/orders`
- `/api/v1/checkout`
- `/api/v1/addresses`
- `/api/v1/seller/*` (SELLER or ADMIN role)
- `/api/v1/admin/*` (ADMIN role only)

## File Upload Security

### Restrictions

| Aspect | Limit | Validation |
|--------|-------|------------|
| **File Size** | 5MB maximum | Server-side |
| **File Types** | Images only | MIME type check |
| **Allowed Formats** | JPEG, PNG, WebP | Extension + MIME |
| **Filename** | 255 chars max | Sanitized |

### Filename Sanitization

- Replace special characters with underscore
- Limit to alphanumeric, dots, hyphens
- Remove multiple consecutive dots
- Truncate to 255 characters

**Example:**
```
Original: "../../../etc/passwd.jpg"
Sanitized: "_._._._etc_passwd.jpg"
```

### Rejected File Types

The following file types are NOT allowed:
- ❌ Executables (.exe, .bat, .sh)
- ❌ Scripts (.php, .js, .py)
- ❌ Archives (.zip, .rar, .tar)
- ❌ Documents (.pdf, .doc, .xls)
- ❌ Videos (.mp4, .avi, .mov)

## CORS Policy

### Allowed Origins

**Production:**
- Only configured frontend origin (set in `.env`)

**Development:**
- `http://localhost:3000` (React default)
- `http://localhost:5173` (Vite default)
- Configured CORS_ORIGIN

### CORS Headers

```
Access-Control-Allow-Origin: [whitelisted-origin]
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept
Access-Control-Max-Age: 600
```

### Preflight Requests

OPTIONS requests are handled automatically for:
- Cross-origin requests
- Requests with custom headers
- Requests with credentials

## Security Monitoring

### What is Logged

1. **Failed Authentication Attempts**
   ```json
   {
     "level": "warn",
     "message": "Authentication failed",
     "email": "user@example.com",
     "ip": "192.168.1.1",
     "timestamp": "2024-01-15T10:30:00Z"
   }
   ```

2. **Rate Limit Violations**
   ```json
   {
     "level": "warn",
     "message": "Rate limit exceeded",
     "ip": "192.168.1.1",
     "endpoint": "/api/v1/auth/login",
     "timestamp": "2024-01-15T10:30:00Z"
   }
   ```

3. **Suspicious Activity**
   ```json
   {
     "level": "warn",
     "message": "Suspicious activity detected",
     "ip": "192.168.1.1",
     "method": "GET",
     "url": "/api/v1/products?search=<script>alert('xss')</script>",
     "pattern": "/<script/i",
     "timestamp": "2024-01-15T10:30:00Z"
   }
   ```

4. **Authorization Failures**
   ```json
   {
     "level": "warn",
     "message": "Unauthorized access attempt",
     "userId": "clx123456789",
     "requiredRole": "ADMIN",
     "userRole": "BUYER",
     "endpoint": "/api/v1/admin/users",
     "timestamp": "2024-01-15T10:30:00Z"
   }
   ```

### Log Locations

- **Development**: Console output
- **Production**: 
  - `logs/app.log` - General application logs
  - `logs/error.log` - Error logs
  - `logs/security.log` - Security events (recommended)

## Best Practices

### For Developers

1. **Never Log Sensitive Data**
   ```javascript
   // ❌ Bad
   logger.info('User logged in', { password: req.body.password });
   
   // ✅ Good
   logger.info('User logged in', { userId: user.id, email: user.email });
   ```

2. **Always Validate Input**
   ```javascript
   // ❌ Bad
   const product = await prisma.product.findUnique({
     where: { id: req.params.id }
   });
   
   // ✅ Good
   const validation = productIdSchema.safeParse(req.params);
   if (!validation.success) {
     throw new ValidationError('Invalid product ID');
   }
   const product = await prisma.product.findUnique({
     where: { id: validation.data.id }
   });
   ```

3. **Use Parameterized Queries**
   ```javascript
   // ❌ Bad (vulnerable to SQL injection)
   await prisma.$executeRaw(`SELECT * FROM users WHERE email = '${email}'`);
   
   // ✅ Good (using Prisma's query builder)
   await prisma.user.findUnique({ where: { email } });
   ```

4. **Handle Errors Properly**
   ```javascript
   // ❌ Bad
   catch (error) {
     res.status(500).json({ error: error.message, stack: error.stack });
   }
   
   // ✅ Good
   catch (error) {
     logger.error('Operation failed', { error });
     res.status(500).json({
       success: false,
       error: {
         code: 'INTERNAL_ERROR',
         message: 'An error occurred processing your request'
       }
     });
   }
   ```

### For Deployment

1. **Environment Variables**
   - ✅ Use strong JWT secrets (minimum 32 random characters)
   - ✅ Set correct CORS origins (no wildcards)
   - ✅ Enable HTTPS only
   - ✅ Set NODE_ENV=production

2. **Database Security**
   - ✅ Use connection pooling
   - ✅ Enable SSL/TLS connections
   - ✅ Restrict database access by IP
   - ✅ Use strong database passwords
   - ✅ Enable encryption at rest

3. **Server Security**
   - ✅ Keep dependencies updated
   - ✅ Run `npm audit` regularly
   - ✅ Use a process manager (PM2, systemd)
   - ✅ Enable firewall rules
   - ✅ Limit exposed ports

4. **Monitoring**
   - ✅ Set up error tracking (Sentry, Rollbar)
   - ✅ Monitor server resources
   - ✅ Set up security alerts
   - ✅ Regular log review

## Security Checklist

### Development
- [ ] All user input is validated
- [ ] Sensitive data is not logged
- [ ] Parameterized queries are used
- [ ] Error messages don't leak info
- [ ] Dependencies are up to date

### Deployment
- [ ] HTTPS is enforced
- [ ] Strong JWT secret is configured
- [ ] CORS origins are properly set
- [ ] Rate limits are configured
- [ ] Security headers are enabled
- [ ] Database is secured
- [ ] Firewall rules are set
- [ ] Monitoring is active
- [ ] Backup strategy is in place

## Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security@agrimarket.com (replace with actual email)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to resolve the issue.

## Security Updates

This security guide is maintained alongside the codebase. Last updated: Phase 17 - Security Review & Hardening

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
