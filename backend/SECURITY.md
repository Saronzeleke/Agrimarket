# Security Guidelines for AgriMarket Backend

## Overview

This document outlines security best practices, credential management procedures, and deployment guidelines for the AgriMarket backend application.

## Environment Variables and Secrets Management

### Critical Secrets

The following environment variables contain sensitive credentials that **MUST** be secured:

1. **DATABASE_URL** - PostgreSQL connection string with username and password
2. **JWT_ACCESS_SECRET** - Secret key for signing access tokens
3. **JWT_REFRESH_SECRET** - Secret key for signing refresh tokens
4. **SESSION_SECRET** - Secret key for session encryption
5. **SMTP_PASS** - Email service password
6. **CHAPA_SECRET_KEY** - Chapa payment gateway secret
7. **CHAPA_WEBHOOK_SECRET** - Webhook verification secret
8. **TELEBIRR_APP_KEY** - Telebirr payment gateway key
9. **TELEBIRR_PUBLIC_KEY** - Telebirr public key
10. **CLOUDINARY_API_SECRET** (if used) - Image hosting API secret
11. **AWS_SECRET_ACCESS_KEY** (if used) - AWS S3 secret key

### Generating Secure Secrets

Use the following commands to generate cryptographically secure secrets:

```bash
# For JWT secrets, session secrets, and webhook secrets (64 bytes)
openssl rand -base64 64

# For database passwords (32 bytes)
openssl rand -base64 32

# Alternative using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

### Environment File Security

1. **NEVER commit `.env` files to version control**
   - The `.env` file is already listed in `.gitignore`
   - Always verify before committing: `git status` should not show `.env`

2. **Use `.env.example` as a template**
   - Contains placeholder values only
   - No real credentials should ever be in `.env.example`
   - Update `.env.example` when adding new environment variables

3. **Secure storage of production credentials**
   - Use environment variable management services (AWS Secrets Manager, HashiCorp Vault, etc.)
   - For production deployments, inject secrets via CI/CD pipelines
   - Never send credentials via email or chat applications

## Credential Rotation Procedure

Regular credential rotation is essential for security. Follow this procedure:

### 1. Database Password Rotation

```bash
# Generate new password
NEW_PASSWORD=$(openssl rand -base64 32)

# Update PostgreSQL user password
psql -U postgres -c "ALTER USER agrimarket_user PASSWORD '$NEW_PASSWORD';"

# Update DATABASE_URL in production environment
# Restart application to pick up new credentials
```

### 2. JWT Secret Rotation

```bash
# Generate new secrets
NEW_ACCESS_SECRET=$(openssl rand -base64 64)
NEW_REFRESH_SECRET=$(openssl rand -base64 64)

# Update environment variables
# Deploy application with new secrets
# Note: This will invalidate all existing tokens - users will need to re-login
```

### 3. Payment Gateway Credentials

Contact your payment provider (Chapa, Telebirr) to rotate API keys and secrets. Update environment variables and redeploy.

### Rotation Schedule

- **Production**: Rotate all secrets every 90 days
- **Staging**: Rotate every 180 days
- **Immediately rotate** if:
  - Credentials are accidentally committed to version control
  - A team member with access leaves the organization
  - Suspicious activity is detected
  - A security breach is suspected

## SQL Injection Prevention

This application uses **Prisma ORM** to prevent SQL injection attacks:

- All database queries use Prisma Client methods (`findMany`, `create`, `update`, `delete`, `groupBy`)
- Prisma automatically parameterizes all queries
- **Never use** `$queryRawUnsafe` or `$executeRawUnsafe` with user input
- If raw SQL is absolutely necessary, use `Prisma.sql` tagged templates with parameterized queries

### Safe Query Examples

```typescript
// ✅ SAFE: Prisma automatically parameterizes
await prisma.product.findMany({
  where: {
    name: { contains: userInput, mode: 'insensitive' }
  }
});

