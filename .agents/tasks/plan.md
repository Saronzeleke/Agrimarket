# AgriMarket Frontend Implementation Plan

This plan covers the complete implementation of a production-ready Next.js 14 + TypeScript frontend for AgriMarket, an Ethiopian agricultural e-commerce marketplace.

## Project Context

**Backend API**: http://localhost:3001/api/v1 (already running)
**Frontend Target**: c:\Users\admin\Kuperfume\frontend (currently empty)
**Authentication**: JWT tokens via Authorization: Bearer header
**State Management**: Zustand
**Styling**: Tailwind CSS with custom design system

## Design System Specifications

### Colors
- **Primary**: #166534 (Forest Green - buttons, headers, active states)
- **Secondary**: #65A30D (Lime - secondary actions, success)
- **Accent**: #F59E0B (Amber - CTAs, badges, pricing)
- **Background**: #F8FAF5 (off-white page background)
- **Surface**: #FFFFFF (cards, modals)
- **Border**: #E5E7EB
- **Text Primary**: #1F2937
- **Text Secondary**: #6B7280

### Typography
- **Font**: Inter (Google Fonts)
- **H1**: 40px bold, line-height 1.2
- **H2**: 32px bold, line-height 1.3
- **H3**: 24px semibold, line-height 1.4
- **H4**: 20px semibold, line-height 1.5
- **Body**: 16px regular, line-height 1.6
- **Body Small**: 14px
- **Caption**: 12px

### Components
- **Buttons**: 48px height (mobile), 44px (desktop), 8px border-radius
- **Inputs**: 48px height, 8px border-radius
- **Cards**: 12px border-radius, shadow on hover
- **Spacing**: 8px grid (4, 8, 16, 24, 32, 48, 64px)

### Responsive Breakpoints
- **Mobile**: 375px
- **Tablet**: 768px
- **Desktop**: 1440px

---

## Implementation Phases

### FEAT-001: Project Bootstrap & Foundation
**Description**: Set up Next.js 14 project with TypeScript, Tailwind CSS, and all dependencies.

**Files to Create/Modify**:
- Bootstrap via `npx create-next-app@latest frontend`
- `frontend/package.json` (install zustand, axios, react-hook-form, zod, @heroicons/react, date-fns, @hookform/resolvers)
- `frontend/tailwind.config.ts` (design system colors, Inter font, spacing)
- `frontend/lib/constants.ts` (API_BASE_URL, ROUTES, COLORS)
- `frontend/types/index.ts` (User, Product, Category, Order, Cart interfaces)
- `frontend/lib/api/client.ts` (Axios instance with JWT interceptor)
- `frontend/app/layout.tsx` (Inter font, metadata)
- `frontend/app/globals.css` (Tailwind imports, CSS variables)

**Verification**:
- Run `npm run dev` in frontend/ → server starts on localhost:3000
- Run `npm run build` → successful production build
- Open http://localhost:3000 → default Next.js page with Inter font

---

### FEAT-002: UI Components & Layout System
**Description**: Build complete component library (14 UI components) and layout components (Header, Footer, Sidebar). Set up Zustand stores and API endpoint wrappers.

**Files to Create**:
- `frontend/components/ui/Button.tsx` (primary, secondary, text variants)
- `frontend/components/ui/Input.tsx` (with label, error, helper text)
- `frontend/components/ui/Select.tsx`, `Textarea.tsx`
- `frontend/components/ui/Badge.tsx` (color variants)
- `frontend/components/ui/Card.tsx` (with shadow)
- `frontend/components/ui/Modal.tsx` (backdrop, close button)
- `frontend/components/ui/Skeleton.tsx`, `Spinner.tsx`, `Toast.tsx`
- `frontend/components/ui/Avatar.tsx`, `Breadcrumb.tsx`, `Pagination.tsx`
- `frontend/components/ui/EmptyState.tsx`, `ErrorBoundary.tsx`
- `frontend/components/layout/Header.tsx` (logo, nav, search, cart icon, user menu)
- `frontend/components/layout/Footer.tsx` (4 columns, copyright)
- `frontend/components/layout/Sidebar.tsx` (marketplace filters)
- `frontend/lib/store/auth.store.ts` (user, token, login, logout, hydrate)
- `frontend/lib/store/cart.store.ts` (items, add, update, remove, sync)
- `frontend/lib/store/ui.store.ts` (toasts, modals, loading)
- `frontend/lib/api/endpoints.ts` (authApi, productApi, cartApi, orderApi, etc.)
- `frontend/middleware.ts` (route protection for /dashboard, /checkout)

**Verification**:
- Create test page importing all UI components → verify styling matches design system
- Test Zustand stores in browser console → verify login() saves to localStorage
- Test API client → authApi.getMe() sends request to backend with Authorization header
- Test middleware → navigate to /dashboard without token → redirect to /auth/login
- Run `npm run build` → successful

