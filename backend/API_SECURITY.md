# AgriMarket API Security Requirements

This document outlines security requirements for all API endpoints in the AgriMarket backend.

---

## Authentication

All authenticated endpoints require a valid JWT access token.

### Header Format

```
Authorization: Bearer <access_token>
```

### Token Lifecycle

- **Access Token**: Valid for 15 minutes
- **Refresh Token**: Valid for 7 days
- **Token Rotation**: Refresh tokens are blacklisted after use (rotation strategy)
- **Logout**: Tokens are immediately blacklisted on logout

### Endpoints

| Endpoint | Method | Authentication | Description |
|----------|--------|----------------|-------------|
| `/api/v1/auth/register` | POST | ❌ Public | User registration |
| `/api/v1/auth/login` | POST | ❌ Public | User login |
| `/api/v1/auth/refresh` | POST | ❌ Public | Refresh access token |
| `/api/v1/auth/logout` | POST | ✅ Required | Logout and blacklist token |
| `/api/v1/auth/verify-email` | POST | ❌ Public | Email verification |
| `/api/v1/auth/forgot-password` | POST | ❌ Public | Request password reset |
| `/api/v1/auth/reset-password` | POST | ❌ Public | Reset password with token |
| `/api/v1/auth/change-password` | POST | ✅ Required | Change password (authenticated user) |
| `/api/v1/auth/me` | GET | ✅ Required | Get current user profile |
| All other endpoints | * | ✅ Required | Unless specified as public |

---

## Rate Limiting

Rate limits prevent abuse and ensure fair resource usage.

### Global Limits

- **General API**: 100 requests per 15 minutes per IP
- **Authenticated API**: 200 requests per 15 minutes per user

### Endpoint-Specific Limits

