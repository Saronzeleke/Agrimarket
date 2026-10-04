/**
 * Authentication Service
 * Handles user registration, login, email verification, and password reset.
 */
import userRepository from '../repositories/user.repository'
import emailVerificationRepository from '../repositories/email-verification.repository'
import passwordResetRepository from '../repositories/password-reset.repository'
import auditLogRepository from '../repositories/audit-log.repository'
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
import emailProvider from '../providers/email'
import config from '../config/env'
import logger from '../config/logger'
import { getRedisClient } from '../config/redis'

// In-memory fallback for failed login attempts (used if Redis is unavailable)
const failedLoginAttemptsMemory = new Map<string, { count: number; expiresAt: Date }>();

export class AuthService {
  /**
   * Track failed login attempt
   * Uses Redis if available, otherwise falls back to in-memory store
   */
  private async trackFailedLogin(email: string): Promise<number> {
    const redis = getRedisClient();
    const key = `failed_login:${email}`;
    const lockoutWindow = 15 * 60; // 15 minutes in seconds

    if (redis) {
      try {
        const attempts = await redis.incr(key);
        if (attempts === 1) {
          // Set expiry on first attempt
          await redis.expire(key, lockoutWindow);
        }
        return attempts;
      } catch (error) {
        logger.warn('Redis failed, using in-memory store for failed login tracking', { error });
      }
    }

    // Fallback to in-memory
    const now = new Date();
    const record = failedLoginAttemptsMemory.get(email);
    
    if (record && record.expiresAt > now) {
      record.count++;
      return record.count;
    } else {
      const expiresAt = new Date(now.getTime() + lockoutWindow * 1000);
      failedLoginAttemptsMemory.set(email, { count: 1, expiresAt });
      return 1;
    }
  }

  /**
   * Get failed login attempt count
   */
  private async getFailedLoginCount(email: string): Promise<number> {
    const redis = getRedisClient();
    const key = `failed_login:${email}`;

    if (redis) {
      try {
        const attempts = await redis.get(key);
        return attempts ? parseInt(attempts, 10) : 0;
      } catch (error) {
        logger.warn('Redis failed, using in-memory store', { error });
      }
    }

    // Fallback to in-memory
    const record = failedLoginAttemptsMemory.get(email);
    if (record && record.expiresAt > new Date()) {
      return record.count;
    }
    return 0;
  }

  /**
   * Reset failed login attempts (on successful login)
   */
  private async resetFailedLoginAttempts(email: string): Promise<void> {
    const redis = getRedisClient();
    const key = `failed_login:${email}`;

    if (redis) {
      try {
        await redis.del(key);
      } catch (error) {
        logger.warn('Redis delete failed', { error });
      }
    }

    // Also clear from in-memory
    failedLoginAttemptsMemory.delete(email);
  }

  /**
   * Add token to blacklist (for logout and refresh token rotation)
   */
  private async blacklistToken(token: string, expirySeconds: number): Promise<void> {
    const redis = getRedisClient();
    const key = `blacklisted_token:${hashToken(token)}`;

    if (redis) {
      try {
        await redis.setex(key, expirySeconds, '1');
        logger.debug('Token blacklisted', { tokenHash: hashToken(token).substring(0, 10) });
      } catch (error) {
        logger.error('Failed to blacklist token in Redis', { error });
        // Note: Without Redis, token blacklisting won't work across server restarts
        // In production, Redis should be required for this feature
      }
    } else {
      logger.warn('Redis not available, token blacklisting disabled');
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const redis = getRedisClient();
    const key = `blacklisted_token:${hashToken(token)}`;

    if (redis) {
      try {
        const result = await redis.get(key);
        return result === '1';
      } catch (error) {
        logger.error('Failed to check token blacklist', { error });
        return false; // Fail open rather than blocking legitimate users
      }
    }
    return false;
  }

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
 
  async login(credentials: LoginCredentials, ipAddress?: string, userAgent?: string): Promise<{ user: Omit<User, 'password'>; tokens: AuthTokens }> {
    // Find user by email
    const user = await userRepository.findByEmail(credentials.email)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    // Check if account is locked due to failed attempts
    const failedAttempts = await this.getFailedLoginCount(credentials.email);
    if (failedAttempts >= 5) {
      logger.warn('Account locked due to too many failed login attempts', {
        email: credentials.email,
        attempts: failedAttempts,
      });
      throw new BusinessLogicError(
        'Account temporarily locked due to too many failed login attempts. Please try again in 15 minutes.',
        CONSTANTS.ERROR_CODES.ACCOUNT_LOCKED
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password)
    if (!isValidPassword) {
      // Track failed attempt
      const attempts = await this.trackFailedLogin(credentials.email);
      logger.warn('Failed login attempt', {
        email: credentials.email,
        attempts,
      });
      throw new InvalidCredentialsError()
    }

    // Reset failed attempts on successful login
    await this.resetFailedLoginAttempts(credentials.email);

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

    // Audit log: USER_LOGIN
    await auditLogRepository.logUserAction(
      user.id,
      'USER_LOGIN',
      'USER',
      user.id,
      { email: user.email },
      ipAddress,
      userAgent
    );

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
      // Check if refresh token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        logger.warn('Attempt to use blacklisted refresh token');
        throw new InvalidCredentialsError();
      }

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

      // Invalidate the old refresh token (rotation)
      // Calculate remaining TTL from token expiry (7 days default)
      const refreshTokenTTL = 7 * 24 * 60 * 60; // 7 days in seconds
      await this.blacklistToken(refreshToken, refreshTokenTTL);

      // Generate new tokens (including a new refresh token)
      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      })

      logger.info('Token refreshed with rotation', {
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
  async resetPassword(token: string, newPassword: string, ipAddress?: string, userAgent?: string): Promise<void> {
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

    // Audit log: PASSWORD_RESET
    await auditLogRepository.logUserAction(
      user.id,
      'PASSWORD_RESET',
      'USER',
      user.id,
      { email: user.email },
      ipAddress,
      userAgent
    );

    logger.info('Password reset successfully', {
      userId: user.id,
      email: user.email,
    })
  }

  // Change password (authenticated user)
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    ipAddress?: string,
    userAgent?: string
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

    // Audit log: PASSWORD_CHANGED
    await auditLogRepository.logUserAction(
      userId,
      'PASSWORD_CHANGED',
      'USER',
      userId,
      { email: user.email },
      ipAddress,
      userAgent
    );

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

  /**
   * Logout user and blacklist their tokens
   */
  async logout(userId: string, accessToken: string, ipAddress?: string, userAgent?: string): Promise<void> {
    // Blacklist the access token
    // Access tokens expire in 15 minutes by default
    const accessTokenTTL = 15 * 60; // 15 minutes in seconds
    await this.blacklistToken(accessToken, accessTokenTTL);

    // Audit log: USER_LOGOUT
    await auditLogRepository.logUserAction(
      userId,
      'USER_LOGOUT',
      'USER',
      userId,
      null,
      ipAddress,
      userAgent
    );

    logger.info('User logged out, token blacklisted', {
      userId,
    });
  }
}

export default new AuthService()
