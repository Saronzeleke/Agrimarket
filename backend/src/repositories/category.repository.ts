/**
 * Category Repository
 * 
 * Database operations for Category entity.
 */

import prisma from '../config/database'
import { Category, Prisma } from '@prisma/client'

export class CategoryRepository {
  /**
   * Find category by ID
   */
  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    })
  }

  /**
   * Find category by slug
   */
  async findBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            products: {
              where: { active: true },
            },
          },
        },
      },
    })
  }

  /**
   * Find all active categories
   */
  async findAll() {
    return prisma.category.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            products: {
              where: { active: true },
            },
          },
        },
      },
    })
  }

  /**
   * Find all categories (admin)
   */
  async findAllAdmin() {
    return prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })
  }

  /**
   * Create category
   */
  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({
      data,
    })
  }

  /**
   * Update category
   */
  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    })
  }

  /**
   * Delete category
   */
  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    })
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.category.count({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    })
    return count > 0
  }

  /**
   * Check if category has products
   */
  async hasProducts(id: string): Promise<boolean> {
    const count = await prisma.product.count({
      where: { categoryId: id },
    })
    return count > 0
  }
}

export default new CategoryRepository()
