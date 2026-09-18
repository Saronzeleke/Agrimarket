import { searchRepository, SearchFilters } from '../repositories/search.repository';
import { savedSearchRepository, SavedSearchData } from '../repositories/saved-search.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const searchService = {
  /**
   * Search products with advanced filtering
   */
  async searchProducts(filters: SearchFilters, userId?: string) {
    // Validate pagination
    const limit = Math.min(filters.limit || 20, 100); // Max 100 per page
    const offset = Math.max(filters.offset || 0, 0);

    // Validate price range
    if (filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice) {
      throw new BadRequestError('Minimum price cannot be greater than maximum price');
    }

    // Validate rating
    if (filters.minRating && (filters.minRating < 0 || filters.minRating > 5)) {
      throw new BadRequestError('Rating must be between 0 and 5');
    }

    // Execute search
    const result = await searchRepository.searchProducts({
      ...filters,
      limit,
      offset,
    });

    // Log the search query for analytics (async, non-blocking)
    if (filters.query && filters.query.trim()) {
      searchRepository
        .logSearch(filters.query.trim(), userId, result.total)
        .catch((err) => console.error('Search logging failed:', err));
    }

    // Calculate pagination metadata
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(result.total / limit);

    return {
      products: result.products,
      suggestions: result.suggestions,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(query: string, limit: number = 10) {
    if (!query || query.trim().length < 2) {
      return [];
    }

    return searchRepository.getSearchSuggestions(query.trim(), limit);
  },

  /**
   * Get popular search terms
   */
  async getPopularSearches(limit: number = 10) {
    return searchRepository.getPopularSearches(limit);
  },

  /**
   * Get user's recent searches
   */
  async getUserRecentSearches(userId: string, limit: number = 10) {
    return searchRepository.getUserRecentSearches(userId, limit);
  },

  /**
   * Save a search for a user
   */
  async saveSearch(userId: string, data: SavedSearchData) {
    // Validate the search name
    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestError('Search name is required');
    }

    if (data.name.length > 100) {
      throw new BadRequestError('Search name must be 100 characters or less');
    }

    // Validate filters
    if (data.filters.minPrice && data.filters.maxPrice && data.filters.minPrice > data.filters.maxPrice) {
      throw new BadRequestError('Minimum price cannot be greater than maximum price');
    }

    if (data.filters.minRating && (data.filters.minRating < 0 || data.filters.minRating > 5)) {
      throw new BadRequestError('Rating must be between 0 and 5');
    }

    return savedSearchRepository.create(userId, data);
  },

  /**
   * Get all saved searches for a user
   */
  async getUserSavedSearches(userId: string) {
    return savedSearchRepository.findByUserId(userId);
  },

  /**
   * Get a specific saved search
   */
  async getSavedSearch(id: string, userId: string) {
    return savedSearchRepository.findById(id, userId);
  },

  /**
   * Update a saved search
   */
  async updateSavedSearch(id: string, userId: string, data: Partial<SavedSearchData>) {
    // Validate the search name if provided
    if (data.name !== undefined) {
      if (data.name.trim().length === 0) {
        throw new BadRequestError('Search name cannot be empty');
      }

      if (data.name.length > 100) {
        throw new BadRequestError('Search name must be 100 characters or less');
      }
    }

    // Validate filters if provided
    if (data.filters) {
      if (data.filters.minPrice && data.filters.maxPrice && data.filters.minPrice > data.filters.maxPrice) {
        throw new BadRequestError('Minimum price cannot be greater than maximum price');
      }

      if (data.filters.minRating && (data.filters.minRating < 0 || data.filters.minRating > 5)) {
        throw new BadRequestError('Rating must be between 0 and 5');
      }
    }

    return savedSearchRepository.update(id, userId, data);
  },

  /**
   * Delete a saved search
   */
  async deleteSavedSearch(id: string, userId: string) {
    await savedSearchRepository.delete(id, userId);
  },

  /**
   * Execute a saved search
   */
  async executeSavedSearch(id: string, userId: string, page: number = 1, limit: number = 20) {
    // Validate pagination
    const validLimit = Math.min(Math.max(limit, 1), 100);
    const validPage = Math.max(page, 1);
    const offset = (validPage - 1) * validLimit;

    const result = await savedSearchRepository.execute(id, userId, {
      limit: validLimit,
      offset,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(result.total / validLimit);

    return {
      products: result.products,
      suggestions: result.suggestions,
      pagination: {
        total: result.total,
        page: validPage,
        limit: validLimit,
        totalPages,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      },
    };
  },
};
