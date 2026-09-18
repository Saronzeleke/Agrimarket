# AgriMarket - System Architecture Document

**Version:** 1.0  
**Last Updated:** September 18, 2026  
**Status:** Draft  
**Author:** Architecture Team

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Database Architecture](#4-database-architecture)
5. [Security Architecture](#5-security-architecture)
6. [Recommendation System](#6-recommendation-system)
7. [Performance Optimization](#7-performance-optimization)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Monitoring & Logging](#9-monitoring--logging)
10. [Technology Decisions](#10-technology-decisions)
11. [Architectural Trade-offs](#11-architectural-trade-offs)

---

## 1. Architecture Overview

### 1.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│    React + TypeScript + TanStack Query + Tailwind CSS       │
│                      + shadcn/ui                            │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         │ (JSON)
┌────────────────────────▼────────────────────────────────────┐
│                    API LAYER                                │
│                   (Express.js)                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Request Validation (Zod)                             │  │
│  │ Authentication Middleware (JWT)                      │  │
│  │ Authorization Middleware (RBAC)                      │  │
│  │ Error Handling Middleware                            │  │
│  │ Rate Limiting Middleware                             │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  CONTROLLER LAYER                           │
│  - Route handlers                                           │
│  - Request/response transformation                          │
│  - Input validation                                         │
│  - Response formatting                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   SERVICE LAYER                             │
│  - Business logic implementation                            │
│  - Transaction management                                   │
│  - Cross-entity operations                                  │
│  - Authorization checks                                     │
│  - Data transformation                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  REPOSITORY LAYER                           │
│  - Database operations (Prisma)                             │
│  - Query building                                           │
│  - Data mapping                                             │
│  - Database transaction handling                            │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   DATABASE LAYER                            │
│                   (PostgreSQL 14+)                          │
│  - Relational data storage                                  │
│  - ACID transactions                                        │
│  - Constraints and triggers                                 │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Supporting Systems (Cross-Cutting Concerns)

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Authentication  │  │   Notification   │  │     Payment      │
│     Service      │  │      Service     │  │     Service      │
│  - JWT tokens    │  │  - Email         │  │  - Chapa         │
│  - Password hash │  │  - In-app        │  │  - Telebirr      │
│  - Email verify  │  │  - Preferences   │  │  - Mock (dev)    │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Recommendation  │  │     Logging      │  │   File Upload    │
│     Service      │  │     Service      │  │     Service      │
│  - Personalized  │  │  - Structured    │  │  - Image resize  │
│  - Similar items │  │  - Audit logs    │  │  - Validation    │
│  - Trending      │  │  - Error track   │  │  - Storage       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

### 1.3 Architectural Style

**Layered Architecture** with clear separation of concerns:

- **Presentation Layer**: React frontend with component-based UI
- **API Layer**: RESTful Express.js endpoints
- **Business Logic Layer**: Service classes containing domain logic
- **Data Access Layer**: Repository pattern with Prisma ORM
- **Database Layer**: PostgreSQL relational database

**Key Principles:**
- Single Responsibility Principle
- Dependency Inversion (depend on interfaces, not implementations)
- Separation of Concerns
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple, Stupid)

---

## 2. Frontend Architecture

### 2.1 Project Structure

```
frontend/
├── public/                       # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   └── placeholder.jpg
│   └── favicon.ico
│
├── src/
│   ├── components/               # Reusable components
│   │   ├── ui/                   # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── products/             # Product-related components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductFilter.tsx
│   │   │   └── ProductDetails.tsx
│   │   │
│   │   ├── cart/                 # Cart components
│   │   │   ├── CartItem.tsx
│   │   │   ├── CartSummary.tsx
│   │   │   └── CartDrawer.tsx
│   │   │
│   │   ├── forms/                # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── AddressForm.tsx
│   │   │
│   │   └── common/               # Common components
│   │       ├── Loading.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       └── Pagination.tsx
│   │
│   ├── pages/                    # Page components
│   │   ├── HomePage.tsx
│   │   ├── ProductsPage.tsx
│   │   ├── ProductDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   │
│   │   ├── seller/               # Seller pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProductsPage.tsx
│   │   │   ├── OrdersPage.tsx
│   │   │   └── AnalyticsPage.tsx
│   │   │
│   │   └── admin/                # Admin pages
│   │       ├── DashboardPage.tsx
│   │       ├── UsersPage.tsx
│   │       ├── SellersPage.tsx
│   │       └── ProductsPage.tsx
│   │
│   ├── lib/                      # Utilities and configuration
│   │   ├── api/                  # API client
│   │   │   ├── client.ts         # Axios instance
│   │   │   ├── auth.api.ts
│   │   │   ├── products.api.ts
│   │   │   ├── cart.api.ts
│   │   │   ├── orders.api.ts
│   │   │   └── recommendations.api.ts
│   │   │
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useProducts.ts
│   │   │   ├── useCart.ts
│   │   │   ├── useOrders.ts
│   │   │   └── usePagination.ts
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │   ├── format.ts         # Formatting (currency, date)
│   │   │   ├── validation.ts     # Client-side validation
│   │   │   ├── storage.ts        # localStorage helpers
│   │   │   └── helpers.ts        # General helpers
│   │   │
│   │   └── constants.ts          # App constants
│   │
│   ├── types/                    # TypeScript types
│   │   ├── api.ts                # API response types
│   │   ├── entities.ts           # Domain entity types
│   │   ├── forms.ts              # Form types
│   │   └── index.ts
│   │
│   ├── contexts/                 # React contexts
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   │
│   ├── routes/                   # Routing configuration
│   │   ├── AppRouter.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── routes.config.ts
│   │
│   ├── styles/                   # Global styles
│   │   └── globals.css
│   │
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # Entry point
│   └── vite-env.d.ts
│
├── .env.example                  # Environment variables template
├── .eslintrc.cjs                 # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

### 2.2 State Management Strategy

#### Server State (TanStack Query)

Manages all server-synchronized data:
- Product data
- User data
- Order data
- Cart data (synced with backend)
- Recommendations
- Seller analytics

**Example Configuration:**

```typescript
// Query for fetching products
const { data, isLoading, error } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => fetchProducts(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
})

// Mutation for creating product
const { mutate, isPending } = useMutation({
  mutationFn: createProduct,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    toast.success('Product created successfully')
  },
  onError: (error) => {
    toast.error('Failed to create product')
  },
})
```

#### Client State (React Context/useState)

Manages local UI state:
- Auth state (current user, role)
- UI state (modals, dropdowns, sidebars)
- Form state (React Hook Form)
- Theme preferences
- Temporary cart before login

**Example Auth Context:**

```typescript
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>(...)
```

#### URL State (Query Parameters)

Manages state in URL for bookmarkability:
- Search queries
- Filter selections
- Pagination (page number)
- Sort order
- View preferences

**Example:**
```
/products?category=coffee&location=oromia&minPrice=100&maxPrice=500&sort=price_asc&page=2
```

### 2.3 Data Fetching Patterns

#### Query Keys Structure

```typescript
// Hierarchical query keys for efficient caching
const queryKeys = {
  products: {
    all: ['products'] as const,
    lists: () => [...queryKeys.products.all, 'list'] as const,
    list: (filters: ProductFilters) => 
      [...queryKeys.products.lists(), filters] as const,
    details: () => [...queryKeys.products.all, 'detail'] as const,
    detail: (id: string) => 
      [...queryKeys.products.details(), id] as const,
  },
  cart: {
    all: ['cart'] as const,
    items: () => [...queryKeys.cart.all, 'items'] as const,
  },
  orders: {
    all: ['orders'] as const,
    lists: () => [...queryKeys.orders.all, 'list'] as const,
    list: (filters: OrderFilters) => 
      [...queryKeys.orders.lists(), filters] as const,
    detail: (id: string) => 
      [...queryKeys.orders.all, id] as const,
  },
}
```

#### Optimistic Updates

For better UX on mutations:

```typescript
const { mutate } = useMutation({
  mutationFn: updateCartItem,
  onMutate: async (updatedItem) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['cart'] })
    
    // Snapshot previous value
    const previousCart = queryClient.getQueryData(['cart'])
    
    // Optimistically update
    queryClient.setQueryData(['cart'], (old) => ({
      ...old,
      items: old.items.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    }))
    
    return { previousCart }
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['cart'], context.previousCart)
  },
  onSettled: () => {
    // Refetch after mutation
    queryClient.invalidateQueries({ queryKey: ['cart'] })
  },
})
```

### 2.4 Routing Configuration

#### Route Structure

```typescript
// Public routes
const publicRoutes = [
  { path: '/', component: HomePage },
  { path: '/products', component: ProductsPage },
  { path: '/products/:slug', component: ProductDetailPage },
  { path: '/categories/:slug', component: CategoryPage },
  { path: '/search', component: SearchPage },
  { path: '/login', component: LoginPage },
  { path: '/register', component: RegisterPage },
]

