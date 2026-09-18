/**
 * Auth Routes
 * 
 * Authentication and authorization endpoints.
 */

import { Router } from 'express'
import authController from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'
import rateLimit from 'express-rate-limit'
import config from '../config/env'

const router = Router()

// Rate limiter for auth endpoints (stricter limits)
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.auth.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Public routes
 */

// POST /api/v1/auth/register - Register new user
router.post('/register', authLimiter, authController.register)

// POST /api/v1/auth/login - Login user
router.post('/login', authLimiter, authController.login)

// POST /api/v1/auth/refresh - Refresh access token
router.post('/refresh', authController.refreshToken)

// POST /api/v1/auth/verify-email - Verify email address
router.post('/verify-email', authController.verifyEmail)

// POST /api/v1/auth/resend-verification - Resend verification email
router.post('/resend-verification', authLimiter, authController.resendVerification)

// POST /api/v1/auth/forgot-password - Request password reset
router.post('/forgot-password', authLimiter, authController.requestPasswordReset)

// POST /api/v1/auth/reset-password - Reset password with token
router.post('/reset-password', authLimiter, authController.resetPassword)

/**
 * Protected routes (require authentication)
 */

// GET /api/v1/auth/me - Get current user
router.get('/me', authenticate, authController.getCurrentUser)

// POST /api/v1/auth/change-password - Change password
router.post('/change-password', authenticate, authController.changePassword)

// POST /api/v1/auth/logout - Logout (client-side)
router.post('/logout', authenticate, authController.logout)

export default router
