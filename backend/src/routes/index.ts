/**
 * API Routes Index
 * 
 * Aggregates all route modules.
 */

import { Router } from 'express'
import authRoutes from './auth.routes'
import productRoutes from './product.routes'
import categoryRoutes from './category.routes'
import sellerRoutes from './seller.routes'
import searchRoutes from './search.routes'
import cartRoutes from './cart.routes'
import wishlistRoutes from './wishlist.routes'

const router = Router()

// Mount route modules
router.use('/auth', authRoutes)
router.use('/products', productRoutes)
router.use('/categories', categoryRoutes)
router.use('/seller', sellerRoutes)
router.use('/search', searchRoutes)
router.use('/cart', cartRoutes)
router.use('/wishlist', wishlistRoutes)

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
