// Database operations for Product entity.

import prisma from '../config/database'
import { Product, Prisma } from '@prisma/client'
import { ProductFilters, PaginationParams } from '../types'

export class ProductRepository {
 //Find product by ID
  
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            businessName: true,
            rating: true,
            location: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        variants: {
          where: { active: true },
        },
        inventory: true,
      },
    })
  }
// Find product by slug
 
  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        seller: {
          select: {
            id: true,
            businessName: true,
            rating: true,
            reviewCount: true,
            location: true,
            verified: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { order: 'asc' },
        },
        variants: {
          where: { active: true },
        },
        inventory: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })
  }
// Find all products with filters and pagination

  async findMany(filters: ProductFilters, pagination: PaginationParams) {
    const where: Prisma.ProductWhereInput = {
      active: true,
    }

    // Category filter
    if (filters.categoryId) {
      where.categoryId = filters.categoryId
    }

    // Seller filter
    if (filters.sellerId) {
      where.sellerId = filters.sellerId
    }

    // Price range filter
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {}
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice
      }
    }

    // Location filter
    if (filters.location) {
      where.productionLocation = {
        contains: filters.location,
        mode: 'insensitive',
      }
    }

    // Rating filter
    if (filters.rating) {
      where.rating = {
        gte: filters.rating,
      }
    }

    // In stock filter
    if (filters.inStock) {
      where.inventory = {
        currentStock: {
          gt: 0,
        },
      }
    }

    // Search filter
    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          seller: {
            select: {
              businessName: true,
              rating: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
          images: {
            take: 1,
            orderBy: { order: 'asc' },
          },
          inventory: {
            select: {
              currentStock: true,
              reservedStock: true,
            },
          },
        },
        orderBy: this.buildOrderBy(filters),
      }),
      prisma.product.count({ where }),
    ])

    return { products, total }
  }
// Build order by clause
  
  private buildOrderBy(filters: ProductFilters): Prisma.ProductOrderByWithRelationInput[] {
    // Default: newest first
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = []

    // Sort options
    if (filters.search) {
      // Relevance (can be enhanced with full-text search)
      orderBy.push({ rating: 'desc' })
      orderBy.push({ orderCount: 'desc' })
    } else {
      orderBy.push({ createdAt: 'desc' })
    }

    return orderBy
  }
// Create product
  
  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({
      data,
      include: {
        images: true,
        variants: true,
      },
    })
  }
// Update product
  
  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        images: true,
        variants: true,
        inventory: true,
      },
    })
  }
// Delete product
  
  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    })
  }
// Check if slug exists
  
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const count = await prisma.product.count({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    })
    return count > 0
  }
// Increment view count
   
  async incrementViewCount(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })
  }
// Update rating
  
  async updateRating(productId: string): Promise<void> {
    const result = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: result._avg.rating || 0,
        reviewCount: result._count.rating,
      },
    })
  }
// Get seller products
  
  async findBySeller(sellerId: string, pagination: PaginationParams) {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { sellerId },
        skip: pagination.skip,
        take: pagination.limit,
        include: {
          category: {
            select: {
              name: true,
            },
          },
          images: {
            take: 1,
            orderBy: { order: 'asc' },
          },
          inventory: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: { sellerId } }),
    ])

    return { products, total }
  }
// Get low stock products for seller

  async findLowStock(sellerId: string) {
    return prisma.product.findMany({
      where: {
        sellerId,
        active: true,
        inventory: {
          currentStock: {
            lte: prisma.inventory.fields.lowStockThreshold,
          },
        },
      },
      include: {
        inventory: true,
      },
      orderBy: {
        inventory: {
          currentStock: 'asc',
        },
      },
    })
  }
// Get related products (same category)
  
  async findRelated(productId: string, categoryId: string, limit: number = 6) {
    return prisma.product.findMany({
      where: {
        categoryId,
        active: true,
        id: { not: productId },
      },
      take: limit,
      include: {
        seller: {
          select: {
            businessName: true,
          },
        },
        images: {
          take: 1,
          orderBy: { order: 'asc' },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { orderCount: 'desc' },
      ],
    })
  }
// Get product inventory
  
  async getInventory(productId: string) {
    return prisma.inventory.findUnique({
      where: { productId },
    })
  }
}

export default new ProductRepository()