// Protected customer routes
const customerRoutes = [
  { path: '/cart', component: CartPage },
  { path: '/checkout', component: CheckoutPage },
  { path: '/orders', component: OrdersPage },
  { path: '/orders/:id', component: OrderDetailPage },
  { path: '/profile', component: ProfilePage },
  { path: '/wishlist', component: WishlistPage },
]

// Protected seller routes
const sellerRoutes = [
  { path: '/seller/dashboard', component: SellerDashboardPage },
  { path: '/seller/products', component: SellerProductsPage },
  { path: '/seller/products/new', component: CreateProductPage },
  { path: '/seller/products/:id/edit', component: EditProductPage },
  { path: '/seller/orders', component: SellerOrdersPage },
  { path: '/seller/inventory', component: InventoryPage },
  { path: '/seller/analytics', component: AnalyticsPage },
]

// Protected admin routes
const adminRoutes = [
  { path: '/admin/dashboard', component: AdminDashboardPage },
  { path: '/admin/users', component: UsersManagementPage },
  { path: '/admin/sellers', component: SellersManagementPage },
  { path: '/admin/products', component: ProductModerationPage },
  { path: '/admin/orders', component: OrdersManagementPage },
  { path: '/admin/categories', component: CategoriesPage },
  { path: '/admin/audit-logs', component: AuditLogsPage },
]
```

#### Route Protection

```typescript
// ProtectedRoute component
function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode
  allowedRoles: Role[] 
}) {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  
  return <>{children}</>
}
```

---

## 3. Backend Architecture

### 3.1 Project Structure

```
backend/
├── src/
│   ├── config/                   # Configuration
│   │   ├── database.ts           # Prisma client initialization
│   │   ├── env.ts                # Environment validation (Zod)
│   │   ├── constants.ts          # Application constants
│   │   └── logger.ts             # Winston logger setup
│   │
│   ├── routes/                   # API routes
│   │   ├── index.ts              # Route aggregation
│   │   ├── auth.routes.ts        # /api/auth/*
│   │   ├── products.routes.ts    # /api/products/*
│   │   ├── categories.routes.ts  # /api/categories/*
│   │   ├── cart.routes.ts        # /api/cart/*
│   │   ├── wishlist.routes.ts    # /api/wishlist/*
│   │   ├── orders.routes.ts      # /api/orders/*
│   │   ├── reviews.routes.ts     # /api/reviews/*
│   │   ├── sellers.routes.ts     # /api/seller/*
│   │   ├── admin.routes.ts       # /api/admin/*
│   │   ├── recommendations.routes.ts # /api/recommendations/*
│   │   └── payments.routes.ts    # /api/payments/*
│   │
│   ├── controllers/              # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── products.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── sellers.controller.ts
│   │   ├── admin.controller.ts
│   │   └── recommendations.controller.ts
│   │
│   ├── services/                 # Business logic
│   │   ├── auth.service.ts
│   │   ├── products.service.ts
│   │   ├── cart.service.ts
│   │   ├── orders.service.ts
│   │   ├── inventory.service.ts
│   │   ├── payment.service.ts
│   │   ├── notification.service.ts
│   │   ├── recommendation.service.ts
│   │   └── email.service.ts
│   │
│   ├── repositories/             # Database access
│   │   ├── user.repository.ts
│   │   ├── product.repository.ts
│   │   ├── cart.repository.ts
│   │   ├── order.repository.ts
│   │   ├── inventory.repository.ts
│   │   └── review.repository.ts
│   │
│   ├── middleware/               # Express middleware
│   │   ├── auth.middleware.ts    # JWT verification
│   │   ├── rbac.middleware.ts    # Role-based access control
│   │   ├── validation.middleware.ts # Zod validation
│   │   ├── error.middleware.ts   # Global error handler
│   │   ├── rateLimit.middleware.ts # Rate limiting
│   │   └── logger.middleware.ts  # Request logging
│   │
│   ├── validators/               # Zod schemas
│   │   ├── auth.validator.ts
│   │   ├── product.validator.ts
│   │   ├── cart.validator.ts
│   │   ├── order.validator.ts
│   │   └── common.validator.ts
│   │
│   ├── types/                    # TypeScript types
│   │   ├── express.d.ts          # Express type extensions
│   │   ├── entities.ts           # Domain entities
│   │   ├── api.ts                # API request/response types
│   │   └── index.ts
│   │
│   ├── utils/                    # Utilities
│   │   ├── jwt.utils.ts          # JWT helpers
│   │   ├── password.utils.ts     # Bcrypt helpers
│   │   ├── email.utils.ts        # Email sending
│   │   ├── logger.utils.ts       # Logging helpers
│   │   ├── errors.utils.ts       # Custom error classes
│   │   └── helpers.ts            # General helpers
│   │
│   ├── providers/                # External service providers
│   │   ├── payment/
│   │   │   ├── PaymentProvider.interface.ts
│   │   │   ├── MockPaymentProvider.ts
│   │   │   ├── ChapaPaymentProvider.ts
│   │   │   └── TelebirrPaymentProvider.ts
│   │   │
│   │   └── email/
│   │       ├── EmailProvider.interface.ts
│   │       ├── MockEmailProvider.ts
│   │       └── SMTPEmailProvider.ts
│   │
│   ├── app.ts                    # Express app setup
│   └── server.ts                 # Server entry point
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Database migrations
│   │   └── 20260918_initial/
│   │       └── migration.sql
│   └── seed.ts                   # Seed data script
│
├── tests/                        # Tests
│   ├── unit/                     # Unit tests
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── integration/              # Integration tests
│   │   ├── auth.test.ts
│   │   ├── products.test.ts
│   │   ├── cart.test.ts
│   │   └── orders.test.ts
│   │
│   └── e2e/                      # E2E tests
│       ├── customer-flow.test.ts
│       ├── seller-flow.test.ts
│       └── admin-flow.test.ts
│
├── .env.example                  # Environment template
├── .eslintrc.js
├── .prettierrc
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── jest.config.js
```

### 3.2 API Design Principles

#### RESTful Conventions

```
POST   /api/resource              # Create
GET    /api/resource              # List (with pagination)
GET    /api/resource/:id          # Read one
PUT    /api/resource/:id          # Update (full)
PATCH  /api/resource/:id          # Update (partial)
DELETE /api/resource/:id          # Delete

