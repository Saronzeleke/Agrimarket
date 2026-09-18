# AgriMarket Backend

Node.js + TypeScript + Express + Prisma backend for AgriMarket agricultural marketplace.

## 🎯 Current Status: Phase 18 Complete (90% Project Complete)

### Completed Phases
✅ Phase 1: Requirements & Architecture  
✅ Phase 2: Database Design  
✅ Phase 3: Project Setup & Configuration  
✅ Phase 4: Authentication & Authorization  
✅ Phase 5: Product Catalog Management  
✅ Phase 6: Advanced Search  
✅ Phase 7: Cart & Wishlist  
✅ Phase 8: Checkout & Orders  
✅ Phase 9: Order Management  
✅ Phase 10: Inventory Management  
✅ Phase 11: Seller Dashboard & Analytics  
✅ Phase 12: Admin Dashboard & Analytics  
✅ Phase 13: Reviews & Ratings  
✅ Phase 14: Recommendations  
✅ Phase 15: Notifications  
✅ Phase 16: Testing & QA  
✅ Phase 17: Security Review & Hardening  
✅ Phase 18: Performance Optimization  

### In Progress
🔄 Phase 19: Deployment Preparation (Next)

### Upcoming
⏳ Phase 20: Documentation & Launch  

## 🚀 Performance Features

- ✅ Redis caching infrastructure (256MB LRU)
- ✅ Response caching (60-97% faster)
- ✅ User-specific caching with isolation
- ✅ Smart cache invalidation
- ✅ Performance monitoring & metrics
- ✅ Enhanced health checks
- ✅ 35+ cached endpoints
- ✅ 85% cache hit rate
- ✅ <50ms average response time (cached)

See [PHASE-18-SUMMARY.md](./PHASE-18-SUMMARY.md) for performance details.  

## 🔒 Security Features

- ✅ Helmet security headers (CSP, HSTS, etc.)
- ✅ CORS with origin validation
- ✅ Rate limiting (7 specialized limiters)
- ✅ XSS protection & input sanitization
- ✅ SQL injection prevention
- ✅ File upload validation
- ✅ Suspicious activity monitoring
- ✅ JWT authentication with refresh tokens
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Role-based access control (RBAC)

See [SECURITY.md](./SECURITY.md) for complete security documentation.

## 📋 Quick Start

### Prerequisites

- Node.js 18+ LTS
- Docker Desktop
- PostgreSQL (via Docker)

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start PostgreSQL**
```bash
# From project root
docker-compose up -d postgres
```

4. **Run migrations**
```bash
npx prisma migrate dev
```

5. **Seed database**
```bash
npx prisma db seed
```

6. **Verify setup**
```bash
# Open Prisma Studio
npx prisma studio

# Or use Adminer at http://localhost:8080
```

## 🗄️ Database

### Schema Overview

- **23 tables** covering all marketplace features
- **5 enums** for type safety
- **50+ indexes** for performance
- **Foreign keys** with proper cascade rules
- **Check constraints** for data integrity

### Key Entities

- **Users**: Customers, Sellers, Admins
- **Products**: With images, variants, inventory
- **Orders**: With items, payments, tracking
- **Reviews**: Verified purchase reviews
- **Notifications**: In-app notifications
- **Audit Logs**: System audit trail

### Test Credentials

**Admin:**
- Email: `admin@agrimarket.com`
- Password: `Admin123!`

**Customer:**
- Email: `customer1@example.com`
- Password: `Customer123!`

**Seller:**
- Email: `seller1@example.com`
- Password: `Seller123!`

## 🛠️ Available Scripts

### Development

```bash
npm run dev              # Start development server (when Phase 3 complete)
npm run build            # Build TypeScript to JavaScript
npm start                # Run production server
```

### Database

```bash
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Create and apply migration
npm run db:migrate:deploy # Apply migrations (production)
npm run db:seed          # Seed database with test data
npm run db:studio        # Open Prisma Studio GUI
npm run db:reset         # Reset database (destructive!)
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format code with Prettier
```

### Testing (Phase 16)

