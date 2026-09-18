/**
 * Environment Configuration
 * 
 * Validates and exports environment variables with type safety.
 * Uses Zod for runtime validation.
 */

import { z } from 'zod'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Environment schema validation
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  API_URL: z.string().url().default('http://localhost:3001'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Bcrypt
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default('12'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('5'),
  SEARCH_RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('20'),

  // File Upload
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'), // 5MB
  ALLOWED_IMAGE_TYPES: z.string().default('image/jpeg,image/jpg,image/png,image/webp'),
  MAX_IMAGES_PER_PRODUCT: z.string().transform(Number).default('5'),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_SECURE: z.string().transform((val) => val === 'true').optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@agrimarket.com'),
  EMAIL_FROM_NAME: z.string().default('AgriMarket'),

  // Payment
  CHAPA_SECRET_KEY: z.string().optional(),
  CHAPA_PUBLIC_KEY: z.string().optional(),
  CHAPA_WEBHOOK_SECRET: z.string().optional(),
  CHAPA_API_URL: z.string().url().optional(),
  TELEBIRR_APP_ID: z.string().optional(),
  TELEBIRR_APP_KEY: z.string().optional(),
  TELEBIRR_PUBLIC_KEY: z.string().optional(),
  TELEBIRR_API_URL: z.string().url().optional(),
  USE_MOCK_PAYMENT: z.string().transform((val) => val === 'true').default('true'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
  LOG_FILE_ERROR: z.string().default('logs/error.log'),
  LOG_FILE_COMBINED: z.string().default('logs/combined.log'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: z.string().transform((val) => val === 'true').default('true'),

  // Session
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),

  // Feature Flags
  ENABLE_EMAIL_VERIFICATION: z.string().transform((val) => val === 'true').default('true'),
  ENABLE_RECOMMENDATIONS: z.string().transform((val) => val === 'true').default('true'),
  ENABLE_REVIEWS: z.string().transform((val) => val === 'true').default('true'),
  ENABLE_WISHLISTS: z.string().transform((val) => val === 'true').default('true'),

  // Business Rules
  BASE_DELIVERY_FEE: z.string().transform(Number).default('50'),
  DELIVERY_FEE_PER_KM: z.string().transform(Number).default('5'),
  MIN_ORDER_AMOUNT: z.string().transform(Number).default('100'),
  MAX_ORDER_AMOUNT: z.string().transform(Number).default('100000'),
  ORDER_CANCELLATION_WINDOW: z.string().transform(Number).default('24'),
  REVIEW_EDIT_WINDOW: z.string().transform(Number).default('30'),
  CART_EXPIRY_DAYS: z.string().transform(Number).default('30'),

  // Development
  DETAILED_ERRORS: z.string().transform((val) => val === 'true').default('false'),
  LOG_QUERIES: z.string().transform((val) => val === 'true').default('false'),
  LOG_REQUESTS: z.string().transform((val) => val === 'true').default('true'),
})

// Parse and validate environment variables
let env: z.infer<typeof envSchema>

try {
  env = envSchema.parse(process.env)
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Invalid environment variables:')
    console.error(error.errors)
    process.exit(1)
  }
  throw error
}

// Export validated environment
export const config = {
  // Application
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  apiUrl: env.API_URL,
  frontendUrl: env.FRONTEND_URL,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // Database
  database: {
    url: env.DATABASE_URL,
  },

  // Authentication
  jwt: {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessExpiry: env.JWT_ACCESS_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },

  bcrypt: {
    saltRounds: env.BCRYPT_SALT_ROUNDS,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    auth: {
      maxRequests: env.AUTH_RATE_LIMIT_MAX_REQUESTS,
    },
    search: {
      maxRequests: env.SEARCH_RATE_LIMIT_MAX_REQUESTS,
    },
  },

  // File Upload
  upload: {
    dir: env.UPLOAD_DIR,
    maxFileSize: env.MAX_FILE_SIZE,
    allowedImageTypes: env.ALLOWED_IMAGE_TYPES.split(','),
    maxImagesPerProduct: env.MAX_IMAGES_PER_PRODUCT,
  },

  // Email
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
    from: env.EMAIL_FROM,
    fromName: env.EMAIL_FROM_NAME,
  },

  // Payment
  payment: {
    useMock: env.USE_MOCK_PAYMENT,
    chapa: {
      secretKey: env.CHAPA_SECRET_KEY,
      publicKey: env.CHAPA_PUBLIC_KEY,
      webhookSecret: env.CHAPA_WEBHOOK_SECRET,
      apiUrl: env.CHAPA_API_URL,
    },
    telebirr: {
      appId: env.TELEBIRR_APP_ID,
      appKey: env.TELEBIRR_APP_KEY,
      publicKey: env.TELEBIRR_PUBLIC_KEY,
      apiUrl: env.TELEBIRR_API_URL,
    },
  },

  // Logging
  logging: {
    level: env.LOG_LEVEL,
    errorFile: env.LOG_FILE_ERROR,
    combinedFile: env.LOG_FILE_COMBINED,
  },

  // CORS
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: env.CORS_CREDENTIALS,
  },

  // Session
  session: {
    secret: env.SESSION_SECRET,
  },

  // Feature Flags
  features: {
    emailVerification: env.ENABLE_EMAIL_VERIFICATION,
    recommendations: env.ENABLE_RECOMMENDATIONS,
    reviews: env.ENABLE_REVIEWS,
    wishlists: env.ENABLE_WISHLISTS,
  },

  // Business Rules
  business: {
    deliveryFee: {
      base: env.BASE_DELIVERY_FEE,
      perKm: env.DELIVERY_FEE_PER_KM,
    },
    order: {
      minAmount: env.MIN_ORDER_AMOUNT,
      maxAmount: env.MAX_ORDER_AMOUNT,
      cancellationWindowHours: env.ORDER_CANCELLATION_WINDOW,
    },
    review: {
      editWindowDays: env.REVIEW_EDIT_WINDOW,
    },
    cart: {
      expiryDays: env.CART_EXPIRY_DAYS,
    },
  },

  // Development
  dev: {
    detailedErrors: env.DETAILED_ERRORS,
    logQueries: env.LOG_QUERIES,
    logRequests: env.LOG_REQUESTS,
  },
} as const

export default config