# Sub-resources
GET    /api/products/:id/reviews  # List product reviews
POST   /api/products/:id/reviews  # Create review for product

# Actions (non-CRUD)
POST   /api/orders/:id/cancel     # Cancel order
POST   /api/payments/webhook      # Payment webhook
```

#### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Product Name",
    // ...
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "The requested product does not exist.",
    "details": {
      "productId": "123"
    }
  }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (not authorized) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 422 | Unprocessable Entity (business logic error) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

### 3.3 Authentication Flow

```
┌────────────┐
│   Client   │
└─────┬──────┘
      │ 1. POST /api/auth/login
      │    { email, password }
      ▼
┌─────────────────────────────────┐
│  Auth Controller                │
│  - Validate input (Zod)         │
└─────┬───────────────────────────┘
      │ 2. Call service
      ▼
┌─────────────────────────────────┐
│  Auth Service                   │
│  - Find user by email           │
│  - Verify password (bcrypt)     │
│  - Check email verified         │
│  - Generate JWT tokens          │
└─────┬───────────────────────────┘
      │ 3. Return tokens
      ▼
┌─────────────────────────────────┐
│  Auth Controller                │
│  - Format response              │
│  - Set httpOnly cookie (opt)    │
└─────┬───────────────────────────┘
      │ 4. Response
      ▼
┌────────────┐
│   Client   │
│  - Store token in localStorage  │
│  - Or use httpOnly cookie       │
└────────────┘
```

**JWT Token Structure:**

```typescript
interface JWTPayload {
  userId: string
  email: string
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN'
  iat: number  // Issued at
  exp: number  // Expiration
}
```

**Token Types:**
- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), used to obtain new access tokens

### 3.4 Authorization Middleware

```typescript
// middleware/auth.middleware.ts
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req)
    
    if (!token) {
      throw new UnauthorizedError('No token provided')
    }
    
    const payload = verifyToken(token)
    const user = await userRepository.findById(payload.userId)
    
    if (!user) {
      throw new UnauthorizedError('Invalid token')
    }
    
    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

// middleware/rbac.middleware.ts
export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required')
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions')
    }
    
    next()
  }
}

// Usage in routes
router.post('/products',
  authenticate,
  authorize(['SELLER']),
  validateRequest(createProductSchema),
  productsController.create
)
```

### 3.5 Database Transaction Patterns

#### Order Creation (Critical Path)

```typescript
// services/orders.service.ts
async createOrder(customerId: string, orderData: CreateOrderDTO) {
  return await prisma.$transaction(async (tx) => {
    // 1. Validate cart items
    const cart = await tx.cart.findUnique({
      where: { userId: customerId },
      include: { items: { include: { product: true } } }
    })
    
    if (!cart || cart.items.length === 0) {
      throw new BusinessError('Cart is empty')
    }
    
    // 2. Validate inventory
    for (const item of cart.items) {
      const inventory = await tx.inventory.findUnique({
        where: { productId: item.productId }
      })
      
      const availableStock = inventory.currentStock - inventory.reservedStock
      
      if (availableStock < item.quantity) {
        throw new BusinessError(`Insufficient stock for ${item.product.name}`)
      }
    }
    
    // 3. Calculate totals (never trust client)
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    const deliveryFee = calculateDeliveryFee(orderData.address)
    const total = subtotal + deliveryFee
    
    // 4. Create order
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId,
        status: 'PENDING',
        subtotal,
        deliveryFee,
        total,
        shippingAddress: orderData.address,
      }
    })
    
    // 5. Create order items
    await tx.orderItem.createMany({
      data: cart.items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price, // Lock price at order time
        sellerId: item.product.sellerId,
      }))
    })
    
    // 6. Reserve inventory
    for (const item of cart.items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          reservedStock: { increment: item.quantity }
        }
      })
    }
    
    // 7. Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id }
    })
    
    // 8. Create payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        status: 'PENDING',
        provider: orderData.paymentProvider,
      }
    })
    
    return order
  })
}
```

#### Payment Confirmation Webhook

```typescript
// services/payment.service.ts
async confirmPayment(transactionId: string, provider: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Find payment (idempotency check)
    const payment = await tx.payment.findFirst({
      where: { 
        transactionId,
        provider 
      },
      include: { order: { include: { items: true } } }
    })
    
    if (!payment) {
      throw new BusinessError('Payment not found')
    }
    
    if (payment.status === 'PAID') {
      // Already processed, return success (idempotent)
      return payment
    }
    
    // 2. Update payment status
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        paidAt: new Date()
      }
    })
    
    // 3. Update order status
    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date()
      }
    })
    
    // 4. Deduct inventory (reserved → sold)
    for (const item of payment.order.items) {
      await tx.inventory.update({
        where: { productId: item.productId },
        data: {
          currentStock: { decrement: item.quantity },
          reservedStock: { decrement: item.quantity }
        }
      })
      
      // Create inventory history
      await tx.inventoryHistory.create({
        data: {
          productId: item.productId,
          type: 'SALE',
          quantity: -item.quantity,
          orderId: payment.orderId,
          notes: `Order ${payment.order.orderNumber}`
        }
      })
    }
    
    // 5. Create audit log
    await tx.auditLog.create({
      data: {
        action: 'PAYMENT_CONFIRMED',
        entityType: 'ORDER',
        entityId: payment.orderId,
        details: {
          transactionId,
          amount: payment.amount,
          provider
        }
      }
    })
    
    // 6. Send notifications (async, outside transaction)
    // Queue notification instead of sending synchronously
    
    return payment
  })
}
```

---

## 4. Database Architecture

### 4.1 Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────────┐         ┌─────────────┐
│    User     │◄───────┤  SellerProfile   ├────────►│    Store    │
└──────┬──────┘         └────────┬─────────┘         └──────┬──────┘
       │                         │                           │
       │                         │                           │
       │                    ┌────▼─────┐                     │
       │                    │ Product  │◄────────────────────┘
       │                    └────┬─────┘
       │                         │
       │                    ┌────▼──────────┐
       │                    │ProductVariant │
       │                    └───────────────┘
       │                         │
       │                    ┌────▼──────────┐
       │                    │  Inventory    │
       │                    └───────────────┘
       │
       ├────────┐
       │        │
   ┌───▼───┐  ┌▼────────┐
   │ Cart  │  │Wishlist │
   └───┬───┘  └┬────────┘
       │       │
   ┌───▼───────▼──────┐
   │  CartItem        │
   │  WishlistItem    │
   └──────────────────┘
       │
       │
   ┌───▼──────┐         ┌───────────┐
   │  Order   ├────────►│ Payment   │
   └───┬──────┘         └───────────┘
       │
   ┌───▼──────────┐
   │ OrderItem    │
   └──────────────┘
       │
   ┌───▼──────────┐
   │   Review     │
   └──────────────┘
```

