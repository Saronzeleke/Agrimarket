/**
 * Role-Based Access Control Middleware
 * 
 * Checks if authenticated user has required role.
 */

import { Request, Response, NextFunction } from 'express'
import { Role } from '@prisma/client'
import { AuthorizationError, AuthenticationError } from '../utils/errors'

/**
 * Require specific role(s)
 */
export function authorize(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'))
    }

    // Check if user has required role
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError('You do not have permission to access this resource')
      )
    }

    next()
  }
}

/**
 * Require customer role
 */
export function requireCustomer(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  authorize([Role.CUSTOMER])(req, res, next)
}

/**
 * Require seller role
 */
export function requireSeller(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  authorize([Role.SELLER])(req, res, next)
}

/**
 * Require admin role
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  authorize([Role.ADMIN])(req, res, next)
}

/**
 * Require customer or seller role
 */
export function requireCustomerOrSeller(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  authorize([Role.CUSTOMER, Role.SELLER])(req, res, next)
}

/**
 * Check if user owns resource
 * Used for operations like "user can only update their own profile"
 */
export function requireResourceOwner(resourceUserIdField: string = 'userId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'))
    }

    // Admins can access any resource
    if (req.user.role === Role.ADMIN) {
      return next()
    }

    // Get resource user ID from request params or body
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField]

    // Check if user owns the resource
    if (resourceUserId !== req.user.id) {
      return next(
        new AuthorizationError('You do not have permission to access this resource')
      )
    }

    next()
  }
}
