/**
 * Express Application Setup
 * 
 * Configures Express app with middleware, routes, and error handlers.
 */

import express, { Application } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import config from './config/env'
import logger, { httpLogStream } from './config/logger'
import { CONSTANTS } from './config/constants'
import {
  errorHandler,
  notFoundHandler,
} from './middleware/error.middleware'
import {
  sanitizeInput,
  logSuspiciousActivity,
} from './middleware/security.middleware'
import {
  authLimiter,
  apiLimiter,
  passwordResetLimiter,
} from './middleware/rate-limit.middleware'

// Create Express application
const app: Application = express()

// ============================================
// Security Middleware
// ============================================

// Helmet - Security headers
app.use(
  helmet({
    contentSecurityPolicy: config.isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
          },
        }
      : false, // Disable in development
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    frameguard: {
      action: 'deny',
    },
    xssFilter: true,
  })
)

// CORS - Cross-Origin Resource Sharing
const allowedOrigins = config.isProduction
  ? [config.cors.origin]
  : [config.cors.origin, 'http://localhost:3000', 'http://localhost:5173']

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true)
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: config.cors.credentials,
    methods: CONSTANTS.ALLOWED_METHODS as string[],
    allowedHeaders: CONSTANTS.ALLOWED_HEADERS as string[],
    maxAge: 600, // 10 minutes
  })
)

// XSS Protection - Sanitize user input
app.use(sanitizeInput)

// Suspicious Activity Monitor
app.use(logSuspiciousActivity)

// Global API Rate Limiter
app.use(apiLimiter)

// ============================================
// Parsing Middleware
// ============================================

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }))

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ============================================
// Compression
// ============================================

// Compress responses
app.use(compression())

// ============================================
// Logging Middleware
// ============================================

if (config.dev.logRequests) {
  // HTTP request logging
  app.use(
    morgan(
      config.isDevelopment
        ? 'dev' // Colored output for development
        : ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
      { stream: httpLogStream }
    )
  )
}

// ============================================
// Static Files
// ============================================

// Serve uploaded files
app.use('/uploads', express.static(config.upload.dir))

// ============================================
// Health Check
// ============================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      uptime: process.uptime(),
    },
  })
})

// ============================================
// API Routes
// ============================================

import routes from './routes'

// Mount API routes
app.use(CONSTANTS.API_PREFIX, routes)

// API root endpoint
app.get(CONSTANTS.API_PREFIX, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'AgriMarket API v1',
      version: '1.0.0',
      documentation: `${config.apiUrl}/docs`,
      endpoints: {
        auth: `${CONSTANTS.API_PREFIX}/auth`,
        health: `${CONSTANTS.API_PREFIX}/health`,
      },
    },
  })
})

// ============================================
// Error Handling
// ============================================

// 404 handler (must be after all routes)
app.use(notFoundHandler)

// Global error handler (must be last)
app.use(errorHandler)

// ============================================
// Export Application
// ============================================

export default app