### 4.2 Core Schema (Prisma)

```prisma
// User model
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  password        String
  firstName       String
  lastName        String
  phone           String?
  role            Role      @default(CUSTOMER)
  emailVerified   Boolean   @default(false)
  active          Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  sellerProfile   SellerProfile?
  cart            Cart?
  wishlist        Wishlist?
  orders          Order[]
  reviews         Review[]
  addresses       Address[]
  notifications   Notification[]
  
  @@index([email])
  @@index([role])
}

enum Role {
  CUSTOMER
  SELLER
  ADMIN
}

// Seller Profile
model SellerProfile {
  id              String    @id @default(uuid())
  userId          String    @unique
  businessName    String
  description     String?   @db.Text
  phone           String
  location        String
  verified        Boolean   @default(false)
  rating          Decimal   @default(0) @db.Decimal(3, 2)
  reviewCount     Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  products        Product[]
  
  @@index([userId])
  @@index([verified])
}

// Category
model Category {
  id              String    @id @default(uuid())
  name            String    @unique
  slug            String    @unique
  description     String?
  icon            String?
  active          Boolean   @default(true)
  order           Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  products        Product[]
  
  @@index([slug])
  @@index([active])
}

// Product
model Product {
  id                  String    @id @default(uuid())
  sellerId            String
  categoryId          String
  name                String
  slug                String    @unique
  description         String    @db.Text
  price               Decimal   @db.Decimal(10, 2)
  unit                String    // kg, quintal, liter, piece
  productionLocation  String?
  harvestDate         DateTime?
  qualityGrade        String?
  rating              Decimal   @default(0) @db.Decimal(3, 2)
  reviewCount         Int       @default(0)
  viewCount           Int       @default(0)
  orderCount          Int       @default(0)
  active              Boolean   @default(true)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  // Relations
  seller              SellerProfile @relation(fields: [sellerId], references: [id], onDelete: Cascade)
  category            Category      @relation(fields: [categoryId], references: [id])
  images              ProductImage[]
  variants            ProductVariant[]
  inventory           Inventory?
  cartItems           CartItem[]
  wishlistItems       WishlistItem[]
  orderItems          OrderItem[]
  reviews             Review[]
  
  @@index([sellerId])
  @@index([categoryId])
  @@index([slug])
  @@index([active])
  @@index([name])
  @@index([price])
  @@index([rating])
}

// Product Image
model ProductImage {
  id              String    @id @default(uuid())
  productId       String
  url             String
  alt             String?
  order           Int       @default(0)
  createdAt       DateTime  @default(now())
  
  // Relations
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@index([productId])
}

// Product Variant
model ProductVariant {
  id              String    @id @default(uuid())
  productId       String
  name            String    // "5kg", "10kg", etc.
  price           Decimal   @db.Decimal(10, 2)
  sku             String?   @unique
  active          Boolean   @default(true)
  
  // Relations
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@index([productId])
}

// Inventory
model Inventory {
  id                  String    @id @default(uuid())
  productId           String    @unique
  currentStock        Int       @default(0)
  reservedStock       Int       @default(0)
  lowStockThreshold   Int       @default(10)
  updatedAt           DateTime  @updatedAt
  
  // Relations
  product             Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  history             InventoryHistory[]
  
  @@index([productId])
}

// Inventory History
model InventoryHistory {
  id              String    @id @default(uuid())
  inventoryId     String
  type            String    // ADDITION, SALE, ADJUSTMENT, RETURN
  quantity        Int
  orderId         String?
  notes           String?
  createdAt       DateTime  @default(now())
  
  // Relations
  inventory       Inventory @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
  
  @@index([inventoryId])
  @@index([createdAt])
}

// Cart
model Cart {
  id              String    @id @default(uuid())
  userId          String    @unique
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  items           CartItem[]
  
  @@index([userId])
}

// Cart Item
model CartItem {
  id              String    @id @default(uuid())
  cartId          String
  productId       String
  variantId       String?
  quantity        Int
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  cart            Cart      @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@unique([cartId, productId, variantId])
  @@index([cartId])
  @@index([productId])
}

// Order
model Order {
  id                  String    @id @default(uuid())
  orderNumber         String    @unique
  customerId          String
  status              OrderStatus @default(PENDING)
  subtotal            Decimal   @db.Decimal(10, 2)
  deliveryFee         Decimal   @db.Decimal(10, 2)
  discount            Decimal   @default(0) @db.Decimal(10, 2)
  total               Decimal   @db.Decimal(10, 2)
  shippingAddress     Json
  notes               String?   @db.Text
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  confirmedAt         DateTime?
  shippedAt           DateTime?
  deliveredAt         DateTime?
  cancelledAt         DateTime?
  
  // Relations
  customer            User      @relation(fields: [customerId], references: [id])
  items               OrderItem[]
  payment             Payment?
  
  @@index([customerId])
  @@index([orderNumber])
  @@index([status])
  @@index([createdAt])
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

// Order Item
model OrderItem {
  id              String    @id @default(uuid())
  orderId         String
  productId       String
  sellerId        String
  quantity        Int
  price           Decimal   @db.Decimal(10, 2) // Price at order time
  variantInfo     Json?
  
  // Relations
  order           Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product         Product   @relation(fields: [productId], references: [id])
  
  @@index([orderId])
  @@index([productId])
  @@index([sellerId])
}

// Payment
model Payment {
  id              String    @id @default(uuid())
  orderId         String    @unique
  amount          Decimal   @db.Decimal(10, 2)
  status          PaymentStatus @default(PENDING)
  provider        String    // CHAPA, TELEBIRR, CBE_BIRR
  transactionId   String?   @unique
  metadata        Json?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  paidAt          DateTime?
  
  // Relations
  order           Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  @@index([orderId])
  @@index([status])
  @@index([transactionId])
}

enum PaymentStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
  REFUNDED
}

// Review
model Review {
  id              String    @id @default(uuid())
  userId          String
  productId       String
  orderId         String
  rating          Int       // 1-5
  title           String?
  comment         String?   @db.Text
  verifiedPurchase Boolean  @default(true)
  helpful         Int       @default(0)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  product         Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  
  @@unique([userId, productId])
  @@index([productId])
  @@index([rating])
  @@index([createdAt])
}

// Address
model Address {
  id              String    @id @default(uuid())
  userId          String
  fullName        String
  phone           String
  region          String
  zone            String
  woreda          String
  kebele          String
  specificLocation String
  addressType     String    @default("HOME") // HOME, OFFICE
  isDefault       Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

// Notification
model Notification {
  id              String    @id @default(uuid())
  userId          String
  type            String    // ORDER_CREATED, ORDER_SHIPPED, etc.
  title           String
  message         String    @db.Text
  read            Boolean   @default(false)
  createdAt       DateTime  @default(now())
  
  // Relations
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([read])
  @@index([createdAt])
}

// Audit Log
model AuditLog {
  id              String    @id @default(uuid())
  userId          String?
  action          String
  entityType      String
  entityId        String
  details         Json?
  ipAddress       String?
  userAgent       String?
  createdAt       DateTime  @default(now())
  
  @@index([userId])
  @@index([entityType])
  @@index([createdAt])
}
```

