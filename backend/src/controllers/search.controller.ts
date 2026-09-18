import { Request, Response } from 'express';
import { searchService } from '../services/search.service';
import {
  searchQuerySchema,
  autocompleteSuggestionsSchema,
  popularSearchesSchema,
  recentSearchesSchema,
  createSavedSearchSchema,
  updateSavedSearchSchema,
  executeSavedSearchSchema,
} from '../validators/search.validator';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export const searchController = {
  /**
   * Advanced product search
   * GET /api/v1/search?query=teff&categoryId=...&minPrice=...&maxPrice=...&location=...&minRating=...&page=1&limit=20&sortBy=relevance
   */
  async searchProducts(req: Request, res: Response) {
    const validation = searchQuerySchema.safeParse(req.query);

    if (!validation.success) {
      throw new BadRequestError('Invalid search parameters', validation.error.issues);
    }

    const { page, limit, ...filters } = validation.data;
    const offset = (page - 1) * limit;

    const userId = req.user?.id;

    const result = await searchService.searchProducts(
      {
        ...filters,
        limit,
        offset,
      },
      userId
    );

    successResponse(res, result, 'Search completed successfully');
  },

  /**
   * Get autocomplete suggestions
   * GET /api/v1/search/suggestions?query=te&limit=10
   */
  async getAutocompleteSuggestions(req: Request, res: Response) {
    const validation = autocompleteSuggestionsSchema.safeParse(req.query);

    if (!validation.success) {
      throw new BadRequestError('Invalid autocomplete parameters', validation.error.issues);
    }

    const { query, limit } = validation.data;

    const suggestions = await searchService.getAutocompleteSuggestions(query, limit);

    successResponse(res, { suggestions }, 'Suggestions retrieved successfully');
  },

  /**
   * Get popular search terms
   * GET /api/v1/search/popular?limit=10
   */
  async getPopularSearches(req: Request, res: Response) {
    const validation = popularSearchesSchema.safeParse(req.query);

    if (!validation.success) {
      throw new BadRequestError('Invalid parameters', validation.error.issues);
    }

    const { limit } = validation.data;

    const popularSearches = await searchService.getPopularSearches(limit);

    successResponse(res, { searches: popularSearches }, 'Popular searches retrieved successfully');
  },

  /**
   * Get user's recent searches
   * GET /api/v1/search/recent?limit=10
   */
  async getUserRecentSearches(req: Request, res: Response) {
    const validation = recentSearchesSchema.safeParse(req.query);

    if (!validation.success) {
      throw new BadRequestError('Invalid parameters', validation.error.issues);
    }

    const { limit } = validation.data;
    const userId = req.user!.id;

    const recentSearches = await searchService.getUserRecentSearches(userId, limit);

    successResponse(res, { searches: recentSearches }, 'Recent searches retrieved successfully');
  },

  /**
   * Save a search for later
   * POST /api/v1/search/saved
   */
  async saveSearch(req: Request, res: Response) {
    const validation = createSavedSearchSchema.safeParse(req.body);

    if (!validation.success) {
      throw new BadRequestError('Invalid saved search data', validation.error.issues);
    }

    const userId = req.user!.id;

    const savedSearch = await searchService.saveSearch(userId, validation.data);

    successResponse(res, { savedSearch }, 'Search saved successfully', 201);
  },

  /**
   * Get all saved searches for the authenticated user
   * GET /api/v1/search/saved
   */
  async getUserSavedSearches(req: Request, res: Response) {
    const userId = req.user!.id;

    const savedSearches = await searchService.getUserSavedSearches(userId);

    successResponse(res, { savedSearches }, 'Saved searches retrieved successfully');
  },

  /**
   * Get a specific saved search
   * GET /api/v1/search/saved/:id
   */
  async getSavedSearch(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user!.id;

    const savedSearch = await searchService.getSavedSearch(id, userId);

    successResponse(res, { savedSearch }, 'Saved search retrieved successfully');
  },

  /**
   * Update a saved search
   * PATCH /api/v1/search/saved/:id
   */
  async updateSavedSearch(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user!.id;

    const validation = updateSavedSearchSchema.safeParse(req.body);

    if (!validation.success) {
      throw new BadRequestError('Invalid update data', validation.error.issues);
    }

    const savedSearch = await searchService.updateSavedSearch(id, userId, validation.data);

    successResponse(res, { savedSearch }, 'Saved search updated successfully');
  },

  /**
   * Delete a saved search
   * DELETE /api/v1/search/saved/:id
   */
  async deleteSavedSearch(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user!.id;

    await searchService.deleteSavedSearch(id, userId);

    successResponse(res, null, 'Saved search deleted successfully');
  },

  /**
   * Execute a saved search
   * GET /api/v1/search/saved/:id/execute?page=1&limit=20
   */
  async executeSavedSearch(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user!.id;

    const validation = executeSavedSearchSchema.safeParse(req.query);

    if (!validation.success) {
      throw new BadRequestError('Invalid pagination parameters', validation.error.issues);
    }

    const { page, limit } = validation.data;

    const result = await searchService.executeSavedSearch(id, userId, page, limit);

    successResponse(res, result, 'Saved search executed successfully');
  },
};
