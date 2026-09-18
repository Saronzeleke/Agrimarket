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
   * Uses PostgreSQL trigram similarity for fuzzy matching
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

    // Build WHERE clause
    const where: Prisma.ProductWhereInput = {
      active: true,
      ...(categoryId && { categoryId }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { ...((minPrice && { gte: minPrice }) || {}), lte: maxPrice } }),
      ...(location && { productionLocation: { contains: location, mode: 'insensitive' } }),
      ...(minRating && { rating: { gte: minRating } }),
    };

    // Full-text search using PostgreSQL
    let products;
    let total;

    if (query.trim()) {
      // Use raw SQL for better full-text search with ranking
      const searchQuery = query.trim().toLowerCase();
      const searchPattern = `%${searchQuery}%`;

      // Calculate relevance score:
      // - Exact match in name: highest priority
      // - Starts with query: high priority
      // - Contains in name: medium priority
      // - Contains in description: lower priority
      const orderByClause =
        sortBy === 'relevance'
          ? `
            CASE 
              WHEN LOWER(p.name) = $1 THEN 1
              WHEN LOWER(p.name) LIKE $2 || '%' THEN 2
              WHEN LOWER(p.name) LIKE $3 THEN 3
              WHEN LOWER(p.description) LIKE $3 THEN 4
              ELSE 5
            END,
            p."orderCount" DESC,
            p.rating DESC
          `
          : sortBy === 'price_asc'
            ? 'p.price ASC'
            : sortBy === 'price_desc'
              ? 'p.price DESC'
              : sortBy === 'newest'
                ? 'p."createdAt" DESC'
                : sortBy === 'rating'
                  ? 'p.rating DESC, p."reviewCount" DESC'
                  : 'p."createdAt" DESC';

      // Build additional WHERE conditions
      const additionalConditions: string[] = [];
      const additionalParams: any[] = [];
      let paramIndex = 4; // Start from $4 since $1-$3 are used for search

      if (categoryId) {
        additionalConditions.push(`p."categoryId" = $${paramIndex}`);
        additionalParams.push(categoryId);
        paramIndex++;
      }

      if (minPrice !== undefined) {
        additionalConditions.push(`p.price >= $${paramIndex}`);
        additionalParams.push(minPrice);
        paramIndex++;
      }

      if (maxPrice !== undefined) {
        additionalConditions.push(`p.price <= $${paramIndex}`);
        additionalParams.push(maxPrice);
        paramIndex++;
      }

      if (location) {
        additionalConditions.push(`LOWER(p."productionLocation") LIKE $${paramIndex}`);
        additionalParams.push(`%${location.toLowerCase()}%`);
        paramIndex++;
      }

      if (minRating !== undefined) {
        additionalConditions.push(`p.rating >= $${paramIndex}`);
        additionalParams.push(minRating);
        paramIndex++;
      }

      const whereClause =
        additionalConditions.length > 0
          ? `AND ${additionalConditions.join(' AND ')}`
          : '';

      const query = `
        SELECT 
          p.*,
          json_build_object(
            'id', sp.id,
            'businessName', sp."businessName",
            'rating', sp.rating,
            'verified', sp.verified
          ) as seller,
          json_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug
          ) as category,
          COALESCE(
            (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.url, 'alt', pi.alt, 'order', pi."order"))
             FROM product_images pi WHERE pi."productId" = p.id ORDER BY pi."order"),
            '[]'::json
          ) as images
        FROM products p
        INNER JOIN seller_profiles sp ON p."sellerId" = sp.id
        INNER JOIN categories c ON p."categoryId" = c.id
        WHERE p.active = true
          AND (
            LOWER(p.name) LIKE $3
            OR LOWER(p.description) LIKE $3
          )
          ${whereClause}
        ORDER BY ${orderByClause}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      products = await prisma.$queryRawUnsafe(
        query,
        searchQuery,
        searchQuery,
        searchPattern,
        ...additionalParams,
        limit,
        offset
      );

      // Get total count
      const countQuery = `
        SELECT COUNT(*) as count
        FROM products p
        WHERE p.active = true
          AND (
            LOWER(p.name) LIKE $1
            OR LOWER(p.description) LIKE $1
          )
          ${whereClause}
      `;

      const countResult: any = await prisma.$queryRawUnsafe(
        countQuery,
        searchPattern,
        ...additionalParams
      );
      total = Number(countResult[0]?.count || 0);
    } else {
      // No search query - use regular filtering
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
   */
  async getSearchSuggestions(
    query: string,
    limit: number = 10
  ): Promise<string[]> {
    const searchPattern = `%${query.toLowerCase()}%`;

    // Get product names that match
    const products: any[] = await prisma.$queryRawUnsafe(
      `
      SELECT DISTINCT name
      FROM products
      WHERE active = true
        AND LOWER(name) LIKE $1
      ORDER BY "orderCount" DESC, rating DESC
      LIMIT $2
    `,
      searchPattern,
      limit
    );

    return products.map((p) => p.name);
  },

  /**
   * Log search query for analytics
   */
  async logSearch(query: string, userId?: string, resultCount?: number): Promise<void> {
    try {
      await prisma.$executeRawUnsafe(
        `
        INSERT INTO search_logs (id, query, "userId", "resultCount", "createdAt")
        VALUES (gen_random_uuid(), $1, $2, $3, NOW())
      `,
        query.trim().toLowerCase(),
        userId || null,
        resultCount || 0
      );
    } catch (error) {
      // Fail silently - logging shouldn't break search
      console.error('Failed to log search:', error);
    }
  },

  /**
   * Get popular search terms
   */
  async getPopularSearches(limit: number = 10): Promise<{ query: string; count: number }[]> {
    try {
      const results: any[] = await prisma.$queryRawUnsafe(
        `
        SELECT query, COUNT(*) as count
        FROM search_logs
        WHERE "createdAt" > NOW() - INTERVAL '30 days'
          AND query IS NOT NULL
          AND LENGTH(query) > 0
        GROUP BY query
        ORDER BY count DESC
        LIMIT $1
      `,
        limit
      );

      return results.map((r) => ({
        query: r.query,
        count: Number(r.count),
      }));
    } catch (error) {
      // Table might not exist yet
      return [];
    }
  },

  /**
   * Get user's recent searches
   */
  async getUserRecentSearches(userId: string, limit: number = 10): Promise<string[]> {
    try {
      const results: any[] = await prisma.$queryRawUnsafe(
        `
        SELECT DISTINCT query
        FROM search_logs
        WHERE "userId" = $1
          AND query IS NOT NULL
          AND LENGTH(query) > 0
        ORDER BY "createdAt" DESC
        LIMIT $2
      `,
        userId,
        limit
      );

      return results.map((r) => r.query);
    } catch (error) {
      return [];
    }
  },
};