| Endpoint Pattern | Limit | Window |
|-----------------|-------|--------|
| `/api/v1/auth/login` | 5 requests | 15 minutes |
| `/api/v1/auth/register` | 3 requests | 1 hour |
| `/api/v1/auth/forgot-password` | 3 requests | 1 hour |
| `/api/v1/auth/reset-password` | 5 requests | 15 minutes |
| `/api/v1/search/*` | 20 requests | 1 minute |
| `/api/v1/products/*` | 100 requests | 1 minute |

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1633012800
```

### Exceeding Limits

When rate limit is exceeded:

```json
{
  "status": "error",
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

**HTTP Status**: `429 Too Many Requests`

---

## CSRF Protection

### Strategy

- JWT tokens in `Authorization` header (not cookies) - **CSRF protection not required**
- If using cookies: `SameSite=Strict` attribute set
- State-changing operations use POST/PUT/DELETE/PATCH (never GET)

### CORS Policy

Only frontend domain is whitelisted:

```env
CORS_ORIGIN=https://agrimarket.com
CORS_CREDENTIALS=true
```

**Development**:
```env
CORS_ORIGIN=http://localhost:3001
```

---

## Input Validation

All API inputs are validated using Zod schemas before processing.

### Validation Rules

#### Email
```typescript
email: z.string().email().max(255).toLowerCase()
```

#### Password
```typescript
password: z.string()
  .min(8, "Password must be at least 8 characters")
  .max(100)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one digit")
  .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
```

#### String Fields
```typescript
firstName: z.string().min(2).max(50).trim()
lastName: z.string().min(2).max(50).trim()
phone: z.string().regex(/^(\+251|0)[97]\d{8}$/) // Ethiopian phone format
```

#### Numeric Fields
```typescript
price: z.number().positive().max(1000000)
quantity: z.number().int().positive().max(10000)
rating: z.number().int().min(1).max(5)
```

#### IDs (UUIDs)
```typescript
id: z.string().uuid()
```

### Validation Error Response

```json
{
  "status": "error",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**HTTP Status**: `400 Bad Request`

---

## File Upload Limits

File uploads (product images, profile pictures) have strict limits.

### Limits

- **Maximum file size**: 5MB per file
- **Allowed MIME types**: 
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- **Maximum files per request**: 5 (product images)

### Content Validation

- File extension matches MIME type
- Magic number verification (actual content type)
- Image dimensions validated (min: 300x300, max: 4096x4096)

### Upload Error Responses

```json
{
  "status": "error",
  "message": "File too large. Maximum size is 5MB.",
  "code": "FILE_TOO_LARGE"
}
```

```json
{
  "status": "error",
  "message": "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
  "code": "INVALID_FILE_TYPE"
}
```

**HTTP Status**: `400 Bad Request`

---

## Error Responses

### Standard Error Format

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "errors": [] // Optional: array of detailed errors
}
```

### HTTP Status Codes

| Status | Description | When Used |
|--------|-------------|-----------|
| 200 OK | Success | Successful GET, PUT, PATCH |
| 201 Created | Resource created | Successful POST (creation) |
| 204 No Content | Success, no data | Successful DELETE |
| 400 Bad Request | Invalid input | Validation errors, invalid data |
| 401 Unauthorized | Authentication required | Missing or invalid token |
| 403 Forbidden | Insufficient permissions | Valid token, but not authorized |
| 404 Not Found | Resource not found | Entity doesn't exist |
| 409 Conflict | Resource conflict | Duplicate email, order conflict |
| 422 Unprocessable Entity | Business logic error | Can't cancel delivered order |
| 429 Too Many Requests | Rate limit exceeded | Exceeding rate limits |
| 500 Internal Server Error | Server error | Unexpected server errors |

### Production Error Handling

In production (`NODE_ENV=production`, `DETAILED_ERRORS=false`):
- Generic error messages returned to clients
- No stack traces exposed
- Detailed errors logged server-side only

Example:
```json
{
  "status": "error",
  "message": "An unexpected error occurred. Please try again later.",
  "code": "INTERNAL_ERROR"
}
```

---

## Authorization

### Role-Based Access Control (RBAC)

| Role | Description | Permissions |
|------|-------------|-------------|
| CUSTOMER | Default user role | Browse products, place orders, write reviews |
| SELLER | Vendor/farmer | All customer permissions + manage own products, view own orders |
| ADMIN | Administrator | All permissions + manage users, manage all products, manage all orders |

### Endpoint Authorization

| Endpoint Pattern | Allowed Roles |
|-----------------|---------------|
| `/api/v1/products` (GET) | All (public) |
| `/api/v1/products` (POST) | SELLER, ADMIN |
| `/api/v1/products/:id` (PUT/DELETE) | SELLER (owner), ADMIN |
| `/api/v1/orders` (GET) | CUSTOMER (own orders), SELLER (items sold), ADMIN (all) |
| `/api/v1/admin/*` | ADMIN only |
| `/api/v1/seller/*` | SELLER, ADMIN |

### Authorization Error

```json
{
  "status": "error",
  "message": "You do not have permission to perform this action.",
  "code": "FORBIDDEN"
}
```

**HTTP Status**: `403 Forbidden`

---

## Audit Logging

Security-sensitive operations are logged for compliance and security investigations.

### Logged Actions

- `USER_LOGIN` - Successful login
- `USER_LOGOUT` - User logout
- `PASSWORD_CHANGED` - Password changed by user
- `PASSWORD_RESET` - Password reset via email
- `ORDER_CREATED` - New order placed
- `PAYMENT_CONFIRMED` - Payment processed successfully
- `ADMIN_ACTION` - Administrative actions

### Log Format

```json
{
  "id": "uuid",
  "userId": "user-uuid",
  "action": "USER_LOGIN",
  "entityType": "USER",
  "entityId": "user-uuid",
  "details": {
    "email": "user@example.com"
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Retention

Audit logs retained for **1 year minimum** for security and compliance purposes.

---

## API Versioning

Current version: **v1**

All endpoints prefixed with: `/api/v1/`

### Version Headers

```
X-API-Version: 1
```

### Deprecation

When endpoints are deprecated:
- Minimum 6 months notice
- `Deprecated` header included in response
- Documentation updated with migration path

```
Deprecated: true
Sunset: Fri, 01 Jan 2025 00:00:00 GMT
```

---

## Security Headers

All API responses include security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

---

## Testing and Development

### Development Mode

- Detailed error messages with stack traces
- Query logging enabled
- CORS more permissive (localhost)

### Staging/Production

- Generic error messages only
- No query logging
- CORS restricted to production domain
- Rate limits enforced
- All security features enabled

---

## Contact

For security vulnerabilities or concerns:

- **Email**: security@agrimarket.com
- **Security.txt**: `/.well-known/security.txt`

**Do NOT create public GitHub issues for security vulnerabilities.**

---

**Last Updated**: 2024-10-04  
**API Version**: v1  
**Maintained By**: AgriMarket Backend Team
