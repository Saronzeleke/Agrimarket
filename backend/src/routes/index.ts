/**
 * API Routes Index
 * 
 * Aggregates all route modules.
 */

import { Router } from 'express'
import authRoutes from './auth.routes'

const router = Router()

// Mount route modules
router.use('/auth', authRoutes)

// Health check for API
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  })
})

export default router
