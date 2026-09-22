// Auth Validation Schemas
 

import { z } from 'zod'
import { CONSTANTS } from '../config/constants'

// Register schema
 
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${CONSTANTS.PASSWORD_MIN_LENGTH} characters`)
    .regex(
      CONSTANTS.PASSWORD_REGEX,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  phone: z.string().optional(),
})

// Login schema
 
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Refresh token schema
 
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// Verify email schema
 
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

// Resend verification email schema
 
export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Request password reset schema
 
export const requestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Reset password schema
 
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z
    .string()
    .min(CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${CONSTANTS.PASSWORD_MIN_LENGTH} characters`)
    .regex(
      CONSTANTS.PASSWORD_REGEX,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
})

// Change password schema
 
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(CONSTANTS.PASSWORD_MIN_LENGTH, `Password must be at least ${CONSTANTS.PASSWORD_MIN_LENGTH} characters`)
    .regex(
      CONSTANTS.PASSWORD_REGEX,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
})
