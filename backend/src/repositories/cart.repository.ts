import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export interface AddToCartData {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

export const cartRepository = {
  /**
   * Get or create user's cart
   */
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
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
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
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
          },
        },
      });
    }

    return cart;
  },

  /**
   * Add item to cart or update quantity if already exists
   */
  async addItem(userId: string, data: AddToCartData) {
    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId: data.productId,
          variantId: data.variantId || null,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + data.quantity,
        },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  businessName: true,
                  verified: true,
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

    // Create new cart item
    return prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
      },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                businessName: true,
                verified: true,
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
   * Update cart item quantity
   */
  async updateItem(userId: string, itemId: string, data: UpdateCartItemData) {
    const cart = await this.getOrCreateCart(userId);

    // Verify item belongs to user's cart
    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundError('Cart item not found');
    }

    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                businessName: true,
                verified: true,
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
   * Remove item from cart
   */
  async removeItem(userId: string, itemId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId);

    // Verify item belongs to user's cart
    const item = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cartId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundError('Cart item not found');
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });
  },

  /**
   * Clear all items from cart
   */
  async clearCart(userId: string): Promise<void> {
    const cart = await this.getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });
  },

  /**
   * Get cart item count
   */
  async getItemCount(userId: string): Promise<number> {
    const cart = await this.getOrCreateCart(userId);

    const result = await prisma.cartItem.aggregate({
      where: { cartId: cart.id },
      _sum: {
        quantity: true,
      },
    });

    return result._sum.quantity || 0;
  },

  /**
   * Check if product is in cart
   */
  async isProductInCart(userId: string, productId: string, variantId?: string): Promise<boolean> {
    const cart = await this.getOrCreateCart(userId);

    const item = await prisma.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
        },
      },
    });

    return !!item;
  },
};
