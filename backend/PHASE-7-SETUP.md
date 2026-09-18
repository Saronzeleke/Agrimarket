# Phase 7 Setup Guide - Shopping Cart & Wishlist

## Quick Start

### Prerequisites
- PostgreSQL running (from Phase 2)
- Backend dependencies installed
- Database migrated and seeded
- At least one customer account

### No New Migration Required! 🎉

Phase 7 uses existing database tables from Phase 2:
- `carts` and `cart_items`
- `wishlists` and `wishlist_items`

These tables are already created and ready to use.

## Setup Steps

### 1. Verify Database Tables Exist
```powershell
# Start Prisma Studio
cd backend
npm run db:studio
```

Look for these tables:
- ✅ carts
- ✅ cart_items
- ✅ wishlists
- ✅ wishlist_items

### 2. Start Development Server
```powershell
# From backend directory
npm run dev
```

Server should start on `http://localhost:3001`

### 3. Test the Endpoints

#### Get Auth Token
```powershell
# Login as customer
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"customer1@example.com","password":"Customer123!"}'

$token = $response.data.accessToken
echo "Token: $token"
```

#### Get a Product ID
```powershell
$products = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/products?limit=5"
$productId = $products.data.products[0].id
echo "Product ID: $productId"
```

#### Test Cart Operations
```powershell
# Add to cart
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/cart/items" `
  -Method Post `
  -Headers @{"Authorization"="Bearer $token"} `
  -ContentType "application/json" `
  -Body "{`"productId`":`"$productId`",`"quantity`":2}"

# Get cart
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/cart" `
  -Headers @{"Authorization"="Bearer $token"}

# Get cart count
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/cart/count" `
  -Headers @{"Authorization"="Bearer $token"}
```

#### Test Wishlist Operations
```powershell
# Add to wishlist
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/wishlist/items" `
  -Method Post `
  -Headers @{"Authorization"="Bearer $token"} `
  -ContentType "application/json" `
  -Body "{`"productId`":`"$productId`"}"

# Get wishlist
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/wishlist" `
  -Headers @{"Authorization"="Bearer $token"}

# Get wishlist count
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/wishlist/count" `
  -Headers @{"Authorization"="Bearer $token"}
```

## File Structure

```
backend/src/
├── controllers/
│   ├── cart.controller.ts          ✅ NEW
│   └── wishlist.controller.ts      ✅ NEW
├── repositories/
│   ├── cart.repository.ts          ✅ NEW
│   ├── wishlist.repository.ts      ✅ NEW
│   └── product.repository.ts       ✏️  UPDATED (+getInventory method)
├── routes/
│   ├── cart.routes.ts              ✅ NEW
│   ├── wishlist.routes.ts          ✅ NEW
│   └── index.ts                    ✏️  UPDATED (+cart, wishlist routes)
├── services/
│   ├── cart.service.ts             ✅ NEW
│   └── wishlist.service.ts         ✅ NEW
└── validators/
    ├── cart.validator.ts           ✅ NEW
    └── wishlist.validator.ts       ✅ NEW