---

### FEAT-003: Core Marketplace Screens
**Description**: Implement landing page, marketplace grid, product detail, cart, and auth screens with full backend integration.

**Files to Create**:
- `frontend/app/page.tsx` (hero, category grid, featured products, how-it-works, stats, seller CTA)
- `frontend/components/ProductCard.tsx` (reusable product card)
- `frontend/app/marketplace/page.tsx` (product grid with filters, search, sort, pagination)
- Wire up `frontend/components/layout/Sidebar.tsx` (filters apply to marketplace)
- `frontend/app/products/[slug]/page.tsx` (image gallery, add-to-cart, seller info, reviews)
- `frontend/components/ReviewList.tsx` (fetch and render reviews)
- `frontend/app/cart/page.tsx` (cart items, quantity controls, order summary, checkout button)
- `frontend/app/auth/login/page.tsx` (email/password form, POST /auth/login)
- `frontend/app/auth/register/page.tsx` (multi-step form, POST /auth/register)

**API Integrations**:
- GET /categories (landing category grid)
- GET /products (marketplace grid, featured products)
- GET /products/slug/:slug (product detail)
- GET /products/:id/reviews (review list)
- GET /cart (cart page)
- POST /cart/items (add to cart)
- PATCH /cart/items/:id (update quantity)
- DELETE /cart/items/:id (remove item)
- POST /auth/login
- POST /auth/register

**Verification**:
- Landing page renders with categories and featured products from backend
- Marketplace filters update URL params and refetch products
- Product detail: add to cart updates Header cart badge
- Cart page: quantity controls and remove buttons work
- Login: saves token and redirects to /dashboard
- Register: multi-step form validates and submits
- Test responsive at 375px, 768px, 1440px
- Run `npm run build` → successful

---

### FEAT-004: Checkout & Dashboard Screens
**Description**: Implement multi-step checkout flow, buyer dashboard, and seller dashboard with product/order management.

**Files to Create**:
- `frontend/app/checkout/page.tsx` (4-step wizard: address, payment, review, submit)
- `frontend/components/AddressForm.tsx` (Ethiopian address structure)
- `frontend/app/checkout/success/page.tsx` (order confirmation)
- `frontend/app/dashboard/buyer/page.tsx` (stats, recent orders, wishlist preview)
- `frontend/app/dashboard/seller/page.tsx` (revenue chart, orders, inventory alerts)
- `frontend/app/dashboard/seller/products/page.tsx` (product list, add/edit/delete)
- `frontend/components/ProductFormModal.tsx` (create/edit product with images, variants)
- `frontend/app/dashboard/seller/orders/page.tsx` (orders table, status updates)

**API Integrations**:
- GET /addresses, POST /addresses
- GET /checkout/payment-methods
- GET /checkout/summary
- POST /checkout
- GET /orders (buyer)
- GET /wishlist
- GET /seller/analytics/dashboard
- GET /seller/orders
- GET /seller/inventory/low-stock
- GET /seller/products
- POST /products (create)
- PUT /products/:id (update)
- PATCH /seller/orders/:id/status

**Verification**:
- Checkout: complete 4-step flow, place order, verify POST /checkout, redirect to success page
- Buyer dashboard: verify stats and recent orders from backend
- Seller dashboard: revenue chart renders, orders table shows data
- Seller products: add product with images and variants → POST /products succeeds
- Seller orders: update status dropdown → PATCH /seller/orders/:id/status
- Protected routes: logout and navigate to /dashboard → redirect to /auth/login
- Run `npm run build` → successful

---

### FEAT-005: Remaining Screens & Polish
**Description**: Implement search, wishlist, order tracking, notifications, settings pages. Add loading states, error handling, toasts, image optimization, SEO, accessibility.

**Files to Create**:
- `frontend/app/search/page.tsx` (search results with filters)
- `frontend/app/wishlist/page.tsx` (wishlist grid with move-to-cart/remove)
- `frontend/app/orders/[id]/page.tsx` (order detail with status timeline)
- `frontend/app/notifications/page.tsx` (notifications list with tabs)
- `frontend/app/settings/page.tsx` (4 tabs: Profile, Addresses, Security, Preferences)
- `frontend/app/messages/page.tsx` (placeholder)
- `frontend/app/error.tsx` (global error page)
- `frontend/app/not-found.tsx` (custom 404)

**Enhancements**:
- Add Skeleton loading states to all async fetches
- Wrap components in ErrorBoundary
- Add success/error toasts to all actions
- Replace `<img>` with `next/image`
- Add SEO metadata to all pages
- Accessibility improvements (ARIA labels, focus states, keyboard nav)

**API Integrations**:
- GET /products?q= (search)
- GET /wishlist
- POST /wishlist/items/:id/move-to-cart
- DELETE /wishlist/items/:id
- GET /orders/:id
- POST /orders/:id/cancel
- GET /notifications
- PATCH /notifications/:id/read
- PATCH /notifications/read-all
- PUT /auth/me (profile update)
- POST /auth/change-password

