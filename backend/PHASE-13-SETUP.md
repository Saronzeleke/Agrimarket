# Phase 13: Reviews & Ratings System - Setup & Implementation

## Overview
Phase 13 implements a comprehensive product review and rating system with moderation capabilities, helpful voting, seller responses, and robust validation to ensure authentic and high-quality reviews.

## Implementation Summary

### Database Changes
1. **Updated Review Model**: Added moderation fields and seller response
2. **New HelpfulVote Model**: Tracks which users found which reviews helpful
3. **Migration SQL**: `prisma/manual-migration-phase13.sql`

### Files Created/Modified
1. **Repository**: `src/repositories/review.repository.ts` (350+ lines)
2. **Service**: `src/services/review.service.ts` (300+ lines)
3. **Controller**: `src/controllers/review.controller.ts` (200+ lines)
4. **Validators**: `src/validators/review.validator.ts`
5. **Routes**: `src/routes/review.routes.ts` (new)
6. **Routes**: Updated `src/routes/seller.routes.ts` (added review endpoints)
7. **Routes**: Updated `src/routes/admin.routes.ts` (added moderation endpoints)
8. **Routes**: Updated `src/routes/index.ts` (mounted review routes)

## Features Implemented

### 1. Submit Product Reviews
**Endpoint**: `POST /api/v1/reviews`

Allows customers to review products they've purchased:
- **Rating**: 1-5 stars (required)
- **Title**: Optional review title (3-100 characters)
- **Comment**: Optional review text (10-1000 characters)
- **Verified Purchase**: Automatically determined
- **One Review Per Product**: Prevents duplicate reviews

**Validations**:
- User must be authenticated
- User can only review once per product
- Rating must be between 1 and 5
- Verified purchase status is automatic (based on DELIVERED orders)

**Response includes**:
- Review ID, rating, title, comment
- User information (name)
- Verified purchase badge
- Helpful count (starts at 0)
- Timestamps

### 2. View Product Reviews
**Endpoint**: `GET /api/v1/products/:productId/reviews`

Public endpoint to view all reviews for a product:
- **Pagination**: page and limit query parameters
- **Filtering**: Filter by rating, verified purchases only
- **Sorting**: Sort by recent, rating, or helpfulness
- **Approval**: Only approved reviews are shown

**Query Parameters**:
- `rating` (1-5): Filter by specific rating
- `verifiedOnly` (boolean): Show only verified purchases
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (1-100, default: 20)
- `sortBy`: 'recent' | 'rating' | 'helpful' (default: 'recent')

**Response includes**:
- Array of reviews with user info
- Seller responses (if any)
- Helpful vote count
- Pagination metadata

### 3. Review Statistics
**Endpoint**: `GET /api/v1/products/:productId/reviews/stats`

Public endpoint for review statistics:
- **Average Rating**: Calculated from all approved reviews
- **Total Review Count**: Number of approved reviews
- **Rating Distribution**: Count of 5★, 4★, 3★, 2★, 1★ reviews
- **Verified Percentage**: % of reviews from verified purchases

**Use Cases**:
- Display product rating on product cards
- Show rating breakdown before purchase
- Build trust with verified purchase percentage

### 4. Update Own Review
**Endpoint**: `PATCH /api/v1/reviews/:reviewId`

Allows customers to update their own reviews:
- Can update rating, title, and/or comment
- Must be the review author
- At least one field must be provided

**Validations**:
- User must be authenticated
- User must be the review owner
- Rating validation (1-5 if provided)

### 5. Delete Own Review
**Endpoint**: `DELETE /api/v1/reviews/:reviewId`

Allows customers to delete their own reviews:
- Must be the review author
- Permanently deletes the review
- Also deletes associated helpful votes

### 6. Helpful Voting
**Endpoint**: `POST /api/v1/reviews/:reviewId/helpful`

Toggle helpful vote on a review:
- Authenticated users only
- Cannot vote on own reviews
- Toggle: Add vote if not voted, remove if already voted
- Helpful count updated automatically

**Response**:
- `helpful`: true if vote added, false if removed
- `message`: Descriptive message

### 7. Flag Reviews
**Endpoint**: `POST /api/v1/reviews/:reviewId/flag`

Flag inappropriate reviews for moderation:
- Authenticated users can flag any review
- Cannot flag already flagged reviews
- Flagged reviews go to admin queue
- Review remains visible until admin action