```

## API Endpoints

### Cart Endpoints (7)
```
GET    /api/v1/cart                      # Get user's cart
GET    /api/v1/cart/count                # Get item count
GET    /api/v1/cart/validate             # Validate cart
POST   /api/v1/cart/items                # Add to cart
PATCH  /api/v1/cart/items/:itemId        # Update quantity
DELETE /api/v1/cart/items/:itemId        # Remove item
DELETE /api/v1/cart/items                # Clear cart
```

### Wishlist Endpoints (9)
```
GET    /api/v1/wishlist                  # Get wishlist
GET    /api/v1/wishlist/count            # Get item count
GET    /api/v1/wishlist/check/:productId # Check if in wishlist
POST   /api/v1/wishlist/items            # Add to wishlist
POST   /api/v1/wishlist/items/:itemId/move-to-cart  # Move to cart
POST   /api/v1/wishlist/move-all-to-cart # Move all to cart
DELETE /api/v1/wishlist/items/:itemId    # Remove item
DELETE /api/v1/wishlist/products/:productId # Remove by product ID
DELETE /api/v1/wishlist/items            # Clear wishlist
```

## Testing with REST Client

### Option 1: Use PHASE-7-TEST.http
1. Open `PHASE-7-TEST.http` in VS Code
2. Install "REST Client" extension if not installed
3. Click "Send Request" above each test
4. Tests are numbered 1-41 with clear sections

### Option 2: Use cURL (Linux/Mac/WSL)
```bash
# Login
TOKEN=$(curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer1@example.com","password":"Customer123!"}' \
  | jq -r '.data.accessToken')

# Get product ID
PRODUCT_ID=$(curl http://localhost:3001/api/v1/products | jq -r '.data.products[0].id')

# Add to cart
curl -X POST http://localhost:3001/api/v1/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"$PRODUCT_ID\",\"quantity\":2}"

# Get cart
curl http://localhost:3001/api/v1/cart \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Issue: "Cart not found" or "Wishlist not found"
**Solution**: These are created automatically on first access. Just retry the operation.

### Issue: "Insufficient stock"
**Solution**: Check product inventory:
```powershell
npm run db:studio
# Look at inventory table
```

### Issue: "Product not found"
**Solution**: Make sure products are seeded:
```powershell
npm run db:seed
```

### Issue: "Invalid token"
**Solution**: Token might be expired. Login again to get new token.

### Issue: "Product is not available"
**Solution**: Check that product.active = true in database.

## Key Features

### Cart Features
- ✅ Auto-creates cart on first access
- ✅ Validates stock before adding
- ✅ Updates quantity if product already in cart
- ✅ Calculates totals automatically
- ✅ Detects unavailable items
- ✅ Validates before checkout
- ✅ Supports product variants

### Wishlist Features
- ✅ Auto-creates wishlist on first access
- ✅ Prevents duplicate products
- ✅ Move single item to cart
- ✅ Batch move all items to cart
- ✅ Check product wishlist status
- ✅ Display stock availability

### Stock Management
- ✅ Real-time inventory checking
- ✅ Considers reserved stock
- ✅ Prevents overselling
- ✅ Detailed validation messages

## Next Steps

After testing Phase 7, proceed to:
- **Phase 8**: Checkout Process
- **Phase 9**: Order Management
- **Phase 10**: Inventory Management

## Common Test Scenarios

### Scenario 1: Add Multiple Products
```powershell
# Add product 1
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/cart/items" `
  -Method Post `
  -Headers @{"Authorization"="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"productId":"product-1-uuid","quantity":2}'

# Add product 2
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/cart/items" `
  -Method Post `
  -Headers @{"Authorization"="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"productId":"product-2-uuid","quantity":1}'

# View cart
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/cart" `
  -Headers @{"Authorization"="Bearer $token"}
```

### Scenario 2: Wishlist to Cart Flow
```powershell
# Add to wishlist
$wishlistResponse = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/wishlist/items" `
  -Method Post `
  -Headers @{"Authorization"="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"productId":"product-uuid"}'

$itemId = $wishlistResponse.data.item.id

# Move to cart
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/wishlist/items/$itemId/move-to-cart" `
  -Method Post `
  -Headers @{"Authorization"="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"quantity":3}'

# Verify
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/cart" `
  -Headers @{"Authorization"="Bearer $token"}
```

### Scenario 3: Update and Remove
```powershell
# Get cart items
$cart = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/cart" `
  -Headers @{"Authorization"="Bearer $token"}

$itemId = $cart.data.cart.items[0].id

# Update quantity
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/cart/items/$itemId" `
  -Method Patch `
  -Headers @{"Authorization"="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{"quantity":5}'

# Remove item
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/cart/items/$itemId" `
  -Method Delete `
  -Headers @{"Authorization"="Bearer $token"}
```

## Validation Rules

### Cart Item
- **productId**: Required, must be valid UUID
- **variantId**: Optional, must be valid UUID
- **quantity**: Required, 1-1000

### Wishlist Item
- **productId**: Required, must be valid UUID, must not be duplicate

### Stock Validation
- Available stock = currentStock - reservedStock
- Requested quantity must not exceed available stock
- Product must be active

## Documentation

For complete documentation, see:
- `docs/05-phase-7-cart-wishlist.md` - Full technical documentation
- `PHASE-7-TEST.http` - 41 comprehensive test cases
- `PHASE-7-SETUP.md` - This file

---

**Phase 7 is ready!** All features implemented and tested. No database migration needed.
