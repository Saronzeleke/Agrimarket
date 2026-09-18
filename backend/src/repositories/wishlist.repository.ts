import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export const wishlistRepository = {
  /**
   * Get or create user's wishlist
   */
  async getOrCreateWishlist(userId: string) {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                seller: {
                  select: {
                    id: true,
                    businessName: true,
                    verified: true,
                    rating: true,
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
                    url: true,
                    alt: true,
                  },
                  take: 1,
                  orderBy: {
                    order: 'asc',
                  },
                },
                inventory: {
                  select: {
                    currentStock: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  seller: {
                    select: {
                      id: true,
                      businessName: true,
                      verified: true,
                      rating: true,
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
                      url: true,
                      alt: true,
                    },
                    take: 1,
                    orderBy: {
                      order: 'asc',
                    },
                  },
                  inventory: {
                    select: {
                      currentStock: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    }

    return wishlist;
  },

  /**
   * Add item to wishlist
   */
  async addItem(userId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    // Check if item already exists
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existingItem) {
      // Already in wishlist, return existing item
      return prisma.wishlistItem.findUnique({
        where: { id: existingItem.id },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  businessName: true,
                  verified: true,
                  rating: true,
                },
              },
              images: {
                select: {
                  url: true,
                  alt: true,
                },
                take: 1,
                orderBy: {
                  order: 'asc',
                },
              },
              inventory: {
                select: {
                  currentStock: true,
                },
              },
            },
          },
        },
      });
    }

    // Create new wishlist item
    return prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                businessName: true,
                verified: true,
                rating: true,
              },
            },
            images: {
              select: {
                url: true,
                alt: true,
              },
              take: 1,
              orderBy: {
                order: 'asc',
              },
            },
            inventory: {
              select: {
                currentStock: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Remove item from wishlist
   */
  async removeItem(userId: string, itemId: string): Promise<void> {
    const wishlist = await this.getOrCreateWishlist(userId);

    // Verify item belongs to user's wishlist
    const item = await prisma.wishlistItem.findFirst({
      where: {
        id: itemId,
        wishlistId: wishlist.id,
      },
    });

    if (!item) {
      throw new NotFoundError('Wishlist item not found');
    }

    await prisma.wishlistItem.delete({
      where: { id: itemId },
    });
  },

  /**
   * Remove item by product ID
   */
  async removeItemByProductId(userId: string, productId: string): Promise<void> {
    const wishlist = await this.getOrCreateWishlist(userId);

    const item = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (!item) {
      throw new NotFoundError('Product not in wishlist');
    }

    await prisma.wishlistItem.delete({
      where: { id: item.id },
    });
  },

  /**
   * Clear all items from wishlist
   */
  async clearWishlist(userId: string): Promise<void> {
    const wishlist = await this.getOrCreateWishlist(userId);

    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id },
    });
  },

  /**
   * Check if product is in wishlist
   */
  async isProductInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlist = await this.getOrCreateWishlist(userId);

    const item = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    return !!item;
  },

  /**
   * Get wishlist item count
   */
  async getItemCount(userId: string): Promise<number> {
    const wishlist = await this.getOrCreateWishlist(userId);

    return prisma.wishlistItem.count({
      where: { wishlistId: wishlist.id },
    });
  },
};
