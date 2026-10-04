/**
 * Security Middleware
 * 
 * Additional security measures for request validation and sanitization.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import config from '../config/env';
import { ValidationError } from '../utils/errors';
import logger from '../config/logger';

/**
 * CSRF Protection using double-submit cookie pattern
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip if CSRF protection is disabled (for development/testing)
  if (!config.csrf.enabled) {
    return next();
  }

  // Skip CSRF for GET, HEAD, OPTIONS requests (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    // Generate and set CSRF token cookie for GET requests if not already set
    if (!req.cookies['XSRF-TOKEN']) {
      const csrfToken = crypto.randomBytes(32).toString('hex')
      res.cookie('XSRF-TOKEN', csrfToken, {
        httpOnly: false, // Must be readable by JavaScript
        secure: config.isProduction,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
    }
    return next()
  }

  // For state-changing requests (POST, PUT, PATCH, DELETE), validate CSRF token
  const cookieToken = req.cookies['XSRF-TOKEN']
  const headerToken = req.headers['x-xsrf-token'] as string

  if (!cookieToken || !headerToken) {
    logger.warn('CSRF token missing', {
      ip: req.ip,
      method: req.method,
      url: req.url,
    })
    throw new ValidationError('CSRF token missing')
  }

  if (cookieToken !== headerToken) {
    logger.warn('CSRF token mismatch', {
      ip: req.ip,
      method: req.method,
      url: req.url,
    })
    throw new ValidationError('CSRF token invalid')
  }

  next()
}

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize a string to prevent XSS
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }

  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate request content type
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  // Only validate POST, PUT, PATCH requests
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return next();
  }

  const contentType = req.headers['content-type'];

  // Allow JSON and multipart (for file uploads)
  if (contentType && (
    contentType.includes('application/json') ||
    contentType.includes('multipart/form-data')
  )) {
    return next();
  }

  throw new ValidationError('Invalid Content-Type. Must be application/json or multipart/form-data');
};

/**
 * Prevent parameter pollution
 */
export const preventParameterPollution = (req: Request, res: Response, next: NextFunction) => {
  // Check for duplicate query parameters
  const queryKeys = Object.keys(req.query);
  const uniqueKeys = new Set(queryKeys);

  if (queryKeys.length !== uniqueKeys.size) {
    logger.warn('Parameter pollution detected', {
      ip: req.ip,
      url: req.url,
      query: req.query,
    });
  }

  next();
};

/**
 * Add security headers to response
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
};

/**
 * Validate file upload with magic number (file signature) validation
 */
export const validateFileUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.file ? [req.file] : (Array.isArray(req.files) ? req.files : Object.values(req.files).flat());

    for (const file of files) {
      if (!file) continue;

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new ValidationError('File size exceeds 5MB limit');
      }

      // Validate file type using magic numbers (file signatures)
      if (file.buffer) {
        const fileType = await fileTypeFromBuffer(file.buffer);
        
        // Allowed MIME types
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        
        if (!fileType || !allowedTypes.includes(fileType.mime)) {
          logger.warn('File upload rejected - invalid file type', {
            detectedType: fileType?.mime || 'unknown',
            claimedType: file.mimetype,
            filename: file.originalname,
            ip: req.ip,
          });
          throw new ValidationError(
            `Invalid file type. Only JPEG, PNG, and WebP images are allowed. Detected type: ${fileType?.mime || 'unknown'}`
          );
        }

        // Additional check: MIME type should match the detected type
        if (file.mimetype !== fileType.mime && !allowedTypes.includes(fileType.mime)) {
          logger.warn('File upload rejected - MIME type mismatch', {
            detectedType: fileType.mime,
            claimedType: file.mimetype,
            filename: file.originalname,
            ip: req.ip,
          });
          throw new ValidationError('File type mismatch detected');
        }
      } else {
        // If buffer is not available, fall back to MIME type check only
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          throw new ValidationError('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
        }
      }

      // Sanitize filename
      if (file.originalname) {
        file.originalname = sanitizeFilename(file.originalname);
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Sanitize filename
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .substring(0, 255);
}

/**
 * Log suspicious activity
 */
export const logSuspiciousActivity = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /\.\.\//,
    /\/etc\/passwd/,
    /union.*select/i,
    /exec\(/i,
  ];

  const checkString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      logger.warn('Suspicious activity detected', {
        ip: req.ip,
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent'],
        pattern: pattern.toString(),
      });
      break;
    }
  }

  next();
};