**Use Cases**:
- Spam reviews
- Offensive content
- Fake reviews
- Inappropriate language

### 8. Seller Responses
**Endpoint**: `POST /api/v1/seller/reviews/:reviewId/respond`

Sellers can respond to reviews of their products:
- **Response Text**: 10-500 characters
- **One Response Per Review**: Cannot respond twice
- **Ownership Verification**: Can only respond to own product reviews
- **Timestamp**: Response time is recorded

**Seller Review Management**:
- `GET /api/v1/seller/reviews`: Get all reviews for seller's products
- `GET /api/v1/seller/reviews?needsResponse=true`: Get reviews without responses
- Pagination support

**Benefits**:
- Seller engagement with customers
- Address customer concerns publicly
- Show responsiveness
- Improve customer service perception

### 9. Admin Moderation
**Endpoints**:
- `GET /api/v1/admin/reviews/flagged`: Get flagged reviews
- `PATCH /api/v1/admin/reviews/:reviewId/moderate`: Approve/reject review
- `DELETE /api/v1/admin/reviews/:reviewId`: Delete review

**Moderation Workflow**:
1. Reviews are flagged by users or system
2. Admins review flagged content
3. Admins approve (visible) or reject (hidden) reviews
4. Flagged status cleared after moderation
5. Admins can delete inappropriate reviews

**Flagged Review Response includes**:
- Review content and metadata
- User information
- Product information
- Flagged timestamp
- Helpful count

## Database Schema

### Review Model Updates
```prisma
model Review {
  id               String    @id @default(uuid())
  userId           String
  productId        String
  orderId          String
  rating           Int       // 1-5 stars
  title            String?
  comment          String?   @db.Text
  verifiedPurchase Boolean   @default(true)
  helpful          Int       @default(0)
  approved         Boolean   @default(true)    // NEW
  flagged          Boolean   @default(false)   // NEW
  sellerResponse   String?   @db.Text          // NEW
  respondedAt      DateTime?                   // NEW
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  user           User            @relation(...)
  product        Product         @relation(...)
  helpfulVotes   HelpfulVote[]   // NEW

  @@unique([userId, productId])
  @@index([productId])
  @@index([rating])
  @@index([approved])    // NEW
  @@index([createdAt])
}
```

### New HelpfulVote Model
```prisma
model HelpfulVote {
  id        String   @id @default(uuid())
  userId    String
  reviewId  String
  createdAt DateTime @default(now())

  user   User   @relation(...)
  review Review @relation(...)

  @@unique([userId, reviewId])
  @@index([reviewId])
}
```

## API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **Customer Endpoints** |
| POST | `/reviews` | Customer | Submit a product review |
| GET | `/reviews/:reviewId` | Customer | Get review by ID |
| PATCH | `/reviews/:reviewId` | Customer | Update own review |
| DELETE | `/reviews/:reviewId` | Customer | Delete own review |
| POST | `/reviews/:reviewId/helpful` | Any | Toggle helpful vote |
| POST | `/reviews/:reviewId/flag` | Any | Flag review |
| **Public Endpoints** |
| GET | `/products/:productId/reviews` | Public | Get product reviews |
| GET | `/products/:productId/reviews/stats` | Public | Get review statistics |
| **Seller Endpoints** |
| GET | `/seller/reviews` | Seller | Get seller's product reviews |
| POST | `/seller/reviews/:reviewId/respond` | Seller | Respond to review |
| **Admin Endpoints** |
| GET | `/admin/reviews/flagged` | Admin | Get flagged reviews |
| PATCH | `/admin/reviews/:reviewId/moderate` | Admin | Moderate review |
| DELETE | `/admin/reviews/:reviewId` | Admin | Delete review |

## Validation Rules

### Submit Review
- `productId`: UUID format
- `orderId`: UUID format
- `rating`: Integer 1-5
- `title`: Optional, 3-100 characters
- `comment`: Optional, 10-1000 characters

### Update Review
- At least one field must be provided
- `rating`: Integer 1-5 (if provided)
- `title`: 3-100 characters (if provided)
- `comment`: 10-1000 characters (if provided)

### Seller Response
- `response`: 10-500 characters