**Verification**:
- Search page: query products, filters work
- Wishlist: move to cart and remove buttons work
- Order tracking: status timeline displays correctly
- Notifications: mark as read works, tabs filter correctly
- Settings: profile update, change password work
- Loading states: throttle network → Skeleton components show
- Error handling: stop backend → error boundary catches
- Toasts: add to cart → green success toast appears
- Images: verify next/image optimization in Network tab
- SEO: view page source → unique title/description per page
- Accessibility: Tab through forms, verify focus states, check contrast
- Run `npm run build` → successful

---

## Backend API Summary

The backend provides these key endpoints (all at http://localhost:3001/api/v1):

### Authentication
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- GET /auth/me
- POST /auth/logout
- POST /auth/change-password

### Products
- GET /products (list with filters: category, price, region, rating, search q)
- GET /products/slug/:slug
- GET /products/:id
- GET /products/:id/related
- POST /products (seller)
- PUT /products/:id (seller)
- DELETE /products/:id (seller)

### Categories
- GET /categories
- GET /categories/:slug

### Cart
- GET /cart
- GET /cart/count
- GET /cart/validate
- POST /cart/items
- PATCH /cart/items/:itemId
- DELETE /cart/items/:itemId
- DELETE /cart/items (clear)

### Checkout & Orders
- GET /checkout/summary
- GET /checkout/payment-methods
- POST /checkout
- GET /orders
- GET /orders/:orderId
- GET /orders/number/:orderNumber
- POST /orders/:orderId/cancel

### Wishlist
- GET /wishlist
- GET /wishlist/count
- POST /wishlist/items
- POST /wishlist/items/:itemId/move-to-cart
- DELETE /wishlist/items/:itemId

### Addresses
- GET /addresses
- GET /addresses/default
- POST /addresses
- PATCH /addresses/:addressId
- DELETE /addresses/:addressId
- POST /addresses/:addressId/set-default

### Notifications
- GET /notifications
- GET /notifications/unread/count
- PATCH /notifications/:notificationId/read
- PATCH /notifications/read-all
- DELETE /notifications/:notificationId

### Seller Routes
- GET /seller/products
- GET /seller/orders
- PATCH /seller/orders/:orderId/status
- GET /seller/inventory/low-stock
- GET /seller/analytics/dashboard
- GET /seller/reviews
- POST /seller/reviews/:reviewId/respond

### Reviews
- GET /products/:productId/reviews
- POST /reviews
- PATCH /reviews/:reviewId
- DELETE /reviews/:reviewId

---

## Key Data Models (from Prisma Schema)

### User
```typescript
{
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN'
  emailVerified: boolean
  active: boolean
  sellerProfile?: SellerProfile
}
```

### Product
```typescript
{
  id: string
  name: string
  slug: string
  description: string
  price: number
  unit: string
  categoryId: string
  sellerId: string
  productionLocation: string
  rating: number
  reviewCount: number
  active: boolean
  images: ProductImage[]
  category: Category
  seller: SellerProfile
  inventory: Inventory
}
```

### Order
```typescript
{
  id: string
  orderNumber: string
  customerId: string
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  shippingAddress: object
  items: OrderItem[]
  createdAt: Date
}
```

### CartItem
```typescript
{
  id: string
  cartId: string
  productId: string
  quantity: number
  product: Product
}
```

---

## Success Criteria

✅ All screens responsive at 375px, 768px, 1440px breakpoints
✅ Design system strictly followed (colors, typography, spacing, components)
✅ Full backend integration with JWT authentication
✅ Zustand state management for auth, cart, UI
✅ Loading states (Skeleton components) on all async operations
✅ Error handling with ErrorBoundary and user-friendly messages
✅ Success/error toast notifications
✅ Image optimization with next/image
✅ SEO metadata on all pages
✅ Accessibility: WCAG AA contrast, keyboard navigation, ARIA labels
✅ Production build succeeds (`npm run build`)

---

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "@heroicons/react": "^2.1.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0"
  }
}
```

---

## Notes

- Frontend directory is currently empty - will be bootstrapped in FEAT-001
- Backend runs on http://localhost:3001/api/v1 (already implemented and running)
- JWT tokens stored in localStorage, sent via Authorization: Bearer header
- All API responses follow format: `{ success: boolean, data?: T, error?: string }`
- Ethiopian regions for address forms: Addis Ababa, Oromia, Amhara, Tigray, SNNPR, Sidama, Somali, Afar, Benishangul-Gumuz, Gambela, Harari, Dire Dawa, Southwestern
- Phone format: +251 prefix required
- Product images: 4:3 aspect ratio, WebP format preferred
- Cart syncs with backend on every add/update/remove
- Categories cached 1 hour on backend (rarely change)
