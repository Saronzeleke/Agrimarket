/**
 * Custom Error Classes
 * Provides specific error types for different error scenarios.
 * All errors extend AppError for consistent handling.
 */

import { CONSTANTS } from '../config/constants'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean
  public readonly details?: any

  constructor(
    message: string,
    statusCode: number = CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = CONSTANTS.ERROR_CODES.INTERNAL_ERROR,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    this.details = details

    // Maintains proper stack trace for where error was thrown (V8 only)
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      CONSTANTS.HTTP_STATUS.BAD_REQUEST,
      CONSTANTS.ERROR_CODES.VALIDATION_ERROR,
      true,
      details
    )
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      CONSTANTS.HTTP_STATUS.BAD_REQUEST,
      CONSTANTS.ERROR_CODES.INVALID_INPUT,
      true,
      details
    )
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(
      message,
      CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
      CONSTANTS.ERROR_CODES.UNAUTHORIZED,
      true
    )
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(
      message,
      CONSTANTS.HTTP_STATUS.FORBIDDEN,
      CONSTANTS.ERROR_CODES.FORBIDDEN,
      true
    )
  }
}

export class ForbiddenError extends AuthorizationError {}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(
      `${resource} not found`,
      CONSTANTS.HTTP_STATUS.NOT_FOUND,
      CONSTANTS.ERROR_CODES.NOT_FOUND,
      true
    )
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(
      message,
      CONSTANTS.HTTP_STATUS.CONFLICT,
      CONSTANTS.ERROR_CODES.ALREADY_EXISTS,
      true
    )
  }
}

export class BusinessLogicError extends AppError {
  constructor(message: string, code: string, details?: any) {
    super(
      message,
      CONSTANTS.HTTP_STATUS.UNPROCESSABLE_ENTITY,
      code,
      true,
      details
    )
  }
}

export class InsufficientStockError extends BusinessLogicError {
  constructor(productName: string, available: number) {
    super(
      `Insufficient stock for ${productName}. Only ${available} units available.`,
      CONSTANTS.ERROR_CODES.INSUFFICIENT_STOCK,
      { productName, available }
    )
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(
      'Invalid email or password',
      CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
      CONSTANTS.ERROR_CODES.INVALID_CREDENTIALS,
      true
    )
  }
}

export class EmailNotVerifiedError extends AppError {
  constructor() {
    super(
      'Email not verified. Please verify your email before logging in.',
      CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
      CONSTANTS.ERROR_CODES.EMAIL_NOT_VERIFIED,
      true
    )
  }
}

export class AccountSuspendedError extends AppError {
  constructor() {
    super(
      'Account has been suspended. Please contact support.',
      CONSTANTS.HTTP_STATUS.FORBIDDEN,
      CONSTANTS.ERROR_CODES.ACCOUNT_SUSPENDED,
      true
    )
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(
      message,
      CONSTANTS.HTTP_STATUS.TOO_MANY_REQUESTS,
      CONSTANTS.ERROR_CODES.RATE_LIMIT_EXCEEDED,
      true
    )
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
      CONSTANTS.ERROR_CODES.DATABASE_ERROR,
      false,
      details
    )
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service error: ${service}`,
      CONSTANTS.HTTP_STATUS.SERVICE_UNAVAILABLE,
      CONSTANTS.ERROR_CODES.EXTERNAL_SERVICE_ERROR,
      true,
      { service }
    )
  }
}
