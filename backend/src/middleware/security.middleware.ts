/**
 * Security Middleware
 * 
 * Additional security measures for request validation and sanitization.
 */

import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/errors';
import logger from '../config/logger';

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
 * Validate file upload
 */
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return next();
  }

  const file = req.file || (Array.isArray(req.files) ? req.files[0] : null);

  if (!file) {
    return next();
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new ValidationError('File size exceeds 5MB limit');
  }

  // Validate file type (images only)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new ValidationError('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
  }

  // Sanitize filename
  if (file.originalname) {
    file.originalname = sanitizeFilename(file.originalname);
  }

  next();
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
