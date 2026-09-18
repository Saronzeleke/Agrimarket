/**
 * Password Utilities
 * 
 * Bcrypt-based password hashing and verification.
 */

import bcrypt from 'bcrypt'
import config from '../config/env'
import { CONSTANTS } from '../config/constants'

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, config.bcrypt.saltRounds)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < CONSTANTS.PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${CONSTANTS.PASSWORD_MIN_LENGTH} characters`)
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
