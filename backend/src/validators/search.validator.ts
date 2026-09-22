import { z } from 'zod';

// Validation schemas for search endpoints
export const searchQuerySchema = z.object({
  query: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  location: z.string().min(1).max(100).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z
    .enum(['relevance', 'price_asc', 'price_desc', 'newest', 'rating'])
    .optional()
    .default('relevance'),
});

export const autocompleteSuggestionsSchema = z.object({
  query: z.string().min(2).max(200),
  limit: z.coerce.number().int().min(1).max(20).optional().default(10),
});

export const popularSearchesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const recentSearchesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export const createSavedSearchSchema = z.object({
  name: z.string().min(1, 'Search name is required').max(100, 'Search name must be 100 characters or less'),
  query: z.string().max(200).optional(),
  filters: z
    .object({
      categoryId: z.string().uuid().optional(),
      minPrice: z.number().min(0).optional(),
      maxPrice: z.number().min(0).optional(),
      location: z.string().min(1).max(100).optional(),
      minRating: z.number().min(0).max(5).optional(),
    })
    .refine(
      (data) => {
        if (data.minPrice !== undefined && data.maxPrice !== undefined) {
          return data.minPrice <= data.maxPrice;
        }
        return true;
      },
      {
        message: 'Minimum price cannot be greater than maximum price',
      }
    ),
  notifyOnNewResults: z.boolean().optional(),
});

export const updateSavedSearchSchema = z.object({
  name: z.string().min(1, 'Search name cannot be empty').max(100, 'Search name must be 100 characters or less').optional(),
  query: z.string().max(200).optional(),
  filters: z
    .object({
      categoryId: z.string().uuid().optional(),
      minPrice: z.number().min(0).optional(),
      maxPrice: z.number().min(0).optional(),
      location: z.string().min(1).max(100).optional(),
      minRating: z.number().min(0).max(5).optional(),
    })
    .refine(
      (data) => {
        if (data.minPrice !== undefined && data.maxPrice !== undefined) {
          return data.minPrice <= data.maxPrice;
        }
        return true;
      },
      {
        message: 'Minimum price cannot be greater than maximum price',
      }
    )
    .optional(),
  notifyOnNewResults: z.boolean().optional(),
});

export const executeSavedSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type AutocompleteSuggestions = z.infer<typeof autocompleteSuggestionsSchema>;
export type PopularSearches = z.infer<typeof popularSearchesSchema>;
export type RecentSearches = z.infer<typeof recentSearchesSchema>;
export type CreateSavedSearch = z.infer<typeof createSavedSearchSchema>;
export type UpdateSavedSearch = z.infer<typeof updateSavedSearchSchema>;
export type ExecuteSavedSearch = z.infer<typeof executeSavedSearchSchema>;