### Query Parameters
- `rating`: Integer 1-5
- `page`: Integer ≥ 1
- `limit`: Integer 1-100
- `sortBy`: enum ['recent', 'rating', 'helpful']
- `verifiedOnly`: boolean
- `needsResponse`: boolean

## Business Logic

### Verified Purchase Detection
```typescript
// Automatically determined when submitting review
verifiedPurchase = await hasUserPurchasedProduct(userId, productId)

// Checks for DELIVERED orders containing the product
```

### Duplicate Review Prevention
```typescript
// Enforced by database unique constraint
@@unique([userId, productId])

// Returns 409 Conflict if user already reviewed
```

### Helpful Vote Toggle
```typescript
// If not voted: Add vote, increment helpful count
// If already voted: Remove vote, decrement helpful count
```

### Review Visibility
```typescript
// Public endpoints only show approved reviews
where: { approved: true }

// Sellers see all reviews of their products
// Admins see all reviews including flagged
```

## Security Considerations

### Authorization
- **Own Review Operations**: Users can only update/delete their own reviews
- **Seller Responses**: Sellers can only respond to reviews of their products
- **Admin Moderation**: Only admins can moderate or delete any review
- **Helpful Voting**: Users cannot vote on own reviews

### Data Validation
- Input validation with Zod schemas
- Rating bounds checking (1-5)
- Text length limits
- UUID format validation

### Duplicate Prevention
- Database unique constraint on (userId, productId)
- One response per review check
- One helpful vote per user per review

### Verified Purchase
- Based on actual order delivery status
- Cannot be manipulated by users
- Automatically determined by system

## Performance Considerations

### Database Indexes
- `reviews.productId`: Fast product review lookup
- `reviews.rating`: Filter by rating
- `reviews.approved`: Filter approved reviews
- `reviews.createdAt`: Sort by date
- `helpfulVotes.reviewId`: Count helpful votes
- `helpfulVotes.userId_reviewId`: Unique constraint + fast lookup

### Query Optimization
- Pagination prevents large result sets
- Selective field loading (don't load unnecessary relations)
- Aggregations for statistics
- Counted queries run in parallel with data queries

### Caching Opportunities (Future)
- Product review statistics (average rating, count)
- Review lists with common filters
- Cache invalidation on new review/rating change

## Error Handling

### Validation Errors (400)
- Invalid rating value
- Text too short/long
- Missing required fields
- Invalid UUIDs

### Authorization Errors (403)
- Updating others' reviews
- Responding to non-owned product reviews
- Admin-only operations by non-admins

### Conflict Errors (409)
- Duplicate review submission
- Multiple seller responses
- Flagging already flagged review
- Marking own review as helpful

### Not Found Errors (404)
- Review ID not found
- Product ID not found

## Testing Recommendations

### Unit Tests
- Repository methods with mocked Prisma
- Service business logic
- Validation schemas
- Statistics calculations

### Integration Tests
- Complete review lifecycle
- Authorization checks
- Duplicate prevention
- Helpful vote toggle
- Seller response flow
- Admin moderation flow

### Edge Cases
- Review without delivered order
- Seller responding to other seller's reviews
- Customer updating after seller response
- Multiple concurrent helpful votes
- Flagging and moderation race conditions

## Usage Examples

See `PHASE-13-TEST.http` for comprehensive API testing examples including:
- Submit and manage reviews
- Helpful voting
- Seller responses
- Admin moderation
- Error cases
- Complete lifecycle testing

## Future Enhancements
1. **Review Images**: Allow customers to upload photos
2. **Review Questions**: Q&A section for products
3. **Verified Reviewer Badge**: Highlight frequent reviewers
4. **Review Incentives**: Reward customers for detailed reviews
5. **AI Moderation**: Automatic flagging of suspicious reviews
6. **Review Summaries**: AI-generated review summaries
7. **Seller Response Templates**: Pre-written response suggestions
8. **Review Reminders**: Email customers to review after delivery
9. **Review Contests**: Highlight "Review of the Month"
10. **Multi-language Reviews**: Support for Amharic and other languages

## Dependencies
- Authentication System (Phase 4)
- Product Catalog (Phase 5)
- Order Management (Phase 9)

## Next Steps
Once Phase 13 is verified as production-ready:
1. Run database migration
2. Test all review endpoints
3. Verify moderation workflow
4. Check review statistics accuracy
5. Proceed to Phase 14: Recommendation System