### 4.3 Indexing Strategy

**Primary Indexes** (automatic):
- All `@id` fields
- All `@unique` fields

**Foreign Key Indexes** (explicit):
```sql
-- Improve JOIN performance
CREATE INDEX idx_product_seller ON Product(sellerId);
CREATE INDEX idx_product_category ON Product(categoryId);
CREATE INDEX idx_order_customer ON Order(customerId);
CREATE INDEX idx_orderitem_order ON OrderItem(orderId);
CREATE INDEX idx_orderitem_product ON OrderItem(productId);
CREATE INDEX idx_review_product ON Review(productId);
CREATE INDEX idx_review_user ON Review(userId);
```

**Search Indexes**:
```sql
-- Full-text search on product name
CREATE INDEX idx_product_name ON Product(name);
CREATE INDEX idx_product_slug ON Product(slug);
```

**Filter Indexes**:
```sql
-- Common filter fields
CREATE INDEX idx_product_price ON Product(price);
CREATE INDEX idx_product_rating ON Product(rating);
CREATE INDEX idx_product_active ON Product(active);
CREATE INDEX idx_order_status ON Order(status);
CREATE INDEX idx_payment_status ON Payment(status);
```

**Composite Indexes**:
```sql
-- Optimize common query patterns
CREATE INDEX idx_product_category_active 
  ON Product(categoryId, active);

CREATE INDEX idx_product_seller_active 
  ON Product(sellerId, active);

CREATE INDEX idx_order_customer_status 
  ON Order(customerId, status);
```

**Time-Series Indexes**:
```sql
-- Analytics queries
CREATE INDEX idx_order_created ON Order(createdAt);
CREATE INDEX idx_review_created ON Review(createdAt);
CREATE INDEX idx_inventory_history_created 
  ON InventoryHistory(createdAt);
```

### 4.4 Data Integrity Constraints

**Check Constraints**:
```sql
-- Prices must be positive
ALTER TABLE Product ADD CONSTRAINT check_product_price_positive
  CHECK (price > 0);

-- Quantities must be non-negative
ALTER TABLE Inventory ADD CONSTRAINT check_inventory_non_negative
  CHECK (currentStock >= 0 AND reservedStock >= 0);

-- Reserved stock cannot exceed current stock
ALTER TABLE Inventory ADD CONSTRAINT check_reserved_stock_valid
  CHECK (reservedStock <= currentStock);

-- Ratings must be 1-5
ALTER TABLE Review ADD CONSTRAINT check_rating_range
  CHECK (rating >= 1 AND rating <= 5);
```

**Cascade Rules**:
- User deleted → Cascade delete Cart, Wishlist, Addresses
- User deleted → SET NULL on Orders (preserve order history)
- Product deleted → Cascade delete ProductImages, Inventory
- Product deleted → Prevent if has OrderItems (data integrity)
- Order deleted → Cascade delete OrderItems, Payment

---

## 5. Security Architecture

### 5.1 Authentication Security

**Password Hashing**:
```typescript
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

// Hash password
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

// Verify password
async function verifyPassword(
  password: string, 
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**JWT Configuration**:
```typescript
const JWT_CONFIG = {
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '15m' // 15 minutes
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d' // 7 days
  }
}
```

**Email Verification**:
```typescript
// Generate verification token
const token = crypto.randomBytes(32).toString('hex')
const hashedToken = crypto
  .createHash('sha256')
  .update(token)
  .digest('hex')

// Store hashed token with expiration
await userRepository.setVerificationToken(userId, {
  token: hashedToken,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
})

// Send unhashed token via email
await emailService.sendVerificationEmail(email, token)
```

### 5.2 Authorization Security

**Role-Based Access Control (RBAC)**:

```typescript
// Permission matrix
const PERMISSIONS = {
  CUSTOMER: [
    'products:read',
    'cart:manage',
    'orders:read_own',
    'orders:create',
    'reviews:create',
  ],
  SELLER: [
    'products:read',
    'products:create_own',
    'products:update_own',
    'products:delete_own',
    'orders:read_own',
    'orders:update_own',
    'inventory:manage_own',
    'analytics:read_own',
  ],
  ADMIN: [
    '*:*', // All permissions
  ]
}