// ✅ SAFE: Prisma.sql tagged template
await prisma.$queryRaw`
  SELECT * FROM products WHERE name LIKE ${`%${userInput}%`}
`;

// ❌ UNSAFE: Direct string concatenation (SQL injection risk)
await prisma.$queryRawUnsafe(
  `SELECT * FROM products WHERE name LIKE '%${userInput}%'`
);
```

## Input Validation

All API inputs are validated using **Zod schemas** located in `src/validators/`:

- Validation happens before any business logic
- Type checking enforced by TypeScript
- Never trust user input - always validate

## Authentication and Authorization

- Passwords are hashed using **bcrypt** with 12 rounds (configurable via `BCRYPT_SALT_ROUNDS`)
- JWT tokens for stateless authentication
- Access tokens expire in 15 minutes (configurable)
- Refresh tokens expire in 7 days (configurable)
- Always verify user authorization before data access or modification

## Rate Limiting

Rate limiting is configured to prevent abuse:

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Search endpoints: 20 requests per 15 minutes

Configure limits via environment variables in `.env`.

### Rate Limiting Strategy

- **Window-based rate limiting** using Redis for distributed tracking
- Rate limits applied per IP address and per authenticated user
- Failed login attempts trigger account lockout (5 attempts within 15 minutes)
- **Graceful degradation**: If Redis is unavailable, in-memory fallback is used for critical features like account lockout

## XSS (Cross-Site Scripting) Prevention

- All user-generated content is sanitized before storage
- HTML output encoding applied automatically by frontend frameworks (React)
- Content-Security-Policy (CSP) headers should be configured on the frontend
- Never use `dangerouslySetInnerHTML` without sanitization
- File uploads validated for type and content

## CSRF (Cross-Site Request Forgery) Protection

- JWT tokens in HTTP-only cookies or Authorization headers
- SameSite cookie attribute set to 'Strict' or 'Lax'
- CORS policy restricts cross-origin requests
- State-changing operations require POST/PUT/DELETE methods (never GET)

## Token Management

- **Access tokens**: Short-lived (15 minutes), used for API authentication
- **Refresh tokens**: Longer-lived (7 days), used to obtain new access tokens
- **Token rotation**: Old refresh tokens are blacklisted when new ones are issued
- **Token blacklisting**: Logout immediately invalidates tokens via Redis
- **Secure storage**: Tokens should never be stored in localStorage - use httpOnly cookies or memory

## Account Lockout Policy

- **Failed login attempts**: 5 failed attempts within 15 minutes triggers account lockout
- **Lockout duration**: 15 minutes
- **Tracking**: Uses Redis for distributed systems, with in-memory fallback
- **Notification**: Users should be notified of failed login attempts (future enhancement)

## Audit Logging

All security-sensitive operations are logged to the `audit_logs` table:

- **USER_LOGIN**: Successful user authentication
- **USER_LOGOUT**: User session termination
- **PASSWORD_CHANGED**: Password changed by authenticated user
- **PASSWORD_RESET**: Password reset via recovery email
- **ORDER_CREATED**: New order placement
- **PAYMENT_CONFIRMED**: Payment successfully processed (planned)
- **ADMIN_ACTION**: Administrative actions (planned)

Audit logs include:
- User ID
- Action type
- Entity type and ID
- Timestamp
- IP address
- User agent string
- Additional contextual details (JSON)

**Retention**: Audit logs should be retained for at least 1 year for compliance and security investigations.

## Password Requirements

Password strength validation enforced by `validatePasswordStrength()`:

- **Minimum length**: 8 characters
- **Required character types**:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
  - At least one special character (!@#$%^&*(),.?":{}|<>)
- **Hashing**: bcrypt with 12 rounds (configurable via `BCRYPT_SALT_ROUNDS`)
- **Common password detection**: Should reject common/weak passwords (future enhancement)

## File Upload Security

File uploads (product images, profile pictures) must be secured:

- **Type validation**: Only allow specific MIME types (image/jpeg, image/png, image/webp)
- **Size limits**: Maximum 5MB per file
- **Content validation**: Verify actual file content matches declared MIME type
- **Storage**: Use cloud storage (Cloudinary, AWS S3) with separate domain
- **No execution**: Ensure uploaded files cannot be executed as code
- **Unique filenames**: Generate UUIDs to prevent filename collisions and enumeration

## Database Security

- **Parameterized queries**: All queries use Prisma ORM which prevents SQL injection
- **Least privilege**: Database user should only have necessary permissions (no DROP, ALTER in production)
- **Connection pooling**: Prisma manages connection pool efficiently
- **Encryption at rest**: Enable PostgreSQL transparent data encryption (TDE) in production
- **Encryption in transit**: Use SSL/TLS for database connections (`?sslmode=require` in DATABASE_URL)
- **Regular backups**: Automated daily backups with point-in-time recovery
- **Performance indexes**: Composite indexes on frequently queried columns (see `schema.prisma`)

## Error Handling

- **Production mode** (`NODE_ENV=production`, `DETAILED_ERRORS=false`):
  - Generic error messages returned to clients
  - Detailed error information only logged server-side
  - No stack traces exposed
- **Development mode**: Detailed errors for debugging
- **Logging**: All errors logged with context (user ID, request ID, timestamp)
- **Monitoring**: Set up error tracking (Sentry, Rollbar) for production alerts

## Secrets Management

- **Environment variables**: Store secrets in `.env` file (development) or secrets manager (production)
- **Never hardcode**: No secrets in source code
- **Rotation**: Regular credential rotation (every 90 days)
- **Access control**: Limit who can access production secrets
- **Encryption**: Secrets should be encrypted at rest in secrets management systems
- **Recommended tools**:
  - AWS Secrets Manager
  - HashiCorp Vault
  - Azure Key Vault
  - Google Cloud Secret Manager

## Two-Factor Authentication (2FA) Preparation

The database schema includes fields for 2FA:

- `User.twoFactorEnabled`: Boolean flag (default: false)
- `User.twoFactorSecret`: Encrypted TOTP secret

**Status**: Fields are present but 2FA is not yet implemented. This is preparation for Phase 2 security enhancements.

**Planned implementation**:
- TOTP (Time-based One-Time Password) using authenticator apps
- Backup codes for account recovery
- Mandatory 2FA for admin accounts
- Optional 2FA for customer accounts

## Rate Limiting

Rate limiting is configured to prevent abuse:

- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Search endpoints: 20 requests per 15 minutes

Configure limits via environment variables in `.env`.

## HTTPS and Transport Security

- **Always use HTTPS in production** - never HTTP
- Configure SSL/TLS certificates (Let's Encrypt recommended)
- Set `CORS_ORIGIN` to your frontend domain only
- Enable `CORS_CREDENTIALS=true` only if needed

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All secrets in `.env` have been regenerated (not using default/example values)
- [ ] `.env` file is not committed to version control
- [ ] `NODE_ENV=production` is set
- [ ] `DETAILED_ERRORS=false` is set (don't leak internal errors)
- [ ] `LOG_QUERIES=false` is set (don't log SQL queries with sensitive data)
- [ ] Database credentials use strong passwords
- [ ] HTTPS is enabled and enforced
- [ ] Rate limiting is configured appropriately
- [ ] CORS origin is restricted to your frontend domain
- [ ] All payment gateway credentials are production keys (not sandbox/test keys)
- [ ] Backup and disaster recovery procedures are in place

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT create a public GitHub issue**
2. Email security concerns to: [security@agrimarket.com] (replace with actual email)
3. Include detailed information about the vulnerability
4. Allow reasonable time for the issue to be addressed before public disclosure

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/security)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [bcrypt Best Practices](https://github.com/kelektiv/node.bcrypt.js#security-issues-and-concerns)

---

**Last Updated**: 2024-01-XX  
**Review Frequency**: Every 90 days or after security incidents
