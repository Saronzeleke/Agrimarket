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
  /**
   * Create a saved search for a user
   * Uses Prisma create for safe insertion - prevents SQL injection
   */
  async create(userId: string, data: SavedSearchData) {
    // Prisma automatically parameterizes all values, preventing SQL injection
    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId,
        name: data.name,
        query: data.query || null,
        filters: data.filters,
        notifyOnNewResults: data.notifyOnNewResults || false,
      },
    });

    return savedSearch;
  },
  /**
   * Get all saved searches for a user
   * Uses Prisma findMany for safe querying - prevents SQL injection
   */
  async findByUserId(userId: string) {
    try {
      // Prisma ORM safely parameterizes the userId value
      const searches = await prisma.savedSearch.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          userId: true,
          name: true,
          query: true,
          filters: true,
          notifyOnNewResults: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return searches;
    } catch (error) {
      // Table might not exist yet
      return [];
    }
  },
  /**
   * Get a specific saved search
   * Uses Prisma findFirst with authorization check - prevents SQL injection
   */
  async findById(id: string, userId: string) {
    try {
      // Prisma safely parameterizes both id and userId
      const search = await prisma.savedSearch.findFirst({
        where: {
          id,
          userId, // Authorization: ensure user owns this saved search
        },
      });

      if (!search) {
        throw new NotFoundError('Saved search not found');
      }

      return search;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new NotFoundError('Saved search not found');
    }
  },
  /**
   * Update a saved search
   * Uses Prisma update with authorization check - prevents SQL injection
   */
  async update(id: string, userId: string, data: Partial<SavedSearchData>) {
    // First verify the user owns this saved search (authorization check)
    const existing = await this.findById(id, userId);
    if (!existing) {
      throw new NotFoundError('Saved search not found');
    }

    // Build update data object - only include provided fields
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.query !== undefined) {
      updateData.query = data.query;
    }

    if (data.filters !== undefined) {
      updateData.filters = data.filters;
    }

    if (data.notifyOnNewResults !== undefined) {
      updateData.notifyOnNewResults = data.notifyOnNewResults;
    }

    try {
      // Prisma safely parameterizes all values
      const updated = await prisma.savedSearch.update({
        where: {
          id,
        },
        data: updateData,
      });

      return updated;
    } catch (error) {
      throw new NotFoundError('Saved search not found');
    }
  },
  /**
   * Delete a saved search
   * Uses Prisma delete with authorization check - prevents SQL injection
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      // First verify the user owns this saved search (authorization check)
      const existing = await this.findById(id, userId);
      if (!existing) {
        throw new NotFoundError('Saved search not found');
      }

      // Prisma safely parameterizes the id
      await prisma.savedSearch.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new NotFoundError('Saved search not found');
    }
  },
  /**
   * Execute a saved search
   */
  async execute(id: string, userId: string, { limit, offset }: { limit?: number; offset?: number }) {
    const savedSearch = await this.findById(id, userId);

    // Import here to avoid circular dependency
    const { searchRepository } = require('./search.repository');

    // Safely spread filters if they exist
    const filters = typeof savedSearch.filters === 'object' && savedSearch.filters !== null
      ? savedSearch.filters
      : {};

    return searchRepository.searchProducts({
      query: savedSearch.query || undefined,
      ...filters,
      limit,
      offset,
    });
  },
};
