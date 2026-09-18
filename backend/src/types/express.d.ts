/**
 * Express Type Extensions
 * 
 * Extends Express Request type to include custom properties.
 */

import { User as PrismaUser } from '@prisma/client'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: 'CUSTOMER' | 'SELLER' | 'ADMIN'
        emailVerified: boolean
        active: boolean
      }
      
      file?: Express.Multer.File
      files?: Express.Multer.File[]
    }
  }
}

export {}
