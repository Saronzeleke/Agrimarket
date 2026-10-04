/**
 * Auth Controller
 * 
 * Handles authentication-related HTTP requests.
 */

import { Request, Response, NextFunction } from 'express'
import authService from '../services/auth.service'
import { sendSuccess } from '../utils/response'
import { CONSTANTS } from '../config/constants'
import config from '../config/env'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/auth.validator'

export class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = registerSchema.parse(req.body)
      const result = await authService.register(data)

      // Set httpOnly cookies for tokens
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      })

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })

      sendSuccess(
        res,
        {
          user: result.user,
          // Still send tokens in response for backward compatibility during transition
          tokens: result.tokens,
        },
        CONSTANTS.HTTP_STATUS.CREATED
      )
    } catch (error) {
      next(error)
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentials = loginSchema.parse(req.body)
      const result = await authService.login(credentials)

      // Set httpOnly cookies for tokens
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      })

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })

      sendSuccess(res, {
        user: result.user,
        // Still send tokens in response for backward compatibility during transition
        tokens: result.tokens,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Try to get refresh token from cookie first, then from body (fallback)
      let refreshToken = req.cookies.refreshToken
      
      if (!refreshToken) {
        const body = refreshTokenSchema.parse(req.body)
        refreshToken = body.refreshToken
      }

      const tokens = await authService.refreshToken(refreshToken)

      // Set new accessToken cookie
      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 minutes
      })

      // Also update refreshToken cookie if a new one was issued
      if (tokens.refreshToken) {
        res.cookie('refreshToken', tokens.refreshToken, {
          httpOnly: true,
          secure: config.isProduction,
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
      }

      sendSuccess(res, { tokens })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getCurrentUser(req.user!.id)
      sendSuccess(res, { user })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Verify email
   * POST /api/v1/auth/verify-email
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = verifyEmailSchema.parse(req.body)
      await authService.verifyEmail(token)

      sendSuccess(res, {
        message: 'Email verified successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Resend verification email
   * POST /api/v1/auth/resend-verification
   */
  async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = resendVerificationSchema.parse(req.body)
      await authService.resendVerificationEmail(email)

      sendSuccess(res, {
        message: 'Verification email sent',
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Request password reset
   * POST /api/v1/auth/forgot-password
   */
  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = requestPasswordResetSchema.parse(req.body)
      await authService.requestPasswordReset(email)

      sendSuccess(res, {
        message: 'If the email exists, a password reset link has been sent',
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Reset password
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body)
      await authService.resetPassword(token, password)

      sendSuccess(res, {
        message: 'Password reset successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Change password (authenticated)
   * POST /api/v1/auth/change-password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)
      await authService.changePassword(req.user!.id, currentPassword, newPassword)

      sendSuccess(res, {
        message: 'Password changed successfully',
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Logout (client-side token deletion)
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Clear httpOnly cookies
      res.clearCookie('accessToken', {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
      })

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: config.isProduction,
        sameSite: 'strict',
      })

      sendSuccess(res, {
        message: 'Logged out successfully',
      })
    } catch (error) {
      next(error)
    }
  }
}

export default new AuthController()
