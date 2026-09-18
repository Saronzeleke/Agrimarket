/**
 * Helper Utilities
 * 
 * Common utility functions used throughout the application.
 */

import crypto from 'crypto'

/**
 * Generate a slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

/**
 * Generate a unique order number
 * Format: AGM-YYYYMMDD-XXXXX
 */
export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0')

  return `AGM-${year}${month}${day}-${random}`
}

/**
 * Generate a random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Hash a token using SHA256
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Format currency (Ethiopian Birr)
 */
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} ETB`
}

/**
 * Calculate delivery fee based on location
 * (Simplified implementation - can be enhanced based on actual distance)
 */
export function calculateDeliveryFee(region: string): number {
  const BASE_FEE = 50 // ETB

  // Simple region-based pricing
  const regionFees: Record<string, number> = {
    'Addis Ababa': BASE_FEE,
    Oromia: BASE_FEE + 20,
    Amhara: BASE_FEE + 30,
    Tigray: BASE_FEE + 40,
    SNNPR: BASE_FEE + 30,
    Somali: BASE_FEE + 50,
    'Benishangul-Gumuz': BASE_FEE + 40,
    Gambela: BASE_FEE + 50,
    Harari: BASE_FEE + 30,
    Afar: BASE_FEE + 50,
    'Dire Dawa': BASE_FEE + 30,
    Sidama: BASE_FEE + 30,
  }

  return regionFees[region] || BASE_FEE + 30
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  const ext = filename.split('.').pop()
  const name = filename.replace(/\.[^/.]+$/, '') // Remove extension
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)

  return `${sanitized}-${timestamp}-${random}.${ext}`
}

/**
 * Parse sort parameter
 * Format: field:order (e.g., "price:asc", "createdAt:desc")
 */
export function parseSort(sortParam?: string): {
  field: string
  order: 'asc' | 'desc'
} | null {
  if (!sortParam) return null

  const [field, order] = sortParam.split(':')

  if (!field) return null

  return {
    field,
    order: (order?.toLowerCase() === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc',
  }
}

/**
 * Check if date is within a specified number of days
 */
export function isWithinDays(date: Date, days: number): boolean {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const daysDiff = diff / (1000 * 60 * 60 * 24)

  return daysDiff <= days
}

/**
 * Check if date has expired
 */
export function isExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate
}

/**
 * Add hours to a date
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Mask sensitive data for logging
 */
export function maskEmail(email: string): string {
  const [username, domain] = email.split('@')
  if (!username || !domain) return '***'

  const masked =
    username.length > 3
      ? `${username.substring(0, 2)}***${username.slice(-1)}`
      : '***'

  return `${masked}@${domain}`
}

/**
 * Mask phone number
 */
export function maskPhone(phone: string): string {
  if (phone.length < 4) return '***'
  return `***${phone.slice(-4)}`
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Omit keys from an object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}

/**
 * Pick keys from an object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Check if value is empty
 */
export function isEmpty(
  value: any
): value is null | undefined | '' | [] | {} {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/**
 * Sleep/delay execution
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry async operation
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (attempt < maxAttempts) {
        await sleep(delay * attempt) // Exponential backoff
      }
    }
  }

  throw lastError!
}
