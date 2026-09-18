/**
 * Review Service
 * 
 * Business logic for product reviews and ratings.
 */

import { reviewRepository } from '../repositories/review.repository';
import { ValidationError, NotFoundError, AuthorizationError, ConflictError } from '../utils/errors';

export const reviewService = {
  /**
   * Submit a product review
   */
  async submitReview(
    userId: string,
    data: {
      productId: string;
      orderId: string;
      rating: number;
      title?: string;
      comment?: string;
    }
  ) {
    const { productId, orderId, rating, title, comment } = data;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5 stars');
    }

    // Check if user already reviewed this product
    const existingReview = await reviewRepository.findByUserAndProduct(userId, productId);
    if (existingReview) {
      throw new ConflictError('You have already reviewed this product');
    }

    // Verify user has purchased the product
    const hasPurchased = await reviewRepository.hasUserPurchasedProduct(userId, productId);

    // Create review
    const review = await reviewRepository.create({
      userId,
      productId,
      orderId,
      rating,
      title,
      comment,
      verifiedPurchase: hasPurchased,
    });

    return review;
  },

  /**
   * Get reviews for a product
   */
  async getProductReviews(
    productId: string,
    options: {
      rating?: number;
      verifiedOnly?: boolean;
      page?: number;
      limit?: number;
      sortBy?: 'recent' | 'rating' | 'helpful';
    } = {}
  ) {
    const {
      rating,
      verifiedOnly,
      page = 1,
      limit = 20,
      sortBy = 'recent',
    } = options;

    const skip = (page - 1) * limit;

    const result = await reviewRepository.findByProduct(productId, {
      rating,
      verifiedOnly,
      skip,
      limit,
      sortBy,
    });

    const pages = Math.ceil(result.total / limit);

    return {
      reviews: result.reviews,
      pagination: {
        page,
        limit,
        total: result.total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Get review by ID
   */
  async getReviewById(id: string) {
    const review = await reviewRepository.findById(id);

    if (!review) {
      throw new NotFoundError('Review');
    }

    return review;
  },

  /**
   * Update a review
   */
  async updateReview(
    reviewId: string,
    userId: string,
    data: {
      rating?: number;
      title?: string;
      comment?: string;
    }
  ) {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review');
    }

    // Check ownership
    if (review.userId !== userId) {
      throw new AuthorizationError('You can only update your own reviews');
    }

    // Validate rating if provided
    if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
      throw new ValidationError('Rating must be between 1 and 5 stars');
    }

    const updated = await reviewRepository.update(reviewId, data);

    return updated;
  },

  /**
   * Delete a review
   */
  async deleteReview(reviewId: string, userId: string) {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review');
    }

    // Check ownership
    if (review.userId !== userId) {
      throw new AuthorizationError('You can only delete your own reviews');
    }

    await reviewRepository.delete(reviewId);

    return { message: 'Review deleted successfully' };
  },

  /**
   * Toggle helpful vote on a review
   */
  async toggleHelpful(reviewId: string, userId: string) {
    // Check if review exists
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review');
    }

    // Check if user is not reviewing their own review
    if (review.userId === userId) {
      throw new ValidationError('You cannot mark your own review as helpful');
    }

    const result = await reviewRepository.toggleHelpful(reviewId, userId);

    return {
      helpful: result.added,
      message: result.added 
        ? 'Review marked as helpful' 
        : 'Helpful mark removed',
    };
  },

  /**
   * Get product review statistics
   */
  async getProductStats(productId: string) {
    return reviewRepository.getProductStats(productId);
  },

  /**
   * Add seller response to a review
   */
  async addSellerResponse(
    reviewId: string,
    sellerId: string,
    response: string
  ) {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review');
    }

    // Verify seller owns the product
    if (review.product.sellerId !== sellerId) {
      throw new AuthorizationError('You can only respond to reviews of your products');
    }

    // Check if seller already responded
    if (review.sellerResponse) {
      throw new ConflictError('You have already responded to this review');
    }

    const updated = await reviewRepository.addSellerResponse(reviewId, response);

    return updated;
  },

  /**
   * Get seller's product reviews
   */
  async getSellerReviews(
    sellerId: string,
    options: {
      page?: number;
      limit?: number;
      needsResponse?: boolean;
    } = {}
  ) {
    const { page = 1, limit = 20, needsResponse } = options;
    const skip = (page - 1) * limit;

    const result = await reviewRepository.getSellerReviews(sellerId, {
      skip,
      limit,
      needsResponse,
    });

    const pages = Math.ceil(result.total / limit);

    return {
      reviews: result.reviews,
      pagination: {
        page,
        limit,
        total: result.total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Flag a review for moderation (Admin or users)
   */
  async flagReview(reviewId: string) {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review');
    }

    if (review.flagged) {
      throw new ConflictError('Review is already flagged');
    }

    await reviewRepository.flag(reviewId);

    return { message: 'Review flagged for admin review' };
  },

  /**
   * Moderate a review (Admin only)
   */
  async moderateReview(reviewId: string, approved: boolean) {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review');
    }

    await reviewRepository.moderate(reviewId, approved);

    return { 
      message: approved 
        ? 'Review approved successfully' 
        : 'Review rejected successfully',
    };
  },

  /**
   * Get flagged reviews (Admin only)
   */
  async getFlaggedReviews(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const result = await reviewRepository.getFlaggedReviews(skip, limit);

    const pages = Math.ceil(result.total / limit);

    return {
      reviews: result.reviews,
      pagination: {
        page,
        limit,
        total: result.total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  },

  /**
   * Delete review (Admin only)
   */
  async adminDeleteReview(reviewId: string) {
    const review = await reviewRepository.findById(reviewId);

    if (!review) {
      throw new NotFoundError('Review');
    }

    await reviewRepository.delete(reviewId);

    return { message: 'Review deleted successfully' };
  },
};
