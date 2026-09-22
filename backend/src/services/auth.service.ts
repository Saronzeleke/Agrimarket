/**
 * Authentication Service
 * Handles user registration, login, email verification, and password reset.
 */
import userRepository from '../repositories/user.repository'
import emailVerificationRepository from '../repositories/email-verification.repository'
import passwordResetRepository from '../repositories/password-reset.repository'
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/password.utils'
import { generateTokens, verifyRefreshToken } from '../utils/jwt.utils'
import { generateToken, hashToken, addHours, isExpired } from '../utils/helpers'
import { RegisterData, LoginCredentials, AuthTokens } from '../types'
import {
  ValidationError,
  InvalidCredentialsError,
  EmailNotVerifiedError,
  AccountSuspendedError,
  ConflictError,
  NotFoundError,
  BusinessLogicError,
} from '../utils/errors'
import { CONSTANTS } from '../config/constants'
import { User } from '@prisma/client'
import emailProvider from '../providers/email/MockEmailProvider'
import config from '../config/env'
import logger from '../config/logger'

export class AuthService {
  // Register a new user
  async register(data: RegisterData): Promise<{ user: Omit<User, 'password'>; tokens: AuthTokens }> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(data.password)
    if (!passwordValidation.valid) {
      throw new ValidationError('Weak password', passwordValidation.errors)
    }

    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new ConflictError('Email already registered')
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password)

    // Create user
    const user = await userRepository.create({
      ...data,
      password: hashedPassword,
    })

    // Generate email verification token
    if (config.features.emailVerification) {
      const verificationToken = generateToken()
      const hashedVerificationToken = hashToken(verificationToken)
      const expiresAt = addHours(new Date(), CONSTANTS.EMAIL_VERIFICATION_EXPIRY_HOURS)

      await emailVerificationRepository.create(
        user.id,
        hashedVerificationToken,
        expiresAt
      )

      // Send verification email
      await emailProvider.sendVerificationEmail(user.email, verificationToken)

      logger.info('User registered, verification email sent', {
        userId: user.id,
        email: user.email,
      })
    } else {
      // Auto-verify if email verification is disabled
      await userRepository.verifyEmail(user.id)
      logger.info('User registered and auto-verified', {
        userId: user.id,
        email: user.email,
      })
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      tokens,
    }
  }

  // Login user
 
  async login(credentials: LoginCredentials): Promise<{ user: Omit<User, 'password'>; tokens: AuthTokens }> {
    // Find user by email
    const user = await userRepository.findByEmail(credentials.email)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password)
    if (!isValidPassword) {
      throw new InvalidCredentialsError()
    }

    // Check if email is verified
    if (config.features.emailVerification && !user.emailVerified) {
      throw new EmailNotVerifiedError()
    }

    // Check if account is active
    if (!user.active) {
      throw new AccountSuspendedError()
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    logger.info('User logged in', {
      userId: user.id,
      email: user.email,
    })

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      tokens,
    }
  }
   // Refresh access token
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken)

      // Get user
      const user = await userRepository.findById(payload.userId)
      if (!user) {
        throw new InvalidCredentialsError()
      }

      // Check if account is active
      if (!user.active) {
        throw new AccountSuspendedError()
      }

      // Generate new tokens
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      logger.info('Token refreshed', {
        userId: user.id,
      })

      return tokens
    } catch (error) {
      throw new InvalidCredentialsError()
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    const hashedToken = hashToken(token)

    // Find verification record
    const verification = await emailVerificationRepository.findByToken(hashedToken)
    if (!verification) {
      throw new NotFoundError('Verification token')
    }

    // Check if expired
    if (isExpired(verification.expiresAt)) {
      await emailVerificationRepository.delete(verification.id)
      throw new BusinessLogicError(
        'Verification token has expired',
        CONSTANTS.ERROR_CODES.TOKEN_EXPIRED
      )
    }

    // Get user
    const user = await userRepository.findById(verification.userId)
    if (!user) {
      throw new NotFoundError('User')
    }

    // Verify email
    await userRepository.verifyEmail(user.id)

    // Delete verification token
    await emailVerificationRepository.delete(verification.id)

    // Send welcome email
    await emailProvider.sendWelcomeEmail(user.email, user.firstName)

    logger.info('Email verified', {
      userId: user.id,
      email: user.email,
    })
  }

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<void> {
    // Find user
    const user = await userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundError('User')
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BusinessLogicError(
        'Email is already verified',
        CONSTANTS.ERROR_CODES.INVALID_INPUT
      )
    }

    // Delete existing tokens
    await emailVerificationRepository.deleteByUserId(user.id)

    // Generate new token
    const verificationToken = generateToken()
    const hashedVerificationToken = hashToken(verificationToken)
    const expiresAt = addHours(new Date(), CONSTANTS.EMAIL_VERIFICATION_EXPIRY_HOURS)

    await emailVerificationRepository.create(
      user.id,
      hashedVerificationToken,
      expiresAt
    )

    // Send verification email
    await emailProvider.sendVerificationEmail(user.email, verificationToken)

    logger.info('Verification email resent', {
      userId: user.id,
      email: user.email,
    })
  }

  // Request password reset
  
  async requestPasswordReset(email: string): Promise<void> {
    // Find user
    const user = await userRepository.findByEmail(email)
    
    // Don't reveal if email exists (security)
    if (!user) {
      logger.warn('Password reset requested for non-existent email', { email })
      return // Silently succeed
    }

    // Delete existing tokens
    await passwordResetRepository.deleteByUserId(user.id)

    // Generate reset token
    const resetToken = generateToken()
    const hashedResetToken = hashToken(resetToken)
    const expiresAt = addHours(new Date(), CONSTANTS.PASSWORD_RESET_EXPIRY_HOURS)

    await passwordResetRepository.create(user.id, hashedResetToken, expiresAt)

    // Send reset email
    await emailProvider.sendPasswordResetEmail(user.email, resetToken)

    logger.info('Password reset requested', {
      userId: user.id,
      email: user.email,
    })
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.valid) {
      throw new ValidationError('Weak password', passwordValidation.errors)
    }

    const hashedToken = hashToken(token)

    // Find reset record
    const reset = await passwordResetRepository.findByToken(hashedToken)
    if (!reset) {
      throw new NotFoundError('Reset token')
    }

    // Check if expired
    if (isExpired(reset.expiresAt)) {
      await passwordResetRepository.delete(reset.id)
      throw new BusinessLogicError(
        'Reset token has expired',
        CONSTANTS.ERROR_CODES.TOKEN_EXPIRED
      )
    }

    // Check if already used
    if (reset.used) {
      throw new BusinessLogicError(
        'Reset token has already been used',
        CONSTANTS.ERROR_CODES.TOKEN_INVALID
      )
    }

    // Get user
    const user = await userRepository.findById(reset.userId)
    if (!user) {
      throw new NotFoundError('User')
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await userRepository.updatePassword(user.id, hashedPassword)

    // Mark token as used
    await passwordResetRepository.markAsUsed(reset.id)

    logger.info('Password reset successfully', {
      userId: user.id,
      email: user.email,
    })
  }

  // Change password (authenticated user)
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword)
    if (!passwordValidation.valid) {
      throw new ValidationError('Weak password', passwordValidation.errors)
    }

    // Get user
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User')
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password)
    if (!isValidPassword) {
      throw new BusinessLogicError(
        'Current password is incorrect',
        CONSTANTS.ERROR_CODES.INVALID_CREDENTIALS
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword)

    // Update password
    await userRepository.updatePassword(user.id, hashedPassword)

    logger.info('Password changed', {
      userId: user.id,
    })
  }

  // Get current user
  async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('User')
    }

    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}

export default new AuthService()