// Check permission
function hasPermission(
  role: Role, 
  permission: string
): boolean {
  const rolePermissions = PERMISSIONS[role]
  
  if (rolePermissions.includes('*:*')) {
    return true
  }
  
  return rolePermissions.includes(permission)
}
```

**Resource Ownership Check**:

```typescript
// services/products.service.ts
async updateProduct(
  productId: string, 
  userId: string, 
  updates: UpdateProductDTO
) {
  // Find product
  const product = await productRepository.findById(productId)
  
  if (!product) {
    throw new NotFoundError('Product not found')
  }
  
  // Check ownership (seller can only update own products)
  if (product.sellerId !== userId) {
    throw new ForbiddenError('You do not own this product')
  }
  
  // Proceed with update
  return productRepository.update(productId, updates)
}
```

### 5.3 Input Validation

**Multi-Layer Validation**:

1. **Client-side** (UX, not security):
```typescript
// React Hook Form + Zod
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password too short'),
})

const form = useForm({
  resolver: zodResolver(loginSchema),
})
```

2. **Server-side** (Security):
```typescript
// validators/product.validator.ts
export const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(50).max(5000),
  price: z.number().positive(),
  unit: z.enum(['kg', 'quintal', 'liter', 'piece', 'dozen']),
  categoryId: z.string().uuid(),
  productionLocation: z.string().optional(),
  harvestDate: z.string().datetime().optional(),
  qualityGrade: z.enum(['A', 'B', 'C']).optional(),
})

// middleware/validation.middleware.ts
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            details: error.errors
          }
        })
      }
      next(error)
    }
  }
}
```

3. **Database** (Data integrity):
```prisma
model Product {
  price  Decimal @db.Decimal(10, 2) // Must be decimal
  active Boolean @default(true)     // Must be boolean
  
  @@check([price > 0])  // Check constraint
}
```

### 5.4 Rate Limiting

```typescript
import rateLimit from 'express-rate-limit'

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict limit for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
})

// Search rate limit
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 searches per minute
})

// Usage
app.use('/api/', apiLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/products/search', searchLimiter)
```

### 5.5 File Upload Security

```typescript
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products')
  },
  filename: (req, file, cb) => {
    // Random filename to prevent path traversal
    const randomName = crypto.randomBytes(16).toString('hex')
    const ext = path.extname(file.originalname)
    cb(null, `${randomName}${ext}`)
  }
})

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
  // Allowed types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only JPEG, PNG, and WebP allowed.'))
  }
  
  cb(null, true)
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 5 // Max 5 files per request
  }
})
```

### 5.6 Security Headers

```typescript
import helmet from 'helmet'

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}))
```

---

## 6. Recommendation System

### 6.1 System Architecture

```
┌────────────────────────────────────────────────────┐
│          Recommendation Engine                     │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  Content-Based   │  │  Collaborative       │  │
│  │  Filtering       │  │  Filtering           │  │
│  │  (40% weight)    │  │  (30% weight)        │  │
│  └──────────────────┘  └──────────────────────┘  │
│                                                    │
│  ┌──────────────────┐  ┌──────────────────────┐  │
│  │  Popularity      │  │  Recency             │  │
│  │  Based           │  │  Based               │  │
│  │  (20% weight)    │  │  (10% weight)        │  │
│  └──────────────────┘  └──────────────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │         Score Aggregation                    │ │
│  │  FinalScore = 0.4×Content + 0.3×Collab +     │ │
│  │               0.2×Popular + 0.1×Recency      │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
                         │
                         ▼
                 ┌───────────────┐
                 │  Ranked List  │
                 │  of Products  │
                 └───────────────┘
```

### 6.2 Recommendation Algorithms

#### 1. Content-Based Filtering

```typescript
// services/recommendation.service.ts
async getContentBasedRecommendations(
  userId: string,
  limit: number = 10
): Promise<Product[]> {
  // Get user's purchase history
  const userOrders = await orderRepository.getUserOrders(userId)
  const purchasedProducts = userOrders.flatMap(o => o.items.map(i => i.product))
  
  if (purchasedProducts.length === 0) {
    return this.getColdStartRecommendations(limit)
  }
  
  // Extract preferences
  const categoryPreferences = this.calculateCategoryPreferences(purchasedProducts)
  const avgPriceRange = this.calculateAveragePriceRange(purchasedProducts)
  
  // Find similar products
  const recommendations = await productRepository.findSimilar({
    categories: categoryPreferences.map(p => p.categoryId),
    priceMin: avgPriceRange.min * 0.7,
    priceMax: avgPriceRange.max * 1.3,
    excludeProductIds: purchasedProducts.map(p => p.id),
    limit: limit * 2 // Get more for scoring
  })
  
  // Score and rank
  const scored = recommendations.map(product => ({
    product,
    score: this.calculateContentScore(product, {
      categoryPreferences,
      avgPriceRange
    })
  }))
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product)
}

private calculateContentScore(
  product: Product,
  preferences: { categoryPreferences: any[], avgPriceRange: any }
): number {
  let score = 0
  
  // Category match (max 50 points)
  const categoryPref = preferences.categoryPreferences
    .find(p => p.categoryId === product.categoryId)
  if (categoryPref) {
    score += 50 * categoryPref.weight
  }
  
  // Price similarity (max 25 points)
  const avgPrice = (preferences.avgPriceRange.min + preferences.avgPriceRange.max) / 2
  const priceDiff = Math.abs(Number(product.price) - avgPrice)
  const priceScore = Math.max(0, 25 - (priceDiff / avgPrice) * 25)
  score += priceScore
  
  // Rating (max 15 points)
  score += Number(product.rating) * 3
  
  // Review count (max 10 points)
  score += Math.min(10, product.reviewCount / 10)
  
  return score
}
```

#### 2. Collaborative Filtering

```typescript
async getCollaborativeRecommendations(
  userId: string,
  limit: number = 10
): Promise<Product[]> {
  // Find similar users (users who bought similar products)
  const similarUsers = await this.findSimilarUsers(userId, 20)
  
  if (similarUsers.length === 0) {
    return []
  }
  
  // Get products purchased by similar users
  const recommendations = await productRepository.findByUserPurchases({
    userIds: similarUsers.map(u => u.userId),
    excludeUserId: userId,
    limit: limit * 2
  })
  
  // Score based on frequency and user similarity
  const scored = this.scoreCollaborativeProducts(
    recommendations,
    similarUsers
  )
  
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product)
}

