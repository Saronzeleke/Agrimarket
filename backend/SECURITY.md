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
