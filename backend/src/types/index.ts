// Common Type Definitions , Shared types used across the application.


import { Role, PaymentStatus } from '@prisma/client'
// API Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  pagination?: PaginationMeta
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginationParams {
  page: number
  limit: number
  skip: number
}
// Auth Types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface TokenPayload {
  userId: string
  email: string
  role: Role
  iat?: number
  exp?: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}
// Product Types
export interface ProductFilters {
  categoryId?: string
  sellerId?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  rating?: number
  inStock?: boolean
  search?: string
}

export interface ProductWithRelations {
  id: string
  name: string
  slug: string
  description: string
  price: number
  unit: string
  rating: number
  reviewCount: number
  images: Array<{ url: string; alt?: string }>
  seller: {
    businessName: string
    rating: number
  }
  category: {
    name: string
    slug: string
  }
  inventory?: {
    currentStock: number
    reservedStock: number
  }
}
// Order Types
export interface CreateOrderData {
  customerId: string
  items: OrderItemData[]
  shippingAddress: AddressData
  notes?: string
}

export interface OrderItemData {
  productId: string
  variantId?: string
  quantity: number
  price: number
}

export interface AddressData {
  fullName: string
  phone: string
  region: string
  zone: string
  woreda: string
  kebele: string
  specificLocation: string
}

export interface OrderSummary {
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
}
// Cart Types
export interface CartItemData {
  productId: string
  variantId?: string
  quantity: number
}

export interface CartWithItems {
  id: string
  userId: string
  items: Array<{
    id: string
    productId: string
    variantId?: string
    quantity: number
    product: {
      id: string
      name: string
      slug: string
      price: number
      unit: string
      images: Array<{ url: string }>
      inventory?: {
        currentStock: number
        reservedStock: number
      }
    }
  }>
}
// Review Types
export interface CreateReviewData {
  productId: string
  orderId: string
  rating: number
  title?: string
  comment?: string
}

export interface ReviewWithUser {
  id: string
  rating: number
  title?: string
  comment?: string
  verifiedPurchase: boolean
  helpful: number
  createdAt: Date
  user: {
    firstName: string
    lastName: string
  }
}
// Seller Types
export interface SellerProfileData {
  businessName: string
  description?: string
  phone: string
  location: string
}

export interface SellerAnalytics {
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  orders: {
    total: number
    pending: number
    completed: number
  }
  products: {
    total: number
    active: number
    lowStock: number
  }
  topProducts: Array<{
    productId: string
    name: string
    revenue: number
    orders: number
  }>
}
// Notification Types
export interface CreateNotificationData {
  userId: string
  type: string
  title: string
  message: string
  metadata?: any
}
// Search Types
export interface SearchFilters {
  query?: string
  categoryId?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  location?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}
// Recommendation Types
export interface RecommendationContext {
  userId?: string
  productId?: string
  categoryId?: string
  limit?: number
}
// File Upload Types
export interface UploadedFile {
  filename: string
  path: string
  size: number
  mimetype: string
}
// Audit Types
export interface AuditLogData {
  userId?: string
  action: string
  entityType: string
  entityId: string
  details?: any
  ipAddress?: string
  userAgent?: string
}
// Email Types
export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}
// Payment Types
export interface PaymentInitiationData {
  orderId: string
  amount: number
  currency: string
  returnUrl: string
  cancelUrl: string
}

export interface PaymentWebhookData {
  transactionId: string
  status: PaymentStatus
  amount: number
  metadata?: any
}
// Business Rule Types

export interface OrderValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

export interface StockValidationResult {
  available: boolean
  requestedQuantity: number
  availableQuantity: number
}
