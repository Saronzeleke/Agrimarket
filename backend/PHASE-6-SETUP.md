# Phase 6 Setup Guide

## Quick Start

### 1. Start PostgreSQL
```powershell
# From project root
docker-compose up -d postgres
```

### 2. Install Dependencies (if not already done)
```powershell
cd backend
npm install
```

### 3. Run Migration
```powershell
# Generate Prisma client
npm run db:generate

# Run migration to add search tables
npm run db:migrate

# If prompted for migration name, use: add_search_and_saved_searches
```

### 4. Verify Database
```powershell
# Check that new tables exist
npm run db:studio
```

Look for these new tables:
- `search_logs`
- `saved_searches`

### 5. Start Development Server
```powershell
npm run dev
```

## Testing the Search Endpoints

### Test 1: Basic Search
```powershell
# Search for products
curl "http://localhost:3001/api/v1/search?query=teff"
```

### Test 2: Search with Filters
```powershell
# Search with price range
curl "http://localhost:3001/api/v1/search?query=coffee&minPrice=100&maxPrice=500"
```

### Test 3: Autocomplete
```powershell
curl "http://localhost:3001/api/v1/search/suggestions?query=te"
```

### Test 4: Popular Searches
```powershell
curl "http://localhost:3001/api/v1/search/popular"
```

### Test 5: Saved Searches (Requires Auth)

#### Step 1: Login
```powershell
# Login as customer
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/v1/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"customer1@example.com","password":"Customer123!"}'

$token = $response.data.accessToken
echo $token
```

#### Step 2: Save a Search
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/search/saved" `
  -Method Post `
  -Headers @{"Authorization"="Bearer $token"} `
  -ContentType "application/json" `
  -Body '{
    "name": "My Teff Search",
    "query": "teff",
    "filters": {
      "minPrice": 50,
      "maxPrice": 200
    }
  }'
```

#### Step 3: Get Saved Searches
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/v1/search/saved" `
  -Headers @{"Authorization"="Bearer $token"}
```

#### Step 4: Execute Saved Search
```powershell
# Use the ID from the previous response
$searchId = "<paste-id-here>"

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/search/saved/$searchId/execute" `
  -Headers @{"Authorization"="Bearer $token"}
```

## Troubleshooting

### Issue: Migration fails
**Solution**: Ensure PostgreSQL is running
```powershell
docker ps
# Should show postgres container running
```

### Issue: Tables not created
**Solution**: Run migration manually
```powershell
cd backend
npx prisma migrate dev --name add_search_tables
```

### Issue: Cannot connect to database
**Solution**: Check .env file
```
DATABASE_URL="postgresql://agrimarket_user:agrimarket_pass@localhost:5432/agrimarket_db?schema=public"
```

### Issue: Search returns no results
**Solution**: Ensure seed data exists
```powershell
npm run db:seed
```

## File Structure
```
backend/
├── src/
│   ├── controllers/
│   │   └── search.controller.ts         ✅ NEW
│   ├── repositories/
│   │   ├── search.repository.ts         ✅ NEW
│   │   └── saved-search.repository.ts   ✅ NEW
│   ├── routes/
│   │   ├── search.routes.ts             ✅ NEW
│   │   └── index.ts                     ✏️  UPDATED
│   ├── services/
│   │   └── search.service.ts            ✅ NEW
│   └── validators/
│       └── search.validator.ts          ✅ NEW
├── prisma/
│   └── schema.prisma                    ✏️  UPDATED (added 2 models)
└── PHASE-6-SETUP.md                     ✅ NEW
```

## New API Endpoints

### Public (No Auth Required)
- `GET /api/v1/search` - Search products
- `GET /api/v1/search/suggestions` - Autocomplete
- `GET /api/v1/search/popular` - Popular searches

### Protected (Auth Required)
- `GET /api/v1/search/recent` - User's recent searches
- `POST /api/v1/search/saved` - Save a search
- `GET /api/v1/search/saved` - Get all saved searches
- `GET /api/v1/search/saved/:id` - Get one saved search
- `PATCH /api/v1/search/saved/:id` - Update saved search
- `DELETE /api/v1/search/saved/:id` - Delete saved search
- `GET /api/v1/search/saved/:id/execute` - Run saved search

## Next Steps

After testing Phase 6, proceed to:
- **Phase 7**: Shopping Cart & Wishlist
- **Phase 8**: Checkout Process
- **Phase 9**: Order Management
- **Phase 10**: Payment Integration

## Support

For issues or questions:
1. Check the main documentation: `docs/04-phase-6-advanced-search.md`
2. Review the code comments in the source files
3. Check Prisma logs: `backend/logs/`
4. Verify database schema: `npm run db:studio`
