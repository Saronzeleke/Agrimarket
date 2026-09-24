/**
 * Rate Limiting Middleware, Prevent brute force attacks and API abuse.
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again after 15 minutes.',
      },
    });
  },
});

/**
 * Authentication rate limiter (stricter)
 * 5 login attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.',
    },
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
      },
    });
  },
});

/**
 * Password reset rate limiter
 * 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: {
      code: 'RESET_RATE_LIMIT_EXCEEDED',
      message: 'Too many password reset requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RESET_RATE_LIMIT_EXCEEDED',
        message: 'Too many password reset requests. Please try again after 1 hour.',
      },
    });
  },
});

/**
 * Email verification rate limiter
 * 3 requests per hour per IP
 */
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    error: {
      code: 'VERIFICATION_RATE_LIMIT_EXCEEDED',
      message: 'Too many verification requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'VERIFICATION_RATE_LIMIT_EXCEEDED',
        message: 'Too many email verification requests. Please try again after 1 hour.',
      },
    });
  },
});

/**
 * Order creation rate limiter
 * 10 orders per hour per authenticated user
 */
export const orderCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.id || req.ip || 'unknown';
  },
  message: {
    success: false,
    error: {
      code: 'ORDER_RATE_LIMIT_EXCEEDED',
      message: 'Too many orders created, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'ORDER_RATE_LIMIT_EXCEEDED',
        message: 'Too many orders. Please try again after 1 hour.',
      },
    });
  },
});

/**
 * Review submission rate limiter
 * 5 reviews per hour per authenticated user
 */
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip || 'unknown';
  },
  message: {
    success: false,
    error: {
      code: 'REVIEW_RATE_LIMIT_EXCEEDED',
      message: 'Too many reviews submitted, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'REVIEW_RATE_LIMIT_EXCEEDED',
        message: 'Too many reviews. Please try again after 1 hour.',
      },
    });
  },
});

/**
 * Search rate limiter
 * 30 searches per minute per IP
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    error: {
      code: 'SEARCH_RATE_LIMIT_EXCEEDED',
      message: 'Too many search requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'SEARCH_RATE_LIMIT_EXCEEDED',
        message: 'Too many search requests. Please slow down.',
      },
    });
  },
});
