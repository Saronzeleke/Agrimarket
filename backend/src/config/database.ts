/**
 * Database Configuration
 * 
 * Initializes and exports Prisma Client instance.
 * Implements connection pooling and query logging in development.
 */

import { Prisma, PrismaClient } from '@prisma/client'
import config from './env'

// Declare global Prisma instance for development hot-reload
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Prisma Client options
const prismaOptions: Prisma.PrismaClientOptions = {
  log: config.dev.logQueries
    ? [
        { emit: 'event', level: 'query' as const },
        { emit: 'event', level: 'error' as const },
        { emit: 'event', level: 'warn' as const },
      ]
    : [{ emit: 'event', level: 'error' as const }],
}

// Initialize Prisma Client
const prisma = global.prisma || new PrismaClient(prismaOptions)

if (config.isDevelopment) {
  global.prisma = prisma
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma
