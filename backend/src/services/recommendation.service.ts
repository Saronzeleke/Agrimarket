/**
 * Recommendation Service
 * 
 * Intelligent product recommendation engine using multiple strategies.
 */

import prisma from '../config/database';
import { OrderStatus } from '@prisma/client';

export const recommendationService = {
  /**
   * Get personalized recommendations for a user
   */
  async getPersonalizedRecommendations(userId: string, limit: number = 20) {
    // Get user's purchase history
    const purchasedProducts = await prisma.orderItem.findMany({
      where: {
        order: {
          userId,
          status: OrderStatus.DELIVERED,
        },
      },
      select: {
        productId: true,
        product: {
          select: {
            categoryId: true,
            sellerId: true,
          },
        },
      },
      distinct: ['productId'],
    });

    // Get user's wishlist
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        wishlist: {
          userId,
        },
      },
      select: {
        productId: true,
        product: {
          select: {
            categoryId: true,
            sellerId: true,
          },
        },
      },
    });

    // Extract category and seller preferences
    const preferredCategories = new Set<string>();
    const preferredSellers = new Set<string>();
    const excludeProductIds = new Set<string>();

    [...purchasedProducts, ...wishlistItems].forEach((item) => {
      preferredCategories.add(item.product.categoryId);
      preferredSellers.add(item.product.sellerId);
      excludeProductIds.add(item.productId);
    });

    // Build recommendation query
    const recommendations = await prisma.product.findMany({
      where: {
        active: true,
        id: {
          notIn: Array.from(excludeProductIds),
        },
        OR: [
          {
            categoryId: {
              in: Array.from(preferredCategories),
            },
          },
          {
            sellerId: {
              in: Array.from(preferredSellers),
            },
          },
        ],
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            businessName: true,
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: { approved: true },
            },
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: limit,
    });

    return recommendations.map((product) => ({
      ...product,
      reviewCount: product._count.reviews,
      reason: preferredCategories.has(product.categoryId)
        ? 'Based on your interests'
        : 'From a seller you like',
    }));
  },

  /**
   * Get similar products to a given product
   */
  async getSimilarProducts(productId: string, limit: number = 10) {
    // Get the source product
    const sourceProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        sellerId: true,
        price: true,
      },
    });

    if (!sourceProduct) {
      return [];
    }

    // Calculate price range (±30%)
    const minPrice = Number(sourceProduct.price) * 0.7;
    const maxPrice = Number(sourceProduct.price) * 1.3;

    // Find similar products
    const similarProducts = await prisma.product.findMany({
      where: {
        active: true,
        id: { not: productId },
        categoryId: sourceProduct.categoryId,
        price: {
          gte: minPrice,
          lte: maxPrice,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            businessName: true,
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: { approved: true },
            },
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: limit,
    });

    return similarProducts.map((product) => ({
      ...product,
      reviewCount: product._count.reviews,
      reason: 'Similar product',
    }));
  },

  /**
   * Get "Customers also bought" recommendations
   */
  async getCustomersAlsoBought(productId: string, limit: number = 10) {
    // Find orders that contain the given product
    const ordersWithProduct = await prisma.orderItem.findMany({
      where: {
        productId,
        order: {
          status: OrderStatus.DELIVERED,
        },
      },
      select: {
        orderId: true,
      },
      distinct: ['orderId'],
    });

    const orderIds = ordersWithProduct.map((item) => item.orderId);

    if (orderIds.length === 0) {
      return [];
    }

    // Find other products in those orders
    const otherProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        orderId: {
          in: orderIds,
        },
        productId: {
          not: productId,
        },
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: limit * 2, // Get more to filter inactive
    });

    // Get product details
    const productIds = otherProducts.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        active: true,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            businessName: true,
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: { approved: true },
            },
          },
        },
      },
      take: limit,
    });

    return products.map((product) => ({
      ...product,
      reviewCount: product._count.reviews,
      reason: 'Customers also bought',
    }));
  },

  /**
   * Get trending products (most viewed/purchased recently)
   */
  async getTrendingProducts(limit: number = 20, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get products from recent orders
    const trendingProductIds = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: {
            gte: startDate,
          },
          status: {
            notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
          },
        },
      },
      _count: {
        productId: true,
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: limit * 2,
    });

    const productIds = trendingProductIds.map((item) => item.productId);

    if (productIds.length === 0) {
      // Fallback to highest rated products
      return this.getTopRatedProducts(limit);
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        active: true,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            businessName: true,
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: { approved: true },
            },
          },
        },
      },
    });

    return products.map((product) => ({
      ...product,
      reviewCount: product._count.reviews,
      reason: 'Trending now',
    }));
  },

  /**
   * Get best-selling products
   */
  async getBestSellers(limit: number = 20) {
    const bestSellerIds = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          status: OrderStatus.DELIVERED,
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit * 2,
    });

    const productIds = bestSellerIds.map((item) => item.productId);

    if (productIds.length === 0) {
      return [];
    }

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        active: true,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            businessName: true,
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: { approved: true },
            },
          },
        },
      },
      take: limit,
    });

    return products.map((product) => ({
      ...product,
      reviewCount: product._count.reviews,
      reason: 'Best seller',
    }));
  },

  /**
   * Get new arrivals
   */
  async getNewArrivals(limit: number = 20, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const products = await prisma.product.findMany({
      where: {
        active: true,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            businessName: true,
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: { approved: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return products.map((product) => ({
      ...product,
      reviewCount: product._count.reviews,
      reason: 'New arrival',
    }));
  },

  /**
   * Get top-rated products
   */
  async getTopRatedProducts(limit: number = 20) {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        reviewCount: {
          gte: 5, // At least 5 reviews
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            businessName: true,
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: { approved: true },
            },
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: limit,
    });

    return products.map((product) => ({
      ...product,
      reviewCount: product._count.reviews,
      reason: 'Top rated',
    }));
  },

  /**
   * Get popular products in a category
   */
  async getPopularInCategory(categoryId: string, limit: number = 20) {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        categoryId,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            businessName: true,
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: { approved: true },
            },
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: limit,
    });

    return products.map((product) => ({
      ...product,
      reviewCount: product._count.reviews,
      reason: 'Popular in category',
    }));
  },

  /**
   * Get "For You" recommendations (mixed strategies)
   */
  async getForYouFeed(userId: string, limit: number = 30) {
    const results: any[] = [];

    // Get personalized recommendations (40% of results)
    const personalizedCount = Math.ceil(limit * 0.4);
    const personalized = await this.getPersonalizedRecommendations(userId, personalizedCount);
    results.push(...personalized.slice(0, personalizedCount));

    // Get trending products (30% of results)
    const trendingCount = Math.ceil(limit * 0.3);
    const trending = await this.getTrendingProducts(trendingCount);
    results.push(...trending.slice(0, trendingCount));

    // Get new arrivals (20% of results)
    const newArrivalsCount = Math.ceil(limit * 0.2);
    const newArrivals = await this.getNewArrivals(newArrivalsCount);
    results.push(...newArrivals.slice(0, newArrivalsCount));

    // Get best sellers (10% of results)
    const bestSellersCount = limit - results.length;
    const bestSellers = await this.getBestSellers(bestSellersCount);
    results.push(...bestSellers.slice(0, bestSellersCount));

    // Remove duplicates
    const seen = new Set<string>();
    const uniqueResults = results.filter((product) => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });

    return uniqueResults.slice(0, limit);
  },

  /**
   * Get recently viewed products (from user's order history and wishlist)
   */
  async getRecentlyViewed(userId: string, limit: number = 10) {
    // Get products from recent wishlist additions
    const recentWishlist = await prisma.wishlistItem.findMany({
      where: {
        wishlist: {
          userId,
        },
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                name: true,
              },
            },
            seller: {
              select: {
                businessName: true,
                rating: true,
              },
            },
            _count: {
              select: {
                reviews: {
                  where: { approved: true },
                },
              },
            },
          },
        },
      },
      orderBy: {
        addedAt: 'desc',
      },
      take: limit,
    });

    return recentWishlist
      .filter((item) => item.product.active)
      .map((item) => ({
        ...item.product,
        reviewCount: item.product._count.reviews,
        reason: 'Recently viewed',
      }));
  },

  /**
   * Get products from favorite sellers
   */
  async getFromFavoriteSellers(userId: string, limit: number = 20) {
    // Find sellers user has purchased from most
    const sellerPurchases = await prisma.orderItem.groupBy({
      by: ['sellerId'],
      where: {
        order: {
          userId,
          status: OrderStatus.DELIVERED,
        },
      },
      _count: {
        sellerId: true,
      },
      orderBy: {
        _count: {
          sellerId: 'desc',
        },
      },
      take: 5, // Top 5 favorite sellers
    });

    const sellerIds = sellerPurchases.map((item) => item.sellerId);

    if (sellerIds.length === 0) {
      return [];
    }

    // Get products from these sellers that user hasn't purchased
    const purchasedProductIds = await prisma.orderItem.findMany({
      where: {
        order: {
          userId,
        },
      },
      select: {
        productId: true,
      },
      distinct: ['productId'],
    });

    const excludeIds = purchasedProductIds.map((item) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        active: true,
        sellerId: {
          in: sellerIds,
        },
        id: {
          notIn: excludeIds,
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        seller: {
          select: {
            businessName: true,
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: {
              where: { approved: true },
            },
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { reviewCount: 'desc' },
      ],
      take: limit,
    });

    return products.map((product) => ({
      ...product,
      reviewCount: product._count.reviews,
      reason: 'From your favorite sellers',
    }));
  },
};
