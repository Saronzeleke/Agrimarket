/**
 * Server Entry Point
 * 
 * Starts the Express server and handles graceful shutdown.
 */

import app from './app'
import config from './config/env'
import logger from './config/logger'
import prisma from './config/database'
import { initRedis, closeRedis } from './config/redis'
import {
  setupUnhandledRejectionHandler,
  setupUncaughtExceptionHandler,
} from './middleware/error.middleware'

// Setup global error handlers
setupUncaughtExceptionHandler()
setupUnhandledRejectionHandler()

// Initialize Redis
try {
  initRedis()
  logger.info('✅ Redis initialized')
} catch (error) {
  logger.warn('⚠️  Redis initialization failed, running without cache', { error })
}

// Start server
const server = app.listen(config.port, () => {
  logger.info(`🚀 Server started successfully`, {
    port: config.port,
    environment: config.nodeEnv,
    apiUrl: config.apiUrl,
    nodeVersion: process.version,
  })

  logger.info(`📚 API documentation available at: ${config.apiUrl}/docs`)
  logger.info(`🏥 Health check endpoint: ${config.apiUrl}/health`)
})

// Graceful shutdown handler
function gracefulShutdown(signal: string): void {
  logger.info(`Received ${signal} signal, starting graceful shutdown...`)

  // Stop accepting new connections
  server.close(async (err) => {
    if (err) {
      logger.error('Error during server shutdown', { error: err.message })
      process.exit(1)
    }

    logger.info('Server closed successfully')

    // Close Redis connections
    try {
      await closeRedis()
      logger.info('Redis connections closed')
    } catch (error: any) {
      logger.error('Error disconnecting from Redis', {
        error: error.message,
      })
    }

    // Close database connections
    try {
      await prisma.$disconnect()
      logger.info('Database connections closed')
    } catch (error: any) {
      logger.error('Error disconnecting from database', {
        error: error.message,
      })
    }

    // Exit process
    logger.info('Graceful shutdown completed')
    process.exit(0)
  })

  // Force shutdown if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout')
    process.exit(1)
  }, 30000) // 30 seconds timeout
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle errors during startup
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${config.port} is already in use`)
  } else {
    logger.error('Server error', { error: error.message })
  }
  process.exit(1)
})

export default server
