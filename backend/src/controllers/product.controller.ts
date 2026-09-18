/**
 * Product Controller
 * 
 * Handles product-related HTTP requests.
 */

import { Request, Response, NextFunction } from 'express'
import productService from '../services/product.service'
import { sendSuccess, sendSuccessWithPagination, calculatePagination, parsePaginationParams } from '../utils/response'
import { CONSTANTS } from '../config/constants'
import {
  createProductSchema,
  updateProductSchema,
  productFiltersSchema,
} from '../validators/product.validator'

export class ProductController {
  /**
   * Get all products with filters
   * GET /api/v1/products
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters = productFiltersSchema.parse(req.query)
      const pagination = parsePaginationParams(req.query)

      const { products, total } = await productService.list(filters, pagination)
      const paginationMeta = calculatePagination(
        pagination.page,
        pagination.limit,
        total
      )

      sendSuccessWithPagination(res, products, paginationMeta)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get product by ID
   * GET /api/v1/products/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getById(
        req.params.id,
        req.user?.id
      )
      sendSuccess(res, { product })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get product by slug
   * GET /api/v1/products/slug/:slug
   */
  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getBySlug(req.params.slug)
      sendSuccess(res, { product })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Create product (seller only)
   * POST /api/v1/products
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createProductSchema.parse(req.body)
      
      const product = await productService.create(
        {
          ...data,
          sellerId: req.user!.id,
          harvestDate: data.harvestDate ? new Date(data.harvestDate) : undefined,
        },
        req.user!.id,
        req.user!.role
      )

      sendSuccess(res, { product }, CONSTANTS.HTTP_STATUS.CREATED)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Update product
   * PUT /api/v1/products/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateProductSchema.parse(req.body)
      
      const product = await productService.update(
        req.params.id,
        {
          ...data,
          harvestDate: data.harvestDate ? new Date(data.harvestDate) : undefined,
        },
        req.user!.id,
        req.user!.role
      )

      sendSuccess(res, { product })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Delete product
   * DELETE /api/v1/products/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await productService.delete(
        req.params.id,
        req.user!.id,
        req.user!.role
      )

      sendSuccess(res, { message: 'Product deleted successfully' })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Toggle product active status
   * PATCH /api/v1/products/:id/toggle-active
   */
  async toggleActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.toggleActive(
        req.params.id,
        req.user!.id,
        req.user!.role
      )

      sendSuccess(res, { product })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get related products
   * GET /api/v1/products/:id/related
   */
  async getRelated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6
      const products = await productService.getRelatedProducts(
        req.params.id,
        limit
      )

      sendSuccess(res, { products })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get seller's products
   * GET /api/v1/seller/products
   */
  async getSellerProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pagination = parsePaginationParams(req.query)
      const { products, total } = await productService.getSellerProducts(
        req.user!.id,
        pagination
      )
      const paginationMeta = calculatePagination(
        pagination.page,
        pagination.limit,
        total
      )

      sendSuccessWithPagination(res, products, paginationMeta)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get seller's low stock products
   * GET /api/v1/seller/products/low-stock
   */
  async getLowStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getSellerLowStock(req.user!.id)
      sendSuccess(res, { products })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get seller product statistics
   * GET /api/v1/seller/products/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await productService.getSellerStats(req.user!.id)
      sendSuccess(res, { stats })
    } catch (error) {
      next(error)
    }
  }
}

export default new ProductController()
