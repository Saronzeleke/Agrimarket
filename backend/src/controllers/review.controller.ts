/**
 * Review Controller
 * 
 * Handles product review and rating endpoints.
 */

import { Request, Response } from 'express';
import { reviewService } from '../services/review.service';
import {
  submitReviewSchema,
  updateReviewSchema,
  getProductReviewsSchema,
  moderateReviewSchema,
  sellerResponseSchema,
} from '../validators/review.validator';
import { sendSuccess } from '../utils/response';
import { ValidationError } from '../utils/errors';

export const reviewController = {
  /**
   * Submit a product review
   * POST /api/v1/reviews
   */
  async submitReview(req: Request, res: Response) {
    const validation = submitReviewSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error.issues);
    }

    const userId = req.user!.id;
    const review = await reviewService.submitReview(userId, validation.data);

    return sendSuccess(res, { review }, 201);
  },

  /**
   * Get reviews for a product
   * GET /api/v1/products/:productId/reviews
   */
  async getProductReviews(req: Request, res: Response) {
    const { productId } = req.params;
    const validation = getProductReviewsSchema.safeParse(req.query);

    if (!validation.success) {
      throw new ValidationError('Invalid query parameters', validation.error.issues);
    }

    const result = await reviewService.getProductReviews(productId, validation.data);

    return sendSuccess(res, result);
  },

  /**
   * Get review by ID
   * GET /api/v1/reviews/:reviewId
   */
  async getReviewById(req: Request, res: Response) {
    const { reviewId } = req.params;
    const review = await reviewService.getReviewById(reviewId);

    return sendSuccess(res, { review });
  },

  /**
   * Update a review
   * PATCH /api/v1/reviews/:reviewId
   */
  async updateReview(req: Request, res: Response) {
    const { reviewId } = req.params;
    const validation = updateReviewSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error.issues);
    }

    const userId = req.user!.id;
    const review = await reviewService.updateReview(reviewId, userId, validation.data);

    return sendSuccess(res, { review });
  },

  /**
   * Delete a review
   * DELETE /api/v1/reviews/:reviewId
   */
  async deleteReview(req: Request, res: Response) {
    const { reviewId } = req.params;
    const userId = req.user!.id;

    const result = await reviewService.deleteReview(reviewId, userId);

    return sendSuccess(res, result);
  },

  /**
   * Toggle helpful vote on a review
   * POST /api/v1/reviews/:reviewId/helpful
   */
  async toggleHelpful(req: Request, res: Response) {
    const { reviewId } = req.params;
    const userId = req.user!.id;

    const result = await reviewService.toggleHelpful(reviewId, userId);

    return sendSuccess(res, result);
  },

  /**
   * Get product review statistics
   * GET /api/v1/products/:productId/reviews/stats
   */
  async getProductStats(req: Request, res: Response) {
    const { productId } = req.params;
    const stats = await reviewService.getProductStats(productId);

    return sendSuccess(res, { stats });
  },

  /**
   * Flag a review for moderation
   * POST /api/v1/reviews/:reviewId/flag
   */
  async flagReview(req: Request, res: Response) {
    const { reviewId } = req.params;
    const result = await reviewService.flagReview(reviewId);

    return sendSuccess(res, result);
  },

  /**
   * Add seller response to a review
   * POST /api/v1/seller/reviews/:reviewId/respond
   */
  async addSellerResponse(req: Request, res: Response) {
    const { reviewId } = req.params;
    const validation = sellerResponseSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error.issues);
    }

    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new ValidationError('User is not a seller');
    }

    const review = await reviewService.addSellerResponse(
      reviewId,
      sellerId,
      validation.data.response
    );

    return sendSuccess(res, { review });
  },

  /**
   * Get seller's product reviews
   * GET /api/v1/seller/reviews
   */
  async getSellerReviews(req: Request, res: Response) {
    const sellerId = req.user!.sellerProfile?.id;
    if (!sellerId) {
      throw new ValidationError('User is not a seller');
    }

    const { page, limit, needsResponse } = req.query;

    const result = await reviewService.getSellerReviews(sellerId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      needsResponse: needsResponse === 'true',
    });

    return sendSuccess(res, result);
  },

  /**
   * Moderate a review (Admin only)
   * PATCH /api/v1/admin/reviews/:reviewId/moderate
   */
  async moderateReview(req: Request, res: Response) {
    const { reviewId } = req.params;
    const validation = moderateReviewSchema.safeParse(req.body);

    if (!validation.success) {
      throw new ValidationError('Invalid request data', validation.error.issues);
    }

    const result = await reviewService.moderateReview(reviewId, validation.data.approved);

    return sendSuccess(res, result);
  },

  /**
   * Get flagged reviews (Admin only)
   * GET /api/v1/admin/reviews/flagged
   */
  async getFlaggedReviews(req: Request, res: Response) {
    const { page, limit } = req.query;

    const result = await reviewService.getFlaggedReviews(
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    return sendSuccess(res, result);
  },

  /**
   * Delete review (Admin only)
   * DELETE /api/v1/admin/reviews/:reviewId
   */
  async adminDeleteReview(req: Request, res: Response) {
    const { reviewId } = req.params;
    const result = await reviewService.adminDeleteReview(reviewId);

    return sendSuccess(res, result);
  },
};