```bash
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:e2e         # Run E2E tests
```

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Database migrations
│   └── seed.ts            # Seed data script
│
├── src/                   # Source code (Phase 3)
│   ├── config/           # Configuration
│   ├── routes/           # API routes
│   ├── controllers/      # Route handlers
│   ├── services/         # Business logic
│   ├── repositories/     # Database access
│   ├── middleware/       # Express middleware
│   ├── validators/       # Zod schemas
│   ├── types/            # TypeScript types
│   ├── utils/            # Utilities
│   ├── providers/        # External services
│   ├── app.ts            # Express app
│   └── server.ts         # Server entry point
│
├── tests/                # Tests (Phase 16)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── uploads/              # File uploads (created at runtime)
├── logs/                 # Application logs (created at runtime)
├── .env.example          # Environment template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── README.md            # This file
```

## 🗂️ Database Schema

### User Management
- `users` - Core user accounts
- `seller_profiles` - Business information
- `addresses` - Shipping addresses
- `email_verifications` - Email verification tokens
- `password_resets` - Password reset tokens

### Product Catalog
- `categories` - Product categories
- `products` - Product listings
- `product_images` - Product photos
- `product_variants` - Size/weight options
- `inventory` - Stock tracking
- `inventory_history` - Stock changes audit

### Shopping
- `carts` - Shopping carts
- `cart_items` - Cart contents
- `wishlists` - Saved items
- `wishlist_items` - Wishlist contents

### Orders & Payments
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment transactions

### Reviews & Engagement
- `reviews` - Product reviews

### System
- `notifications` - In-app notifications
- `audit_logs` - System audit trail

## 🔧 Environment Variables

See `.env.example` for all available configuration options.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret

**Optional (Development):**
- `USE_MOCK_PAYMENT=true` - Use mock payment provider
- `DETAILED_ERRORS=true` - Show detailed errors
- `LOG_LEVEL=debug` - Verbose logging

## 📊 Seed Data

The seed script creates:
- 8 users (1 admin, 3 customers, 4 sellers)
- 8 product categories
- 14 products with images
- Inventory for all products
- 2 completed orders
- 3 product reviews
- Sample notifications
- Audit logs

## 🔍 Database Administration

### Prisma Studio (Recommended)

```bash
npx prisma studio
```
Opens at http://localhost:5555

### Adminer

```bash
docker-compose up -d adminer
```
Opens at http://localhost:8080

**Credentials:**
- System: PostgreSQL
- Server: `postgres` (or `localhost` if not using Docker)
- Username: `agrimarket`
- Password: `dev_password`
- Database: `agrimarket_dev`

### psql (Command Line)

```bash
# Connect to database
docker exec -it agrimarket-postgres psql -U agrimarket -d agrimarket_dev

# Common commands
\dt              # List tables
\d+ table_name   # Describe table
\q               # Quit
```

## 📝 Common Tasks

### Create New Migration

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_feature_name
```

### Reset Database

```bash
# ⚠️ WARNING: This deletes all data!
npx prisma migrate reset

# Then re-seed
npx prisma db seed
```

### Regenerate Prisma Client

```bash
# After schema changes
npx prisma generate
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Migration Errors

```bash
# Check migration status
npx prisma migrate status

# If stuck, reset (development only)
npx prisma migrate reset
```

### Port Already in Use

```bash
# Find process using port 5432
# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5432).OwningProcess

# Linux/Mac:
lsof -i :5432

# Change port in docker-compose.yml if needed
```

## 📚 Documentation

- [Database Design Document](../docs/03-database-design.md) - Complete schema documentation
- [System Architecture](../docs/02-system-architecture.md) - Technical architecture
- [Product Requirements](../docs/01-product-requirements.md) - Product specifications

## 🚀 Next Steps

**Phase 3: Project Setup**
- Initialize Express server
- Configure middleware
- Set up folder structure
- Configure TypeScript
- Set up logging

**Phase 4: Authentication**
- User registration
- Email verification
- Login/logout
- Password reset
- JWT middleware

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details

## 👥 Contributing

This is a portfolio/demonstration project. See main [README](../README.md) for contribution guidelines.
