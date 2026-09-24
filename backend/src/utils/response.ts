/**
 * API Response Utilities
 * Standardized response formatting for API endpoints.
 * Ensures consistent response structure across all endpoints.
 */

import { Response } from 'express'
import { CONSTANTS } from '../config/constants'

interface SuccessResponse<T> {
  success: true
  data: T
  pagination?: PaginationMeta
}

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

// Send success response
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = CONSTANTS.HTTP_STATUS.OK
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  }

  return res.status(statusCode).json(response)
}

// Alias for sendSuccess (for backward compatibility)
export const successResponse = sendSuccess

// Send success response with pagination
export function sendSuccessWithPagination<T>(
  res: Response,
  data: T,
  pagination: PaginationMeta,
  statusCode: number = CONSTANTS.HTTP_STATUS.OK
): Response {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    pagination,
  }

  return res.status(statusCode).json(response)
}

// Send error response
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = CONSTANTS.HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: any
): Response {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  }

  return res.status(statusCode).json(response)
}

// Send validation error response
export function sendValidationError(
  res: Response,
  errors: any[]
): Response {
  return sendError(
    res,
    CONSTANTS.ERROR_CODES.VALIDATION_ERROR,
    'Validation failed',
    CONSTANTS.HTTP_STATUS.BAD_REQUEST,
    { errors }
  )
}

// Send not found response
export function sendNotFound(
  res: Response,
  resource: string = 'Resource'
): Response {
  return sendError(
    res,
    CONSTANTS.ERROR_CODES.NOT_FOUND,
    `${resource} not found`,
    CONSTANTS.HTTP_STATUS.NOT_FOUND
  )
}

// Send unauthorized response
export function sendUnauthorized(
  res: Response,
  message: string = 'Authentication required'
): Response {
  return sendError(
    res,
    CONSTANTS.ERROR_CODES.UNAUTHORIZED,
    message,
    CONSTANTS.HTTP_STATUS.UNAUTHORIZED
  )
}

// Send forbidden response
export function sendForbidden(
  res: Response,
  message: string = 'Insufficient permissions'
): Response {
  return sendError(
    res,
    CONSTANTS.ERROR_CODES.FORBIDDEN,
    message,
    CONSTANTS.HTTP_STATUS.FORBIDDEN
  )
}

// Calculate pagination metadata
export function calculatePagination(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const pages = Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  }
}

// Parse pagination parameters from query
export function parsePaginationParams(query: any): {
  page: number
  limit: number
  skip: number
} {
  const page = Math.max(
    1,
    parseInt(query.page as string) || CONSTANTS.DEFAULT_PAGE
  )
  const limit = Math.min(
    CONSTANTS.MAX_LIMIT,
    Math.max(1, parseInt(query.limit as string) || CONSTANTS.DEFAULT_LIMIT)
  )
  const skip = (page - 1) * limit

  return { page, limit, skip }
}
