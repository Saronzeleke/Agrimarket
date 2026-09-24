// Product Service
import productRepository from '../repositories/product.repository'
import categoryRepository from '../repositories/category.repository'
import { generateSlug } from '../utils/helpers'
import { ProductFilters, PaginationParams } from '../types'
import {
  NotFoundError,
  AuthorizationError,
} from '../utils/errors'
import { Role } from '@prisma/client'
import logger from '../config/logger'

interface CreateProductData {
  sellerId: string
  categoryId: string
  name: string
  description: string
  price: number
  unit: string
  productionLocation?: string | null
  harvestDate?: Date | null
  qualityGrade?: string | null
}

interface UpdateProductData {
  name?: string
  description?: string
  price?: number
  unit?: string
  productionLocation?: string | null
  harvestDate?: Date | null
  qualityGrade?: string | null
  categoryId?: string
  active?: boolean
}

export class ProductService {
  // Get product by ID
  async getById(id: string, userId?: string) {
    const product = await productRepository.findById(id)
    
    if (!product) {
      throw new NotFoundError('Product')
    }

    // Increment view count (async, don't wait)
    productRepository.incrementViewCount(id).catch((err) => {
      logger.error('Failed to increment view count', { productId: id, error: err })
    })

    return product
  }
//  Get product by slug
  async getBySlug(slug: string) {
    const product = await productRepository.findBySlug(slug)
    
    if (!product) {
      throw new NotFoundError('Product')
    }

    // Increment view count (async, don't wait)
    productRepository.incrementViewCount(product.id).catch((err) => {
      logger.error('Failed to increment view count', { productId: product.id, error: err })
    })

    return product
  }
//  List products with filters
  async list(filters: ProductFilters, pagination: PaginationParams) {
    const { products, total } = await productRepository.findMany(filters, pagination)
    return { products, total }
  }
//  Create product (seller only)
  async create(data: CreateProductData, userId: string, userRole: Role) {
    // Only sellers can create products
    if (userRole !== Role.SELLER && userRole !== Role.ADMIN) {
      throw new AuthorizationError('Only sellers can create products')
    }

    // Verify category exists
    const category = await categoryRepository.findById(data.categoryId)
    if (!category) {
      throw new NotFoundError('Category')
    }

    // Generate unique slug
    let slug = generateSlug(data.name)
    let counter = 1
    while (await productRepository.slugExists(slug)) {
      slug = `${generateSlug(data.name)}-${counter}`
      counter++
    }

    // Create product
    const product = await productRepository.create({
      seller: {
        connect: { id: data.sellerId },
      },
      category: {
        connect: { id: data.categoryId },
      },
      name: data.name,
      slug,
      description: data.description,
      price: data.price,
      unit: data.unit,
      productionLocation: data.productionLocation,
      harvestDate: data.harvestDate,
      qualityGrade: data.qualityGrade,
      active: true,
    })

    logger.info('Product created', {
      productId: product.id,
      sellerId: data.sellerId,
      name: product.name,
    })

    return product
  }
// Update product
  async update(
    productId: string,
    data: UpdateProductData,
    userId: string,
    userRole: Role
  ) {
    // Get product
    const product = await productRepository.findById(productId)
    if (!product) {
      throw new NotFoundError('Product')
    }

    // Check ownership (sellers can only update their own products)
    if (userRole === Role.SELLER && product.sellerId !== userId) {
      throw new AuthorizationError('You do not own this product')
    }

    // If name changed, regenerate slug
    let slug = product.slug
    if (data.name && data.name !== product.name) {
      slug = generateSlug(data.name)
      let counter = 1
      while (await productRepository.slugExists(slug, productId)) {
        slug = `${generateSlug(data.name)}-${counter}`
        counter++
      }
    }

    // If category changed, verify it exists
    if (data.categoryId && data.categoryId !== product.categoryId) {
      const category = await categoryRepository.findById(data.categoryId)
      if (!category) {
        throw new NotFoundError('Category')
      }
    }

    // Update product
    const updated = await productRepository.update(productId, {
      ...(data.name && { name: data.name }),
      ...(data.name && { slug }),
      ...(data.description && { description: data.description }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.unit && { unit: data.unit }),
      ...(data.productionLocation !== undefined && { 
        productionLocation: data.productionLocation 
      }),
      ...(data.harvestDate !== undefined && { harvestDate: data.harvestDate }),
      ...(data.qualityGrade !== undefined && { qualityGrade: data.qualityGrade }),
      ...(data.categoryId && { 
        category: { connect: { id: data.categoryId } } 
      }),
      ...(data.active !== undefined && { active: data.active }),
    })

    logger.info('Product updated', {
      productId,
      userId,
      changes: Object.keys(data),
    })

    return updated
  }
// Delete product
  async delete(productId: string, userId: string, userRole: Role) {
    // Get product
    const product = await productRepository.findById(productId)
    if (!product) {
      throw new NotFoundError('Product')
    }

    // Check ownership
    if (userRole === Role.SELLER && product.sellerId !== userId) {
      throw new AuthorizationError('You do not own this product')
    }

    // Check if product has orders (prevent deletion)
    // For now, just deactivate instead of hard delete
    await productRepository.update(productId, { active: false })

    logger.info('Product deactivated', {
      productId,
      userId,
    })
  }
// Get seller's products
  async getSellerProducts(sellerId: string, pagination: PaginationParams) {
    const { products, total } = await productRepository.findBySeller(
      sellerId,
      pagination
    )
    return { products, total }
  }
//  Get seller's low stock products
  async getSellerLowStock(sellerId: string) {
    const products = await productRepository.findLowStock(sellerId)
    return products
  }
// Get related products
  async getRelatedProducts(productId: string, limit: number = 6) {
    const product = await productRepository.findById(productId)
    if (!product) {
      throw new NotFoundError('Product')
    }

    const related = await productRepository.findRelated(
      productId,
      product.categoryId,
      limit
    )
    return related
  }
// Toggle product active status
  async toggleActive(productId: string, userId: string, userRole: Role) {
    const product = await productRepository.findById(productId)
    if (!product) {
      throw new NotFoundError('Product')
    }

    // Check ownership
    if (userRole === Role.SELLER && product.sellerId !== userId) {
      throw new AuthorizationError('You do not own this product')
    }

    const updated = await productRepository.update(productId, {
      active: !product.active,
    })

    logger.info('Product status toggled', {
      productId,
      userId,
      newStatus: updated.active,
    })

    return updated
  }
// Get product statistics for seller
  async getSellerStats(sellerId: string) {
    const [allProducts, activeProducts, lowStockProducts] = await Promise.all([
      productRepository.findBySeller(sellerId, { page: 1, limit: 1, skip: 0 }),
      productRepository.findMany(
        { sellerId, inStock: true },
        { page: 1, limit: 1, skip: 0 }
      ),
      productRepository.findLowStock(sellerId),
    ])

    return {
      total: allProducts.total,
      active: activeProducts.total,
      lowStock: lowStockProducts.length,
    }
  }
}

export default new ProductService()
