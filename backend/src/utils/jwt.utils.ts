/**
 * JWT Utilities
 * 
 * Token generation and verification using jsonwebtoken.
 */

import jwt from 'jsonwebtoken'
import config from '../config/env'
import { TokenPayload, AuthTokens } from '../types'
import { Role } from '@prisma/client'

/**
 * Generate access token
 */
export function generateAccessToken(payload: {
  userId: string
  email: string
  role: Role
}): string {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  })
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(payload: {
  userId: string
  email: string
  role: Role
}): string {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  })
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokens(payload: {
  userId: string
  email: string
  role: Role
}): AuthTokens {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  }
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.accessSecret) as TokenPayload
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload
}

/**
 * Decode token without verification (for inspection)
 */
export function decodeToken(token: string): TokenPayload | null {
  return jwt.decode(token) as TokenPayload | null
}