private async findSimilarUsers(
  userId: string,
  limit: number
): Promise<Array<{ userId: string, similarity: number }>> {
  // Get user's purchase categories
  const userCategories = await this.getUserPurchaseCategories(userId)
  
  // Find users with overlapping categories
  const similarUsers = await prisma.$queryRaw`
    SELECT 
      o.customer_id as userId,
      COUNT(DISTINCT p.category_id) as overlap,
      (COUNT(DISTINCT p.category_id)::float / ${userCategories.length}) as similarity
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE p.category_id IN (${userCategories})
      AND o.customer_id != ${userId}
      AND o.status = 'DELIVERED'
    GROUP BY o.customer_id
    HAVING COUNT(DISTINCT p.category_id) >= 2
    ORDER BY similarity DESC
    LIMIT ${limit}
  `
  
  return similarUsers as any[]
}
```

#### 3. Popularity-Based

```typescript
async getPopularProducts(
  limit: number = 10,
  timeWindow: number = 30 // days
): Promise<Product[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - timeWindow)
  
  return productRepository.findPopular({
    startDate,
    minRating: 3.5,
    orderBy: [
      { orderCount: 'desc' },
      { rating: 'desc' },
      { reviewCount: 'desc' }
    ],
    limit
  })
}
```

#### 4. Trending Products

```typescript
async getTrendingProducts(limit: number = 10): Promise<Product[]> {
  // Products with recent spike in orders/views
  const trendingScore = await prisma.$queryRaw`
    SELECT 
      p.id,
      p.*,
      (
        COUNT(DISTINCT o.id) * 0.5 +
        p.view_count * 0.3 +
        p.rating * p.review_count * 0.2
      ) as trending_score
    FROM products p
    LEFT JOIN order_items oi ON p.id = oi.product_id
    LEFT JOIN orders o ON oi.order_id = o.id 
      AND o.created_at > NOW() - INTERVAL '7 days'
    WHERE p.active = true
      AND p.rating >= 4.0
    GROUP BY p.id
    ORDER BY trending_score DESC
    LIMIT ${limit}
  `
  
  return trendingScore as Product[]
}
```

### 6.3 Cold Start Strategy

```typescript
async getColdStartRecommendations(limit: number = 10): Promise<Product[]> {
  // For new users without purchase history
  const [featured, popular, highRated] = await Promise.all([
    productRepository.findFeatured(Math.ceil(limit / 3)),
    this.getPopularProducts(Math.ceil(limit / 3)),
    productRepository.findHighestRated({
      minReviews: 50,
      minRating: 4.5,
      limit: Math.ceil(limit / 3)
    })
  ])
  
  // Mix and shuffle
  const mixed = [...featured, ...popular, ...highRated]
  return this.shuffle(mixed).slice(0, limit)
}
```

### 6.4 Caching Strategy

```typescript
// Cache recommendations for 15 minutes
const CACHE_TTL = 15 * 60 // 15 minutes

async getRecommendations(userId: string): Promise<Product[]> {
  const cacheKey = `recommendations:${userId}`
  
  // Try cache first
  const cached = await redisClient.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }
  
  // Generate recommendations
  const recommendations = await this.generateRecommendations(userId)
  
  // Cache result
  await redisClient.setex(
    cacheKey,
    CACHE_TTL,
    JSON.stringify(recommendations)
  )
  
  return recommendations
}
```

---

## 7. Performance Optimization

### 7.1 Database Optimization

**Query Optimization:**

```typescript
// ❌ Bad: N+1 query problem
const products = await prisma.product.findMany()
for (const product of products) {
  const seller = await prisma.sellerProfile.findUnique({
    where: { id: product.sellerId }
  })
}

// ✅ Good: Use include
const products = await prisma.product.findMany({
  include: {
    seller: true,
    category: true,
    images: { take: 1 }
  }
})

// ✅ Better: Select only needed fields
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    slug: true,
    seller: {
      select: {
        businessName: true,
        rating: true
      }
    },
    images: {
      select: { url: true },
      take: 1
    }
  }
})
```

**Connection Pooling:**

```typescript
// prisma/client.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings
  // Default: connection_limit=10 (PostgreSQL)
})

export default prisma
```

### 7.2 API Optimization

**Response Compression:**

```typescript
import compression from 'compression'

app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  },
  level: 6 // Compression level (0-9)
}))
```

**Pagination:**

```typescript
// Standard pagination
interface PaginationParams {
  page: number    // default: 1
  limit: number   // default: 20, max: 100
}

async function paginateProducts(params: PaginationParams) {
  const skip = (params.page - 1) * params.limit
  
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      skip,
      take: params.limit,
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.product.count({ where: { active: true } })
  ])
  
  return {
    data: products,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      pages: Math.ceil(total / params.limit),
      hasNext: params.page < Math.ceil(total / params.limit),
      hasPrev: params.page > 1
    }
  }
}
```

### 7.3 Frontend Optimization

**Code Splitting:**

```typescript
// React Router lazy loading
import { lazy, Suspense } from 'react'

const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const SellerDashboard = lazy(() => import('./pages/seller/DashboardPage'))

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
      </Routes>
    </Suspense>
  )
}
```

**Image Optimization:**

```typescript
// Use responsive images
<img
  src="/uploads/products/image-small.jpg"
  srcSet="
    /uploads/products/image-small.jpg 400w,
    /uploads/products/image-medium.jpg 800w,
    /uploads/products/image-large.jpg 1200w
  "
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="Product name"
  loading="lazy"
/>
```

**Debounced Search:**

```typescript
import { useDebouncedCallback } from 'use-debounce'

function SearchInput() {
  const [query, setQuery] = useState('')
  
  const debouncedSearch = useDebouncedCallback(
    (value: string) => {
      // Trigger search API call
      searchProducts(value)
    },
    300 // 300ms delay
  )
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }
  
  return <input value={query} onChange={handleChange} />
}
```

---

## 8. Deployment Architecture

### 8.1 Development Environment

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: agrimarket
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: agrimarket_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Backend API
  api:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://agrimarket:dev_password@postgres:5432/agrimarket_dev
      NODE_ENV: development
      JWT_ACCESS_SECRET: dev_secret
      JWT_REFRESH_SECRET: dev_refresh_secret
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
    command: npm run dev

  # Frontend
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:3001/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

  # Database Admin (Adminer)
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 8.2 Production Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Cloudflare CDN                        │
│              (Static Assets, DDoS Protection)            │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│                   Load Balancer                          │
│              (HTTPS Termination, SSL/TLS)                │
└────────────┬──────────────────────┬──────────────────────┘
             │                      │
    ┌────────▼────────┐    ┌────────▼────────┐
    │   API Server 1  │    │   API Server 2  │
    │  (Node.js +     │    │  (Node.js +     │
    │   TypeScript)   │    │   TypeScript)   │
    └────────┬────────┘    └────────┬────────┘
             │                      │
             └──────────┬───────────┘
                        │
            ┌───────────▼───────────┐
            │  PostgreSQL Database  │
            │  (Managed Service)    │
            │  - Primary            │
            │  - Read Replica       │
            └───────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  Supporting Services                     │
├──────────────────────────────────────────────────────────┤
│  Redis Cache  │  S3 Storage  │  Email Service (SMTP)    │
└──────────────────────────────────────────────────────────┘
```

