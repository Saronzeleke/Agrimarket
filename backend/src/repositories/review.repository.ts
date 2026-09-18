/**
 * Review Repository
 * 
 * Database operations for product reviews and ratings.
 */

import prisma from '../config/database';
import { Prisma } from '@prisma/client';

export const reviewRepository = {
  /**
   * Create a new review
   */
  async create(data: {
    userId: string;
    productId: string;
    orderId: string;
    rating: number;
    title?: string;
    comment?: string;
    verifiedPurchase?: boolean;
  }) {
    return prisma.review.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  /**
   * Find review by ID
   */
  async findById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            sellerId: true,
          },
        },
        helpfulVotes: {
          select: {
            userId: true,
          },
        },
      },
    });
  },

  /**
   * Find review by user and product
   */
  async findByUserAndProduct(userId: string, productId: string) {
    return prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  },

  /**
   * Get reviews for a product with pagination
   */
  async findByProduct(
    productId: string,
    options: {
      rating?: number;
      verifiedOnly?: boolean;
      approved?: boolean;
      skip?: number;
      limit?: number;
      sortBy?: 'recent' | 'rating' | 'helpful';
    } = {}
  ) {
    const {
      rating,
      verifiedOnly,
      approved = true,
      skip = 0,
      limit = 20,
      sortBy = 'recent',
    } = options;

    const where: Prisma.ReviewWhereInput = {
      productId,
      approved,
      ...(rating && { rating }),
      ...(verifiedOnly && { verifiedPurchase: true }),
    };

    const orderBy: Prisma.ReviewOrderByWithRelationInput = 
      sortBy === 'helpful' 
        ? { helpful: 'desc' }
        : sortBy === 'rating'
        ? { rating: 'desc' }
        : { createdAt: 'desc' };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          helpfulVotes: {
            select: {
              userId: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total };
  },

  /**
   * Get review statistics for a product
   */
  async getProductStats(productId: string) {
    const [stats, distribution] = await Promise.all([
      prisma.review.aggregate({
        where: { productId, approved: true },
        _avg: { rating: true },
        _count: { id: true },
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId, approved: true },
        _count: true,
      }),
    ]);

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    distribution.forEach((item) => {
      ratingDistribution[item.rating as 1 | 2 | 3 | 4 | 5] = item._count;
    });

    const verifiedCount = await prisma.review.count({
      where: { productId, approved: true, verifiedPurchase: true },
    });

    return {
      averageRating: Number(stats._avg.rating || 0),
      totalReviews: stats._count.id,
      ratingDistribution,
      verifiedPercentage: stats._count.id > 0 
        ? (verifiedCount / stats._count.id) * 100 
        : 0,
    };
  },

  /**
   * Update a review
   */
  async update(id: string, data: Prisma.ReviewUpdateInput) {
    return prisma.review.update({
      where: { id },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  },

  /**
   * Delete a review
   */
  async delete(id: string) {
    return prisma.review.delete({
      where: { id },
    });
  },

  /**
   * Add seller response to a review
   */
  async addSellerResponse(id: string, response: string) {
    return prisma.review.update({
      where: { id },
      data: {
        sellerResponse: response,
        respondedAt: new Date(),
      },
    });
  },

  /**
   * Check if user has purchased a product
   */
  async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: 'DELIVERED', // Only delivered orders count
        },
      },
    });

    return !!orderItem;
  },

  /**
   * Mark/unmark review as helpful
   */
  async toggleHelpful(reviewId: string, userId: string) {
    const existing = await prisma.helpfulVote.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    if (existing) {
      // Remove vote
      await prisma.$transaction([
        prisma.helpfulVote.delete({
          where: { id: existing.id },
        }),
        prisma.review.update({
          where: { id: reviewId },
          data: { helpful: { decrement: 1 } },
        }),
      ]);
      return { added: false };
    } else {
      // Add vote
      await prisma.$transaction([
        prisma.helpfulVote.create({
          data: {
            userId,
            reviewId,
          },
        }),
        prisma.review.update({
          where: { id: reviewId },
          data: { helpful: { increment: 1 } },
        }),
      ]);
      return { added: true };
    }
  },

  /**
   * Check if user has voted a review as helpful
   */
  async hasUserVotedHelpful(userId: string, reviewId: string): Promise<boolean> {
    const vote = await prisma.helpfulVote.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
    });

    return !!vote;
  },

  /**
   * Flag a review for moderation
   */
  async flag(id: string) {
    return prisma.review.update({
      where: { id },
      data: { flagged: true },
    });
  },

  /**
   * Moderate a review (approve/reject)
   */
  async moderate(id: string, approved: boolean) {
    return prisma.review.update({
      where: { id },
      data: { 
        approved,
        flagged: false, // Unflag when moderated
      },
    });
  },

  /**
   * Get flagged reviews for admin review
   */
  async getFlaggedReviews(skip: number = 0, limit: number = 20) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { flagged: true },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              sellerId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { flagged: true } }),
    ]);

    return { reviews, total };
  },

  /**
   * Get seller's product reviews
   */
  async getSellerReviews(
    sellerId: string,
    options: {
      skip?: number;
      limit?: number;
      needsResponse?: boolean;
    } = {}
  ) {
    const { skip = 0, limit = 20, needsResponse } = options;

    const where: Prisma.ReviewWhereInput = {
      product: {
        sellerId,
      },
      approved: true,
      ...(needsResponse && { sellerResponse: null }),
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return { reviews, total };
  },
};
