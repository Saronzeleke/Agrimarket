/**
 * Error Handling Middleware
 * 
 * Global error handler for Express application.
 * Catches and formats all errors consistently.
 */

import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/errors'
import { CONSTANTS } from '../config/constants'
import { sendError } from '../utils/response'
import logger from '../config/logger'
import config from '../config/env'
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

/**
 * Handle Prisma errors
 */
function handlePrismaError(error: any): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === 'P2002') {
      const field = (error.meta?.target as string[])?.join(', ') || 'field'
      return new AppError(
        `A record with this ${field} already exists`,
        CONSTANTS.HTTP_STATUS.CONFLICT,
        CONSTANTS.ERROR_CODES.ALREADY_EXISTS
      )
    }

    // Foreign key constraint violation
    if (error.code === 'P2003') {
      return new AppError(
        'Referenced record does not exist',
        CONSTANTS.HTTP_STATUS.BAD_REQUEST,
        CONSTANTS.ERROR_CODES.INVALID_INPUT
      )
    }

    // Record not found
    if (error.code === 'P2025') {
      return new AppError(
        'Record not found',
        CONSTANTS.HTTP_STATUS.NOT_FOUND,
        CONSTANTS.ERROR_CODES.NOT_FOUND
      )
    }
  }

  // Generic database error
  return new AppError(
    'Database operation failed',
    CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
    CONSTANTS.ERROR_CODES.DATABASE_ERROR
  )
}

/**
 * Handle Zod validation errors
 */
function handleZodError(error: ZodError): AppError {
  const errors = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }))

  return new AppError(
    'Validation failed',
    CONSTANTS.HTTP_STATUS.BAD_REQUEST,
    CONSTANTS.ERROR_CODES.VALIDATION_ERROR,
    true,
    { errors }
  )
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  let appError: AppError

  // Convert known error types to AppError
  if (error instanceof AppError) {
    appError = error
  } else if (error instanceof ZodError) {
    appError = handleZodError(error)
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    appError = handlePrismaError(error)
  } else {
    // Unknown error
    appError = new AppError(
      config.dev.detailedErrors
        ? error.message
        : 'An unexpected error occurred',
      CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
      CONSTANTS.ERROR_CODES.INTERNAL_ERROR,
      false
    )
  }

  // Log error
  if (!appError.isOperational) {
    logger.error('Unexpected Error', {
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    })
  } else {
    logger.warn('Operational Error', {
      code: appError.code,
      message: appError.message,
      path: req.path,
      method: req.method,
    })
  }

  // Send error response
  sendError(
    res,
    appError.code,
    appError.message,
    appError.statusCode,
    config.dev.detailedErrors ? appError.details : undefined
  )
}

/**
 * Handle 404 errors
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    CONSTANTS.HTTP_STATUS.NOT_FOUND,
    CONSTANTS.ERROR_CODES.NOT_FOUND
  )

  next(error)
}

/**
 * Handle unhandled promise rejections
 */
export function setupUnhandledRejectionHandler(): void {
  process.on('unhandledRejection', (reason: any) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
    })

    // Exit process with failure
    process.exit(1)
  })
}

/**
 * Handle uncaught exceptions
 */
export function setupUncaughtExceptionHandler(): void {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      error: error.message,
      stack: error.stack,
    })

    // Exit process with failure
    process.exit(1)
  })
}
