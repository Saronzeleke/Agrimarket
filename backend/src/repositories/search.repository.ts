import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  minRating?: number;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
}

export interface SearchResult {
  products: any[];
  total: number;
  suggestions: string[];
}

export const searchRepository = {
  /**
   * Advanced full-text search with ranking
   * Uses Prisma ORM methods to prevent SQL injection vulnerabilities.
   * Prisma automatically parameterizes all queries, preventing malicious SQL injection.
   */
  async searchProducts(filters: SearchFilters): Promise<SearchResult> {
    const {
      query = '',
      categoryId,
      minPrice,
      maxPrice,
      location,
      minRating,
      limit = 20,
      offset = 0,
      sortBy = 'relevance',
    } = filters;

    // Build WHERE clause - Prisma parameterizes all values automatically
    const where: Prisma.ProductWhereInput = {
      active: true,
      ...(categoryId && { categoryId }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { ...((minPrice && { gte: minPrice }) || {}), lte: maxPrice } }),
      ...(location && { productionLocation: { contains: location, mode: 'insensitive' } }),
      ...(minRating && { rating: { gte: minRating } }),
    };

    let products;
    let total;

    if (query.trim()) {
      // Add search conditions - Prisma safely handles user input
      where.OR = [
        { name: { contains: query.trim(), mode: 'insensitive' } },
        { description: { contains: query.trim(), mode: 'insensitive' } },
      ];

      // Determine sort order
      let orderBy: any;
      if (sortBy === 'price_asc') {
        orderBy = { price: 'asc' };
      } else if (sortBy === 'price_desc') {
        orderBy = { price: 'desc' };
      } else if (sortBy === 'newest') {
        orderBy = { createdAt: 'desc' };
      } else if (sortBy === 'rating') {
        orderBy = [{ rating: 'desc' }, { reviewCount: 'desc' }];
      } else {
        // For relevance, prioritize by order count and rating
        orderBy = [{ orderCount: 'desc' }, { rating: 'desc' }];
      }

      // Fetch products using Prisma ORM - no SQL injection possible
      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            seller: {
              select: {
                id: true,
                businessName: true,
                rating: true,
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
              select: {
                id: true,
                url: true,
                alt: true,
                order: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy,
          take: limit,
          skip: offset,
        }),
        prisma.product.count({ where }),
      ]);
    } else {
      // No search query - use regular filtering with Prisma ORM
      const orderBy =
        sortBy === 'price_asc'
          ? { price: 'asc' as const }
          : sortBy === 'price_desc'
            ? { price: 'desc' as const }
            : sortBy === 'newest'
              ? { createdAt: 'desc' as const }
              : sortBy === 'rating'
                ? [{ rating: 'desc' as const }, { reviewCount: 'desc' as const }]
                : { createdAt: 'desc' as const };

      [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            seller: {
              select: {
                id: true,
                businessName: true,
                rating: true,
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
              select: {
                id: true,
                url: true,
                alt: true,
                order: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: orderBy as any,
          take: limit,
          skip: offset,
        }),
        prisma.product.count({ where }),
      ]);
    }

    // Get search suggestions based on the query
    const suggestions = query.trim()
      ? await this.getSearchSuggestions(query.trim(), 5)
      : [];

    return {
      products: products as any[],
      total,
      suggestions,
    };
  },
  /**
   * Get autocomplete suggestions based on partial query
   * Uses Prisma findMany with case-insensitive contains for safe filtering
   */
  async getSearchSuggestions(
    query: string,
    limit: number = 10
  ): Promise<string[]> {
    // Use Prisma ORM to safely query products - prevents SQL injection
    const products = await prisma.product.findMany({
      where: {
        active: true,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        name: true,
      },
      orderBy: [
        { orderCount: 'desc' },
        { rating: 'desc' },
      ],
      take: limit,
      distinct: ['name'],
    });

    return products.map((p) => p.name);
  },
  /**
   * Log search query for analytics
   * Uses Prisma create to safely insert data - prevents SQL injection
   */
  async logSearch(query: string, userId?: string, resultCount?: number): Promise<void> {
    try {
      // Prisma automatically parameterizes all values, preventing SQL injection
      await prisma.searchLog.create({
        data: {
          query: query.trim().toLowerCase(),
          userId: userId || null,
          resultCount: resultCount || 0,
        },
      });
    } catch (error) {
      // Fail silently - logging shouldn't break search
      console.error('Failed to log search:', error);
    }
  },
  /**
   * Get popular search terms
   * Uses Prisma groupBy for safe aggregation - prevents SQL injection
   */
  async getPopularSearches(limit: number = 10): Promise<{ query: string; count: number }[]> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Prisma groupBy safely aggregates data without SQL injection risk
      const results = await prisma.searchLog.groupBy({
        by: ['query'],
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
          query: {
            not: '',
          },
        },
        _count: {
          query: true,
        },
        orderBy: {
          _count: {
            query: 'desc',
          },
        },
        take: limit,
      });

      return results.map((r) => ({
        query: r.query,
        count: r._count?.query ?? 0,
      }));
    } catch (error) {
      // Table might not exist yet or other error
      return [];
    }
  },
  /**
   * Get user's recent searches
   * Uses Prisma findMany with distinct to safely retrieve unique searches
   */
  async getUserRecentSearches(userId: string, limit: number = 10): Promise<string[]> {
    try {
      // Prisma ORM safely handles all user input through parameterized queries
      const results = await prisma.searchLog.findMany({
        where: {
          userId,
          query: {
            not: '',
          },
        },
        select: {
          query: true,
        },
        distinct: ['query'],
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });

      return results.map((r) => r.query);
    } catch (error) {
      return [];
    }
  },
};
