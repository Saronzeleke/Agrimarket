/**
 * Product Factory
 * 
 * Factory functions for creating test products.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const productFactory = {
  /**
   * Create a test category
   */
  async createCategory(data?: Partial<{
    name: string;
    slug: string;
    description: string;
    active: boolean;
  }>) {
    const name = data?.name || `Test Category ${Date.now()}`;
    const slug = data?.slug || name.toLowerCase().replace(/\s+/g, '-');

    return prisma.category.create({
      data: {
        name,
        slug,
        description: data?.description || `Description for ${name}`,
        active: data?.active ?? true,
      },
    });
  },

  /**
   * Create a test product
   */
  async createProduct(
    sellerId: string,
    categoryId: string,
    data?: Partial<{
      name: string;
      slug: string;
      description: string;
      price: number;
      unit: string;
      active: boolean;
    }>
  ) {
    const name = data?.name || `Test Product ${Date.now()}`;
    const slug = data?.slug || name.toLowerCase().replace(/\s+/g, '-');

    const product = await prisma.product.create({
      data: {
        sellerId,
        categoryId,
        name,
        slug,
        description: data?.description || `Description for ${name}`,
        price: data?.price || 100,
        unit: data?.unit || 'kg',
        active: data?.active ?? true,
      },
    });

    // Create inventory for the product
    await prisma.inventory.create({
      data: {
        productId: product.id,
        currentStock: 100,
        lowStockThreshold: 10,
      },
    });

    return prisma.product.findUnique({
      where: { id: product.id },
      include: {
        category: true,
        seller: true,
        inventory: true,
      },
    });
  },

  /**
   * Create multiple test products
   */
  async createProducts(
    sellerId: string,
    categoryId: string,
    count: number
  ) {
    const products = [];
    for (let i = 0; i < count; i++) {
      products.push(
        await this.createProduct(sellerId, categoryId, {
          name: `Test Product ${Date.now()}-${i}`,
        })
      );
    }
    return products;
  },
};
