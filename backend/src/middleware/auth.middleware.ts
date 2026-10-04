/**
 * Authentication Middleware, Verifies JWT tokens and attaches user info to request.
 */
import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.utils'
import { AuthenticationError } from '../utils/errors'
import userRepository from '../repositories/user.repository'
import authService from '../services/auth.service'
import prisma from '../config/database'

/**
 * Authenticate request, Verifies JWT token and attaches user to request
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined

    // Try to get token from cookie first (primary method for web clients)
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken
    } 
    // Fallback to Authorization header for API clients and mobile apps
    else {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7) // Remove 'Bearer ' prefix
      }
    }

    if (!token) {
      throw new AuthenticationError('No token provided')
    }

    // Check if token is blacklisted (logout/refresh rotation)
    const isBlacklisted = await authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new AuthenticationError('Token has been invalidated')
    }

    // Verify token
    const payload = verifyAccessToken(token)

    // Get user from database
    const user = await userRepository.findById(payload.userId)
    if (!user) {
      throw new AuthenticationError('Invalid token')
    }

    // Check if account is active
    if (!user.active) {
      throw new AuthenticationError('Account is suspended')
    }

    // Get seller profile if user is a seller
    let sellerProfile = undefined
    if (user.role === 'SELLER') {
      const profile = await prisma.sellerProfile.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          businessName: true,
          verified: true,
        },
      })
      if (profile) {
        sellerProfile = profile
      }
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      active: user.active,
      sellerProfile,
    }

    next()
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      next(new AuthenticationError('Invalid token'))
    } else if (error.name === 'TokenExpiredError') {
      next(new AuthenticationError('Token expired'))
    } else {
      next(error)
    }
  }
}
// Tries to authenticate but doesn't fail if no token

export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let token: string | undefined

    // Try to get token from cookie first
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken
    } 
    // Fallback to Authorization header
    else {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    if (!token) {
      return next() // No token, continue without user
    }

    try {
      const payload = verifyAccessToken(token)
      const user = await userRepository.findById(payload.userId)

      if (user && user.active) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          active: user.active,
        }
      }
    } catch {
      // Ignore authentication errors for optional auth
    }

    next()
  } catch (error) {
    next(error)
  }
}
