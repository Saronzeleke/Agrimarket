/**
 * Database Configuration
 * 
 * Initializes and exports Prisma Client instance.
 * Implements connection pooling and query logging in development.
 */

import { PrismaClient } from '@prisma/client'
import config from './env'
import logger from './logger'

// Declare global Prisma instance for development hot-reload
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Prisma Client options
const prismaOptions = {
  log: config.dev.logQueries
    ? [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ]
    : [{ emit: 'event', level: 'error' }],
} as const

// Initialize Prisma Client
const prisma = global.prisma || new PrismaClient(prismaOptions as any)

if (config.isDevelopment) {
  global.prisma = prisma
}

// Log database queries in development
if (config.dev.logQueries) {
  prisma.$on('query' as any, (e: any) => {
    logger.debug('Database Query', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    })
  })
}

// Log database errors
prisma.$on('error' as any, (e: any) => {
  logger.error('Database Error', {
    message: e.message,
    target: e.target,
  })
})

// Log database warnings
prisma.$on('warn' as any, (e: any) => {
  logger.warn('Database Warning', {
    message: e.message,
  })
})

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
  logger.info('Database connection closed')
})

export default prisma
