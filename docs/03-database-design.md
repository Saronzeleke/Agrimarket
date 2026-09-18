# AgriMarket - Database Design Document

**Version:** 1.0  
**Last Updated:** September 18, 2026  
**Status:** Complete  
**Phase:** 2 - Database Schema + Migrations + Seed Data

---

## Table of Contents

1. [Overview](#1-overview)
2. [Entity Relationship Diagram](#2-entity-relationship-diagram)
3. [Schema Details](#3-schema-details)
4. [Indexes and Performance](#4-indexes-and-performance)
5. [Data Integrity](#5-data-integrity)
6. [Seed Data](#6-seed-data)
7. [Migration Strategy](#7-migration-strategy)
8. [Database Setup Guide](#8-database-setup-guide)

---

## 1. Overview

### 1.1 Database Technology

**PostgreSQL 14+** with **Prisma ORM**

**Rationale:**
- ACID compliance for financial transactions
- Complex relational queries with JOINs
- Mature and stable
- Excellent support for JSON data types
- Strong data integrity features

### 1.2 Schema Statistics

| Entity | Tables | Enums |
|--------|--------|-------|
| User Management | 4 | 1 |
| Product Catalog | 5 | 0 |
| Inventory | 2 | 1 |
| Shopping | 4 | 0 |
| Orders & Payments | 3 | 2 |
| Reviews | 1 | 0 |
| Notifications | 1 | 1 |
| Audit & Security | 3 | 0 |
| **Total** | **23** | **5** |

---

## 2. Entity Relationship Diagram

### 2.1 High-Level Overview

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│    User     │◄───1:1──┤  SellerProfile   │         │  Category   │
│   (Core)    │         │   (Business)     │         │ (Taxonomy)  │
└──────┬──────┘         └────────┬─────────┘         └──────┬──────┘
       │                         │                           │
       │ 1:N                     │ 1:N                       │ 1:N
       │                    ┌────▼─────┐◄──────────────────┘
       │                    │ Product  │
       │                    │  (Core)  │
       │                    └────┬─────┘
       │                         │
       │                         │ 1:1
       │                    ┌────▼──────────┐
       │                    │  Inventory    │
       │                    │ (Stock Mgmt)  │
       │                    └───────────────┘
       │
       ├────1:1────┐
       │           │
   ┌───▼───┐  ┌───▼────┐
   │ Cart  │  │Wishlist│
   └───┬───┘  └────┬───┘
       │           │
       │ 1:N       │ 1:N
   ┌───▼───────────▼──────┐
   │    Items             │
   └──────────────────────┘
       │
       │ N:1
   ┌───▼──────┐         ┌───────────┐
   │  Order   ├────1:1──►│ Payment   │
   └───┬──────┘         └───────────┘
       │
       │ 1:N
   ┌───▼──────────┐
   │ OrderItem    │
   └──────┬───────┘
          │
          │ N:1
   ┌──────▼──────┐
   │   Review    │
   └─────────────┘
```

### 2.2 Detailed Relationships

#### User Management Domain
```
User
├── 1:1 → SellerProfile
├── 1:1 → Cart
├── 1:1 → Wishlist
├── 1:N → Order
├── 1:N → Review
├── 1:N → Address
└── 1:N → Notification
```

#### Product Catalog Domain
```
Product
├── N:1 → SellerProfile (seller)
├── N:1 → Category
├── 1:N → ProductImage
├── 1:N → ProductVariant
├── 1:1 → Inventory
├── 1:N → CartItem
├── 1:N → WishlistItem
├── 1:N → OrderItem
└── 1:N → Review
```

#### Order Domain
```
Order
├── N:1 → User (customer)
├── 1:N → OrderItem
└── 1:1 → Payment
```

---

## 3. Schema Details

### 3.1 User Management

#### User Table

**Purpose**: Core user authentication and profile information

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| email | String | UNIQUE, NOT NULL | User email (login) |
| password | String | NOT NULL | Bcrypt hashed password |
| firstName | String | NOT NULL | User first name |
| lastName | String | NOT NULL | User last name |
| phone | String | NULLABLE | Contact phone |
| role | Enum | DEFAULT 'CUSTOMER' | User role |
| emailVerified | Boolean | DEFAULT false | Email verification status |
| active | Boolean | DEFAULT true | Account active status |
| createdAt | DateTime | DEFAULT now() | Account creation date |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

**Indexes:**
- `email` (UNIQUE)
- `role`
- `active`

**Business Rules:**
- Email must be unique across all users
- Password must be bcrypt hashed (12 rounds)
- Users can have only one role
- Admin cannot change own role
- Deleted users should be soft-deleted (active = false)

#### SellerProfile Table

**Purpose**: Business information for sellers

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| userId | UUID | FK(User), UNIQUE | User reference |
| businessName | String | NOT NULL | Business name |
| description | Text | NULLABLE | Business description |
| phone | String | NOT NULL | Business phone |
| location | String | NOT NULL | Ethiopian region |
| verified | Boolean | DEFAULT false | Admin verification status |
| rating | Decimal(3,2) | DEFAULT 0 | Average seller rating |
| reviewCount | Int | DEFAULT 0 | Total review count |
| createdAt | DateTime | DEFAULT now() | Profile creation date |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

**Indexes:**
- `userId` (UNIQUE)
- `verified`
- `rating`

**Business Rules:**
- One seller profile per user
- Only SELLER role users can have profile
- Unverified sellers cannot receive payments
- Rating calculated from product reviews

---

### 3.2 Product Catalog

#### Category Table

**Purpose**: Product taxonomy/classification

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| name | String | UNIQUE | Category name |
| slug | String | UNIQUE | URL-friendly identifier |
| description | String | NULLABLE | Category description |
| icon | String | NULLABLE | Icon name/URL |
| active | Boolean | DEFAULT true | Category visibility |
| order | Int | DEFAULT 0 | Display order |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

**Indexes:**
- `slug` (UNIQUE)
- `active`
- `order`

**Business Rules:**
- Category slug auto-generated from name
- Cannot delete category with products
- Inactive categories hidden from customers

#### Product Table

**Purpose**: Core product information

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| sellerId | UUID | FK(SellerProfile) | Seller reference |
| categoryId | UUID | FK(Category) | Category reference |
| name | String | NOT NULL | Product name |
| slug | String | UNIQUE | URL-friendly identifier |
| description | Text | NOT NULL | Product description |
| price | Decimal(10,2) | NOT NULL, > 0 | Price per unit in ETB |
| unit | String | NOT NULL | Unit (kg, liter, piece) |
| productionLocation | String | NULLABLE | Region, zone, woreda |
| harvestDate | DateTime | NULLABLE | Harvest/production date |
| qualityGrade | String | NULLABLE | Quality grade (A, B, C) |
| rating | Decimal(3,2) | DEFAULT 0 | Average rating |
| reviewCount | Int | DEFAULT 0 | Total reviews |
| viewCount | Int | DEFAULT 0 | Product views |
| orderCount | Int | DEFAULT 0 | Times ordered |
| active | Boolean | DEFAULT true | Product availability |
| createdAt | DateTime | DEFAULT now() | Creation timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

**Indexes:**
- `sellerId`
- `categoryId`
- `slug` (UNIQUE)
- `active`
- `name` (for search)
- `price` (for filtering)
- `rating` (for sorting)
- `createdAt` (for sorting)

**Business Rules:**
- Price must be positive
- Seller can only manage own products
- Slug auto-generated from name
- Inactive products not visible to customers
- Cannot delete product with pending orders

#### ProductImage Table

**Purpose**: Product photo gallery

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| productId | UUID | FK(Product) | Product reference |
| url | String | NOT NULL | Image URL/path |
| alt | String | NULLABLE | Alt text for accessibility |
| order | Int | DEFAULT 0 | Display order |
| createdAt | DateTime | DEFAULT now() | Upload timestamp |

**Indexes:**
- `productId`
- `order`

**Business Rules:**
- Maximum 5 images per product
- First image is primary/thumbnail
- Images deleted when product deleted

#### ProductVariant Table

**Purpose**: Product size/weight options

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| productId | UUID | FK(Product) | Product reference |
| name | String | NOT NULL | Variant name (e.g., "5kg") |
| price | Decimal(10,2) | NOT NULL, > 0 | Variant price |
| sku | String | UNIQUE, NULLABLE | Stock keeping unit |
| active | Boolean | DEFAULT true | Variant availability |

**Indexes:**
- `productId`
- `sku` (UNIQUE)

**Business Rules:**
- Optional feature (not all products need variants)
- Variant price can differ from base price
- SKU must be unique if provided

---

### 3.3 Inventory Management

#### Inventory Table

**Purpose**: Real-time stock tracking

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| productId | UUID | FK(Product), UNIQUE | Product reference |
| currentStock | Int | DEFAULT 0, >= 0 | Physical stock on hand |
| reservedStock | Int | DEFAULT 0, >= 0 | Stock in pending orders |
| lowStockThreshold | Int | DEFAULT 10 | Alert threshold |
| updatedAt | DateTime | AUTO UPDATE | Last update timestamp |

**Computed Fields:**
- `availableStock = currentStock - reservedStock` (not stored)

**Indexes:**
- `productId` (UNIQUE)
- `currentStock`

**Business Rules:**
- Available stock must never be negative
- Reserved stock ≤ current stock
- Prevent overselling through transactions
- Low stock alert when currentStock ≤ threshold

#### InventoryHistory Table

**Purpose**: Audit trail for stock changes

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| inventoryId | UUID | FK(Inventory) | Inventory reference |
| type | Enum | NOT NULL | Operation type |
| quantity | Int | NOT NULL | Change amount (+/-) |
| orderId | UUID | NULLABLE | Related order ID |
| notes | String | NULLABLE | Optional notes |
| createdAt | DateTime | DEFAULT now() | Timestamp |

**Types:**
- `ADDITION` - Stock added
- `SALE` - Stock sold (order confirmed)
- `ADJUSTMENT` - Manual adjustment
- `RETURN` - Order return/cancellation
- `CANCELLATION` - Order cancelled

**Indexes:**
- `inventoryId`
- `createdAt`
- `orderId`

---

### 3.4 Shopping Experience

#### Cart Table

**Purpose**: User shopping cart container

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| userId | UUID | FK(User), UNIQUE | User reference |
| createdAt | DateTime | DEFAULT now() | Cart creation |
| updatedAt | DateTime | AUTO UPDATE | Last modification |

**Indexes:**
- `userId` (UNIQUE)

**Business Rules:**
- One cart per user
- Created on first item addition
- Cleared after order creation

#### CartItem Table

**Purpose**: Items in shopping cart

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| cartId | UUID | FK(Cart) | Cart reference |
| productId | UUID | FK(Product) | Product reference |
| variantId | UUID | NULLABLE | Variant reference |
| quantity | Int | NOT NULL, > 0 | Item quantity |
| createdAt | DateTime | DEFAULT now() | Added timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update |

**Unique Constraint:** `(cartId, productId, variantId)`

**Indexes:**
- `cartId`
- `productId`

**Business Rules:**
- Quantity must be positive
- Cannot exceed available stock
- Duplicate items merged (quantity summed)
- Price fetched real-time (not stored)

#### Wishlist & WishlistItem Tables

**Purpose**: Save products for later

Similar structure to Cart/CartItem but simpler:
- No quantity (just product reference)
- No variants
- Long-lived (not cleared after orders)

---

### 3.5 Orders & Payments

#### Order Table

**Purpose**: Customer order information

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| orderNumber | String | UNIQUE | Human-readable ID |
| customerId | UUID | FK(User) | Customer reference |
| status | Enum | DEFAULT 'PENDING' | Order status |
| subtotal | Decimal(10,2) | NOT NULL | Items total |
| deliveryFee | Decimal(10,2) | NOT NULL | Shipping cost |
| discount | Decimal(10,2) | DEFAULT 0 | Discount amount |
| total | Decimal(10,2) | NOT NULL | Final amount |
| shippingAddress | JSON | NOT NULL | Delivery address |
| notes | Text | NULLABLE | Customer notes |
| createdAt | DateTime | DEFAULT now() | Order timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update |
| confirmedAt | DateTime | NULLABLE | Payment confirmed |
| shippedAt | DateTime | NULLABLE | Shipped timestamp |
| deliveredAt | DateTime | NULLABLE | Delivered timestamp |
| cancelledAt | DateTime | NULLABLE | Cancelled timestamp |

**Order Status Flow:**
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
        ↘ CANCELLED
DELIVERED → REFUNDED (admin only)
```

**Indexes:**
- `customerId`
- `orderNumber` (UNIQUE)
- `status`
- `createdAt`

**Business Rules:**
- Order number format: `AGM-YYYYMMDD-XXXXX`
- Total = subtotal + deliveryFee - discount
- Cannot modify order after PROCESSING
- Inventory reserved on creation
- Inventory deducted on CONFIRMED

#### OrderItem Table

**Purpose**: Products in an order

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| orderId | UUID | FK(Order) | Order reference |
| productId | UUID | FK(Product) | Product reference |
| sellerId | UUID | NOT NULL | Seller reference |
| quantity | Int | NOT NULL, > 0 | Order quantity |
| price | Decimal(10,2) | NOT NULL | **Locked price** |
| variantInfo | JSON | NULLABLE | Variant details |

**Indexes:**
- `orderId`
- `productId`
- `sellerId`

**Business Rules:**
- Price locked at order time (protects customer)
- Quantity must match inventory reservation
- Seller reference for order routing

#### Payment Table

**Purpose**: Payment transaction tracking

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| orderId | UUID | FK(Order), UNIQUE | Order reference |
| amount | Decimal(10,2) | NOT NULL | Payment amount |
| status | Enum | DEFAULT 'PENDING' | Payment status |
| provider | String | NOT NULL | Payment gateway |
| transactionId | String | UNIQUE, NULLABLE | Provider transaction ID |
| metadata | JSON | NULLABLE | Provider-specific data |
| createdAt | DateTime | DEFAULT now() | Initiated timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last update |
| paidAt | DateTime | NULLABLE | Payment confirmed |

**Payment Status:**
- `PENDING` - Initiated
- `PROCESSING` - In progress
- `PAID` - Successful
- `FAILED` - Failed
- `REFUNDED` - Refunded

**Providers:**
- `CHAPA` - Chapa Payment Gateway
- `TELEBIRR` - Telebirr
- `CBE_BIRR` - CBE Birr
- `MOCK` - Development mock

**Indexes:**
- `orderId` (UNIQUE)
- `status`
- `transactionId` (UNIQUE)

**Business Rules:**
- One payment per order
- Webhook processing must be idempotent
- Transaction ID from provider webhook

---

### 3.6 Reviews & Ratings

#### Review Table

**Purpose**: Product reviews and ratings

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| userId | UUID | FK(User) | Reviewer |
| productId | UUID | FK(Product) | Product reviewed |
| orderId | UUID | NOT NULL | Order reference |
| rating | Int | 1-5 | Star rating |
| title | String | NULLABLE | Review title |
| comment | Text | NULLABLE | Review text |
| verifiedPurchase | Boolean | DEFAULT true | Purchase verified |
| helpful | Int | DEFAULT 0 | Helpfulness votes |
| createdAt | DateTime | DEFAULT now() | Review timestamp |
| updatedAt | DateTime | AUTO UPDATE | Last edit |

**Unique Constraint:** `(userId, productId)` - One review per user per product

**Indexes:**
- `productId`
- `rating`
- `createdAt`

**Business Rules:**
- Only customers with delivered orders can review
- One review per product per user
- Can edit within 30 days
- Rating affects product and seller ratings

---

### 3.7 Supporting Tables

#### Address Table

**Purpose**: User shipping addresses

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| userId | UUID | FK(User) | User reference |
| fullName | String | NOT NULL | Recipient name |
| phone | String | NOT NULL | Contact phone |
| region | String | NOT NULL | Ethiopian region |
| zone | String | NOT NULL | Zone |
| woreda | String | NOT NULL | Woreda (district) |
| kebele | String | NOT NULL | Kebele |
| specificLocation | String | NOT NULL | Detailed location |
| addressType | String | DEFAULT 'HOME' | HOME/OFFICE |
| isDefault | Boolean | DEFAULT false | Default address |
| createdAt | DateTime | DEFAULT now() | Created |
| updatedAt | DateTime | AUTO UPDATE | Updated |

**Business Rules:**
- Users can have multiple addresses
- Only one default address per user
- Addresses not deleted (order history)

#### Notification Table

**Purpose**: In-app notifications

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| userId | UUID | FK(User) | User reference |
| type | Enum | NOT NULL | Notification type |
| title | String | NOT NULL | Notification title |
| message | Text | NOT NULL | Notification body |
| read | Boolean | DEFAULT false | Read status |
| metadata | JSON | NULLABLE | Additional data |
| createdAt | DateTime | DEFAULT now() | Timestamp |

**Notification Types:**
- `ORDER_CREATED`
- `ORDER_CONFIRMED`
- `ORDER_SHIPPED`
- `ORDER_DELIVERED`
- `ORDER_CANCELLED`
- `PAYMENT_CONFIRMED`
- `PAYMENT_FAILED`
- `LOW_STOCK`
- `NEW_REVIEW`
- `ACCOUNT_VERIFICATION`
- `PASSWORD_RESET`

#### AuditLog Table

**Purpose**: System audit trail

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK | Primary identifier |
| userId | UUID | NULLABLE | Acting user |
| action | String | NOT NULL | Action type |
| entityType | String | NOT NULL | Entity affected |
| entityId | UUID | NOT NULL | Entity ID |
| details | JSON | NULLABLE | Additional context |
| ipAddress | String | NULLABLE | Request IP |
| userAgent | String | NULLABLE | Browser/client |
| createdAt | DateTime | DEFAULT now() | Action timestamp |

**Audited Actions:**
- User registration/login
- Order creation/cancellation
- Payment confirmation
- Inventory adjustments
- Seller verification
- Admin actions

---

## 4. Indexes and Performance

### 4.1 Index Strategy

**Primary Keys** (Automatic)
- UUID on all tables
- Clustered indexes

**Foreign Keys** (Explicit)
```sql
-- User domain
CREATE INDEX idx_seller_profile_user_id ON seller_profiles(user_id);

-- Product domain
CREATE INDEX idx_product_seller_id ON products(seller_id);
CREATE INDEX idx_product_category_id ON products(category_id);
CREATE INDEX idx_product_image_product_id ON product_images(product_id);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);

-- Order domain
CREATE INDEX idx_order_customer_id ON orders(customer_id);
CREATE INDEX idx_order_item_order_id ON order_items(order_id);
CREATE INDEX idx_order_item_product_id ON order_items(product_id);
CREATE INDEX idx_payment_order_id ON payments(order_id);

-- Review domain
CREATE INDEX idx_review_product_id ON reviews(product_id);
CREATE INDEX idx_review_user_id ON reviews(user_id);
```

**Search Indexes**
```sql
-- Full-text search
CREATE INDEX idx_product_name ON products(name);
CREATE INDEX idx_category_slug ON categories(slug);
```

**Filter Indexes**
```sql
-- Common filters
CREATE INDEX idx_product_price ON products(price);
CREATE INDEX idx_product_rating ON products(rating);
CREATE INDEX idx_product_active ON products(active);
CREATE INDEX idx_order_status ON orders(status);
CREATE INDEX idx_payment_status ON payments(status);
```

**Composite Indexes**
```sql
-- Optimize common queries
CREATE INDEX idx_product_category_active 
  ON products(category_id, active);

CREATE INDEX idx_product_seller_active 
  ON products(seller_id, active);

CREATE INDEX idx_order_customer_status 
  ON orders(customer_id, status);
```

**Time-Series Indexes**
```sql
-- Analytics queries
CREATE INDEX idx_order_created_at ON orders(created_at);
CREATE INDEX idx_review_created_at ON reviews(created_at);
CREATE INDEX idx_audit_log_created_at ON audit_logs(created_at);
```

### 4.2 Query Optimization Guidelines

**1. Always use indexes for WHERE clauses**
```sql
-- Good
SELECT * FROM products WHERE active = true AND category_id = $1;

-- Bad (full table scan)
SELECT * FROM products WHERE LOWER(name) = 'coffee';
```

**2. Use Prisma select to fetch only needed columns**
```typescript
// Good - Only fetch needed fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    rating: true
  }
})

// Bad - Fetch all columns
const products = await prisma.product.findMany()
```

**3. Use include/select carefully to avoid N+1**
```typescript
// Good - Single query with join
const products = await prisma.product.findMany({
  include: {
    seller: { select: { businessName: true } },
    images: { take: 1, select: { url: true } }
  }
})

// Bad - N+1 queries
const products = await prisma.product.findMany()
for (const product of products) {
  const seller = await prisma.sellerProfile.findUnique(...)
}
```

**4. Always paginate large datasets**
```typescript
const products = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit,
  where: { active: true }
})
```

---

## 5. Data Integrity

### 5.1 Foreign Key Constraints

**Cascade Delete:**
- User → SellerProfile (CASCADE)
- User → Cart, Wishlist, Addresses (CASCADE)
- Product → Images, Variants, Inventory (CASCADE)
- Order → OrderItems, Payment (CASCADE)

**Restrict Delete:**
- Product with OrderItems (prevent deletion)
- Category with Products (prevent deletion)

### 5.2 Check Constraints

```sql
-- Positive prices
ALTER TABLE products ADD CONSTRAINT chk_product_price_positive
  CHECK (price > 0);

-- Valid ratings
ALTER TABLE products ADD CONSTRAINT chk_product_rating_range
  CHECK (rating >= 0 AND rating <= 5);

ALTER TABLE reviews ADD CONSTRAINT chk_review_rating_range
  CHECK (rating >= 1 AND rating <= 5);

-- Non-negative inventory
ALTER TABLE inventory ADD CONSTRAINT chk_inventory_non_negative
  CHECK (current_stock >= 0 AND reserved_stock >= 0);

-- Reserved stock validation
ALTER TABLE inventory ADD CONSTRAINT chk_reserved_stock_valid
  CHECK (reserved_stock <= current_stock);

-- Order totals
ALTER TABLE orders ADD CONSTRAINT chk_order_total_valid
  CHECK (total = subtotal + delivery_fee - discount);
```

### 5.3 Unique Constraints

```sql
-- Business logic uniqueness
ALTER TABLE users ADD CONSTRAINT uq_user_email UNIQUE (email);
ALTER TABLE products ADD CONSTRAINT uq_product_slug UNIQUE (slug);
ALTER TABLE categories ADD CONSTRAINT uq_category_slug UNIQUE (slug);
ALTER TABLE orders ADD CONSTRAINT uq_order_number UNIQUE (order_number);
ALTER TABLE payments ADD CONSTRAINT uq_payment_transaction_id 
  UNIQUE (transaction_id);

-- One-to-one relationships
ALTER TABLE seller_profiles ADD CONSTRAINT uq_seller_user_id 
  UNIQUE (user_id);
ALTER TABLE inventory ADD CONSTRAINT uq_inventory_product_id 
  UNIQUE (product_id);
ALTER TABLE payments ADD CONSTRAINT uq_payment_order_id 
  UNIQUE (order_id);

-- Composite uniqueness
ALTER TABLE cart_items ADD CONSTRAINT uq_cart_item 
  UNIQUE (cart_id, product_id, variant_id);
ALTER TABLE wishlist_items ADD CONSTRAINT uq_wishlist_item 
  UNIQUE (wishlist_id, product_id);
ALTER TABLE reviews ADD CONSTRAINT uq_review 
  UNIQUE (user_id, product_id);
```

---

## 6. Seed Data

### 6.1 Seed Data Overview

The seed script (`prisma/seed.ts`) populates the database with:

**Users:**
- 1 Admin account
- 3 Customer accounts
- 4 Seller accounts with profiles

**Products:**
- 3 Coffee products
- 4 Grain products
- 3 Spice products
- 2 Honey products
- 2 Pulse products
- **Total: 14 products** with images and some variants

**Categories:**
- Coffee, Grains, Pulses, Spices, Honey, Fruits, Vegetables, Oilseeds
- **Total: 8 categories**

**Other Data:**
- Inventory for all products
- 4 customer addresses
- 2 shopping carts with items
- 2 completed orders with payments
- 3 product reviews
- 3 notifications
- Audit logs

### 6.2 Test Credentials

**Admin:**
```
Email: admin@agrimarket.com
Password: Admin123!
```

**Customer:**
```
Email: customer1@example.com
Password: Customer123!
```

**Seller:**
```
Email: seller1@example.com
Password: Seller123!
```

### 6.3 Realistic Ethiopian Context

Seed data includes:
- Ethiopian names (Abebe, Almaz, Tigist, etc.)
- Ethiopian phone format (+251)
- Ethiopian regions (Oromia, Amhara, Tigray, Addis Ababa)
- Ethiopian address structure (Region, Zone, Woreda, Kebele)
- Ethiopian agricultural products (Teff, Berbere, Yirgacheffe Coffee)
- Ethiopian Birr (ETB) currency

---

## 7. Migration Strategy

### 7.1 Migration Workflow

1. **Initial Migration**
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Schema Changes**
   ```bash
   # Edit prisma/schema.prisma
   npx prisma migrate dev --name add_feature_x
   ```

3. **Production Deployment**
   ```bash
   npx prisma migrate deploy
   ```

### 7.2 Migration Best Practices

**DO:**
- ✅ Create descriptive migration names
- ✅ Test migrations on development data
- ✅ Review generated SQL before applying
- ✅ Backup database before production migrations
- ✅ Use transactions for data migrations

**DON'T:**
- ❌ Edit migration files manually (use `migrate resolve` if needed)
- ❌ Delete migration history
- ❌ Skip migrations
- ❌ Apply untested migrations to production

### 7.3 Rollback Strategy

**Development:**
```bash
# Reset database (destructive)
npx prisma migrate reset
```

**Production:**
```bash
# Create rollback migration manually
# or restore from backup
```

---

## 8. Database Setup Guide

### 8.1 Prerequisites

- Docker Desktop installed
- Node.js 18+ installed
- Git repository cloned

### 8.2 Quick Start

**1. Start PostgreSQL**
```bash
# Start database with Docker Compose
docker-compose up -d postgres

# Verify it's running
docker-compose ps
```

**2. Configure Environment**
```bash
cd backend
cp .env.example .env

# Edit .env with your configuration
# DATABASE_URL should be:
# postgresql://agrimarket:dev_password@localhost:5432/agrimarket_dev
```

**3. Install Dependencies**
```bash
npm install
```

**4. Run Migrations**
```bash
npx prisma migrate dev
```

**5. Seed Database**
```bash
npx prisma db seed
```

**6. Verify Data**
```bash
# Open Prisma Studio
npx prisma studio

# Or use Adminer at http://localhost:8080
```

### 8.3 Database Administration

**Prisma Studio (Recommended)**
```bash
npx prisma studio
# Opens at http://localhost:5555
```

**Adminer (Alternative)**
```bash
# Already running at http://localhost:8080
# Server: postgres
# Username: agrimarket
# Password: dev_password
# Database: agrimarket_dev
```

**psql (Command Line)**
```bash
docker exec -it agrimarket-postgres psql -U agrimarket -d agrimarket_dev
```

### 8.4 Common Tasks

**Reset Database**
```bash
npx prisma migrate reset
# Warning: This deletes all data!
```

**Generate Prisma Client**
```bash
npx prisma generate
```

**Format Schema**
```bash
npx prisma format
```

**Validate Schema**
```bash
npx prisma validate
```

---

## Appendix A: Complete Schema Reference

See `backend/prisma/schema.prisma` for the complete, authoritative schema definition.

**Total Statistics:**
- Tables: 23
- Enums: 5
- Relations: 40+
- Indexes: 50+

---

## Appendix B: Query Examples

**Find products with inventory**
```typescript
const products = await prisma.product.findMany({
  where: { active: true },
  include: {
    inventory: true,
    seller: { select: { businessName: true } },
    images: { take: 1, orderBy: { order: 'asc' } }
  }
})
```

**Create order with transaction**
```typescript
const order = await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: {...} })
  await tx.orderItem.createMany({ data: items })
  await tx.inventory.updateMany({ data: {...} })
  return order
})
```

**Calculate seller rating**
```typescript
const avgRating = await prisma.review.aggregate({
  where: { product: { sellerId: sellerId } },
  _avg: { rating: true },
  _count: { rating: true }
})
```

---

**Document Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-09-18 | Development Team | Initial version - Phase 2 complete |

---

**Next Phase: Phase 3 - Project Setup**
