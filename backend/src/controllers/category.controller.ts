/**
 * Category Controller
 * 
 * Handles category-related HTTP requests.
 */

import { Request, Response, NextFunction } from 'express'
import categoryRepository from '../repositories/category.repository'
import { generateSlug } from '../utils/helpers'
import { sendSuccess } from '../utils/response'
import { CONSTANTS } from '../config/constants'
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/product.validator'
import { NotFoundError, BusinessLogicError } from '../utils/errors'
import logger from '../config/logger'

export class CategoryController {
  /**
   * Get all categories
   * GET /api/v1/categories
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryRepository.findAll()
      sendSuccess(res, { categories })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get category by slug
   * GET /api/v1/categories/:slug
   */
  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryRepository.findBySlug(req.params.slug)
      if (!category) {
        throw new NotFoundError('Category')
      }

      sendSuccess(res, { category })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Create category (admin only)
   * POST /api/v1/categories
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createCategorySchema.parse(req.body)

      // Generate slug
      let slug = generateSlug(data.name)
      let counter = 1
      while (await categoryRepository.slugExists(slug)) {
        slug = `${generateSlug(data.name)}-${counter}`
        counter++
      }

      const category = await categoryRepository.create({
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon,
        order: data.order || 0,
        active: true,
      })

      logger.info('Category created', {
        categoryId: category.id,
        name: category.name,
        userId: req.user!.id,
      })

      sendSuccess(res, { category }, CONSTANTS.HTTP_STATUS.CREATED)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Update category (admin only)
   * PUT /api/v1/categories/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateCategorySchema.parse(req.body)

      // Check if category exists
      const existing = await categoryRepository.findById(req.params.id)
      if (!existing) {
        throw new NotFoundError('Category')
      }

      // If name changed, regenerate slug
      let slug = existing.slug
      if (data.name && data.name !== existing.name) {
        slug = generateSlug(data.name)
        let counter = 1
        while (await categoryRepository.slugExists(slug, req.params.id)) {
          slug = `${generateSlug(data.name)}-${counter}`
          counter++
        }
      }

      const category = await categoryRepository.update(req.params.id, {
        ...(data.name && { name: data.name, slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.order !== undefined && { order: data.order }),
        ...(data.active !== undefined && { active: data.active }),
      })

      logger.info('Category updated', {
        categoryId: category.id,
        userId: req.user!.id,
      })

      sendSuccess(res, { category })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Delete category (admin only)
   * DELETE /api/v1/categories/:id
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check if category exists
      const category = await categoryRepository.findById(req.params.id)
      if (!category) {
        throw new NotFoundError('Category')
      }

      // Check if category has products
      const hasProducts = await categoryRepository.hasProducts(req.params.id)
      if (hasProducts) {
        throw new BusinessLogicError(
          'Cannot delete category with products',
          CONSTANTS.ERROR_CODES.CONFLICT
        )
      }

      await categoryRepository.delete(req.params.id)

      logger.info('Category deleted', {
        categoryId: req.params.id,
        userId: req.user!.id,
      })

      sendSuccess(res, { message: 'Category deleted successfully' })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get all categories (admin)
   * GET /api/v1/admin/categories
   */
  async listAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryRepository.findAllAdmin()
      sendSuccess(res, { categories })
    } catch (error) {
      next(error)
    }
  }
}

export default new CategoryController()
