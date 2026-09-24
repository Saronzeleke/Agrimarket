/**
 * Application Constants
 * 
 * Centralized constants used throughout the application.
 * Keeps magic strings and numbers in one place.
 */

export const CONSTANTS = {
  // User
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // Product
  PRODUCT_NAME_MIN_LENGTH: 3,
  PRODUCT_NAME_MAX_LENGTH: 100,
  PRODUCT_DESCRIPTION_MIN_LENGTH: 50,
  PRODUCT_DESCRIPTION_MAX_LENGTH: 5000,
  
  // Order
  ORDER_NUMBER_PREFIX: 'AGM',
  ORDER_NUMBER_FORMAT: 'AGM-YYYYMMDD-XXXXX',
  
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  
  // Units of Measurement
  UNITS: ['kg', 'quintal', 'liter', 'piece', 'dozen'] as const,
  
  // Quality Grades
  QUALITY_GRADES: ['A', 'B', 'C', 'Premium'] as const,
  
  // Address Types
  ADDRESS_TYPES: ['HOME', 'OFFICE'] as const,
  
  // Ethiopian Regions
  ETHIOPIAN_REGIONS: [
    'Addis Ababa',
    'Afar',
    'Amhara',
    'Benishangul-Gumuz',
    'Dire Dawa',
    'Gambela',
    'Harari',
    'Oromia',
    'Sidama',
    'SNNPR',
    'Somali',
    'Tigray',
  ] as const,
  
  // Payment Providers
  PAYMENT_PROVIDERS: ['CHAPA', 'TELEBIRR', 'CBE_BIRR', 'MOCK'] as const,
  
  // File Extensions
  ALLOWED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'] as const,
  
  // Token Expiry
  EMAIL_VERIFICATION_EXPIRY_HOURS: 24,
  PASSWORD_RESET_EXPIRY_HOURS: 1,
  
  // Review
  REVIEW_TITLE_MAX_LENGTH: 100,
  REVIEW_COMMENT_MAX_LENGTH: 1000,
  MIN_RATING: 1,
  MAX_RATING: 5,
  
  // Notification
  NOTIFICATION_TITLE_MAX_LENGTH: 200,
  NOTIFICATION_MESSAGE_MAX_LENGTH: 1000,
  
  // API
  API_VERSION: 'v1',
  API_PREFIX: '/api/v1',
  
  // CORS
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],
  
  // Error Codes
  ERROR_CODES: {
    // Authentication
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
    ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    
    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    
    // Resources
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    CONFLICT: 'CONFLICT',
    
    // Business Logic
    INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
    PRODUCT_OUT_OF_STOCK: 'PRODUCT_OUT_OF_STOCK',
    ORDER_NOT_CANCELLABLE: 'ORDER_NOT_CANCELLABLE',
    INVALID_ORDER_STATUS: 'INVALID_ORDER_STATUS',
    PAYMENT_FAILED: 'PAYMENT_FAILED',
    MINIMUM_ORDER_AMOUNT: 'MINIMUM_ORDER_AMOUNT',
    MAXIMUM_ORDER_AMOUNT: 'MAXIMUM_ORDER_AMOUNT',
    
    // Server
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    
    // Rate Limiting
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  },
  
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },
} as const

// Type exports for TypeScript
export type Unit = typeof CONSTANTS.UNITS[number]
export type QualityGrade = typeof CONSTANTS.QUALITY_GRADES[number]
export type AddressType = typeof CONSTANTS.ADDRESS_TYPES[number]
export type EthiopianRegion = typeof CONSTANTS.ETHIOPIAN_REGIONS[number]
export type PaymentProvider = typeof CONSTANTS.PAYMENT_PROVIDERS[number]
export type ErrorCode = typeof CONSTANTS.ERROR_CODES[keyof typeof CONSTANTS.ERROR_CODES]
