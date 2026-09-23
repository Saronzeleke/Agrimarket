import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export interface SavedSearchData {
  name: string;
  query?: string;
  filters: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    minRating?: number;
  };
  notifyOnNewResults?: boolean;
}

export const savedSearchRepository = {
  //Create a saved search for a user
   
  async create(userId: string, data: SavedSearchData) {
    const savedSearch = await prisma.$executeRawUnsafe(
      `
      INSERT INTO saved_searches (id, "userId", name, query, filters, "notifyOnNewResults", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *
    `,
      userId,
      data.name,
      data.query || null,
      JSON.stringify(data.filters),
      data.notifyOnNewResults || false
    );

    return savedSearch;
  },
// Get all saved searches for a user
  
  async findByUserId(userId: string) {
    try {
      const searches: any[] = await prisma.$queryRawUnsafe(
        `
        SELECT *
        FROM saved_searches
        WHERE "userId" = $1
        ORDER BY "createdAt" DESC
      `,
        userId
      );

      return searches.map((s) => ({
        ...s,
        filters: typeof s.filters === 'string' ? JSON.parse(s.filters) : s.filters,
      }));
    } catch (error) {
      // Table might not exist yet
      return [];
    }
  },
// Get a specific saved search
  
  async findById(id: string, userId: string) {
    try {
      const searches: any[] = await prisma.$queryRawUnsafe(
        `
        SELECT *
        FROM saved_searches
        WHERE id = $1 AND "userId" = $2
      `,
        id,
        userId
      );

      if (searches.length === 0) {
        throw new NotFoundError('Saved search not found');
      }

      const search = searches[0];
      return {
        ...search,
        filters: typeof search.filters === 'string' ? JSON.parse(search.filters) : search.filters,
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new NotFoundError('Saved search not found');
    }
  },
//Update a saved search
   
  async update(id: string, userId: string, data: Partial<SavedSearchData>) {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(data.name);
      paramIndex++;
    }

    if (data.query !== undefined) {
      updates.push(`query = $${paramIndex}`);
      params.push(data.query);
      paramIndex++;
    }

    if (data.filters !== undefined) {
      updates.push(`filters = $${paramIndex}`);
      params.push(JSON.stringify(data.filters));
      paramIndex++;
    }

    if (data.notifyOnNewResults !== undefined) {
      updates.push(`"notifyOnNewResults" = $${paramIndex}`);
      params.push(data.notifyOnNewResults);
      paramIndex++;
    }

    if (updates.length === 0) {
      return this.findById(id, userId);
    }

    updates.push(`"updatedAt" = NOW()`);

    try {
      const result: any[] = await prisma.$queryRawUnsafe(
        `
        UPDATE saved_searches
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex} AND "userId" = $${paramIndex + 1}
        RETURNING *
      `,
        ...params,
        id,
        userId
      );

      if (result.length === 0) {
        throw new NotFoundError('Saved search not found');
      }

      const search = result[0];
      return {
        ...search,
        filters: typeof search.filters === 'string' ? JSON.parse(search.filters) : search.filters,
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new NotFoundError('Saved search not found');
    }
  },
// Delete a saved search
 
  async delete(id: string, userId: string): Promise<void> {
    try {
      const result: any = await prisma.$queryRawUnsafe(
        `
        DELETE FROM saved_searches
        WHERE id = $1 AND "userId" = $2
        RETURNING id
      `,
        id,
        userId
      );

      if (result.length === 0) {
        throw new NotFoundError('Saved search not found');
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new NotFoundError('Saved search not found');
    }
  },
// Execute a saved search
  
  async execute(id: string, userId: string, { limit, offset }: { limit?: number; offset?: number }) {
    const savedSearch = await this.findById(id, userId);

    // Import here to avoid circular dependency
    const { searchRepository } = require('./search.repository');

    return searchRepository.searchProducts({
      query: savedSearch.query,
      ...savedSearch.filters,
      limit,
      offset,
    });
  },
};