### 8.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test
      
      - name: Run linter
        run: |
          cd backend && npm run lint
          cd ../frontend && npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t agrimarket/api:${{ github.sha }} ./backend
          docker build -t agrimarket/frontend:${{ github.sha }} ./frontend
      
      - name: Push to registry
        run: |
          docker push agrimarket/api:${{ github.sha }}
          docker push agrimarket/frontend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deploy using your preferred method
          # (e.g., AWS ECS, Kubernetes, Docker Swarm)
```

---

## 9. Monitoring & Logging

### 9.1 Structured Logging

```typescript
// config/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'agrimarket-api' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

export default logger
```

**Usage:**

```typescript
// Log levels: error, warn, info, http, debug
logger.info('User logged in', {
  userId: user.id,
  email: user.email,
  ipAddress: req.ip
})

logger.error('Payment failed', {
  orderId: order.id,
  error: error.message,
  stack: error.stack
})
```

### 9.2 Audit Logging

```typescript
// Critical events to audit
const AUDITABLE_ACTIONS = [
  'USER_REGISTERED',
  'USER_LOGIN',
  'USER_SUSPENDED',
  'ORDER_CREATED',
  'ORDER_CANCELLED',
  'PAYMENT_CONFIRMED',
  'PAYMENT_REFUNDED',
  'PRODUCT_CREATED',
  'PRODUCT_DELETED',
  'INVENTORY_ADJUSTED',
  'SELLER_VERIFIED',
  'ADMIN_ACTION',
]

async function createAuditLog(data: {
  action: string
  userId?: string
  entityType: string
  entityId: string
  details?: any
  ipAddress?: string
  userAgent?: string
}) {
  await prisma.auditLog.create({
    data: {
      ...data,
      createdAt: new Date()
    }
  })
}
```

### 9.3 Metrics to Track

**Application Metrics:**
- API response times (p50, p95, p99)
- Error rates by endpoint
- Request counts by endpoint
- Active user sessions
- Database query times

**Business Metrics:**
- Orders created per hour
- Revenue per hour
- Cart abandonment rate
- Conversion rate (cart → order)
- Average order value

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Database connections
- Disk usage
- Network throughput

---

## 10. Technology Decisions

| Technology | Chosen | Rationale |
|------------|--------|-----------|
| **Database** | PostgreSQL | ACID compliance, complex queries, data integrity, mature |
| **ORM** | Prisma | Type-safe, excellent DX, auto-migrations, modern |
| **Backend Framework** | Express.js | Mature, flexible, large ecosystem, well-documented |
| **Frontend Library** | React | Component reusability, large community, stable |
| **Type System** | TypeScript | Type safety reduces bugs, better IDE support, maintainability |
| **State Management** | TanStack Query | Best-in-class server state, caching, optimistic updates |
| **Forms** | React Hook Form | Performance, less re-renders, good DX |
| **Validation** | Zod | Type-safe validation, works on client and server |
| **Styling** | Tailwind CSS | Rapid development, consistent design, small bundle |
| **UI Components** | shadcn/ui | High quality, accessible, customizable, no package lock-in |
| **Authentication** | JWT | Stateless, horizontal scaling, industry standard |
| **Password Hashing** | Bcrypt | Industry standard, slow by design (security) |
| **Build Tool** | Vite | Fast dev server, fast builds, modern |
| **Containerization** | Docker | Consistent environments, easy deployment |

---

## 11. Architectural Trade-offs

### 11.1 Monolith vs Microservices

**Chosen: Monolithic Backend**

**Pros:**
- Simpler development and debugging
- Easier database transactions
- Lower operational complexity
- Faster initial development
- Sufficient for initial scale

**Cons:**
- Harder to scale components independently
- Single point of failure
- Technology lock-in per service

**Rationale:** For a new marketplace with moderate traffic, a monolith is simpler and faster to develop. The architecture is designed to allow future microservices extraction if needed.

### 11.2 REST vs GraphQL

**Chosen: REST API**

**Pros:**
- Simpler to understand and implement
- Better caching (HTTP caching)
- Well-understood patterns
- Easier to secure

**Cons:**
- Multiple requests for related data
- Over-fetching or under-fetching
- Less flexible for clients

**Rationale:** REST is simpler for initial version. GraphQL adds complexity not justified by current requirements.

### 11.3 SSR vs SPA

**Chosen: SPA with Vite (not Next.js as originally planned)**

**Pros:**
- Simpler architecture
- Faster development
- Clear API boundary
- Easier deployment

**Cons:**
- Worse initial SEO
- Slower first contentful paint

**Rationale:** Since we're using React + Vite (not Next.js), we have an SPA. For an agricultural marketplace, SEO is important but can be addressed with proper meta tags and potential future SSR if needed.

### 11.4 SQL vs NoSQL

**Chosen: SQL (PostgreSQL)**

**Pros:**
- ACID transactions (critical for e-commerce)
- Complex queries with JOINs
- Data integrity constraints
- Mature tooling

**Cons:**
- Harder to scale horizontally
- Schema changes require migrations

**Rationale:** E-commerce requires strong data integrity. Financial transactions and inventory management need ACID compliance.

### 11.5 Session-based vs Token-based Auth

**Chosen: Token-based (JWT)**

**Pros:**
- Stateless (scales horizontally)
- Works across domains
- Mobile-friendly
- Lower database load

**Cons:**
- Cannot revoke tokens easily
- Token size (sent with every request)
- Requires token blacklist for logout

**Rationale:** Stateless authentication scales better. Token revocation can be handled with blacklist or short expiration.

---

## 12. Future Architecture Considerations

### When to Consider Microservices

**Triggers:**
- Team grows beyond 10 engineers
- Product service exceeds 100,000 products
- Order volume exceeds 10,000/day
- Different scaling needs per service
- Need to deploy services independently

**Potential Services:**
- Product Service
- Order Service
- Payment Service
- Notification Service
- Recommendation Service

### When to Add Caching Layer

**Triggers:**
- Database becomes bottleneck
- API response times > 500ms consistently
- Frequent reads of same data
- Analytics queries slow down app

**Caching Candidates:**
- Product lists (15 minutes)
- Categories (1 hour)
- Seller profiles (30 minutes)
- Trending products (15 minutes)
- User sessions (Redis)

### When to Add Search Engine

**Triggers:**
- PostgreSQL full-text search insufficient
- Need faceted search
- Need typo tolerance
- Need relevance scoring
- Need fuzzy matching

**Solution:** Elasticsearch or Algolia

### When to Add Message Queue

**Triggers:**
- Email sending delays API responses
- Need async processing
- Need event-driven architecture
- Need retry mechanisms

**Solution:** RabbitMQ, AWS SQS, or Redis Queue

---

**Document Version History**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-09-18 | Architecture Team | Initial draft |

---

**Approval Sign-off**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Technical Lead | | | |
| Product Owner | | | |
| Security Lead | | | |
