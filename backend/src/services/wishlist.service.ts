import { wishlistRepository } from '../repositories/wishlist.repository';
import { productRepository } from '../repositories/product.repository';
import { cartRepository } from '../repositories/cart.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const wishlistService = {
 // Get user's wishlist
  async getWishlist(userId: string) {
    const wishlist = await wishlistRepository.getOrCreateWishlist(userId);

    const items = wishlist.items.map((item) => {
      const product = item.product;
      const currentStock = product.inventory?.currentStock || 0;
      const isAvailable = product.active && currentStock > 0;

      return {
        id: item.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        unit: product.unit,
        rating: Number(product.rating),
        reviewCount: product.reviewCount,
        available: isAvailable,
        stock: currentStock,
        image: product.images[0]?.url || null,
        seller: product.seller,
        category: product.category,
        addedAt: item.createdAt,
      };
    });

    return {
      id: wishlist.id,
      items,
      itemCount: items.length,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
    };
  },
// Add product to wishlist
  async addToWishlist(userId: string, productId: string) {
    // Validate product exists
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Check if already in wishlist
    const isInWishlist = await wishlistRepository.isProductInWishlist(userId, productId);
    if (isInWishlist) {
      throw new BadRequestError('Product is already in wishlist');
    }

    // Add to wishlist
    const item = await wishlistRepository.addItem(userId, productId);

    return {
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.price),
      unit: item.product.unit,
      rating: Number(item.product.rating),
      reviewCount: item.product.reviewCount,
      stock: item.product.inventory?.currentStock || 0,
      image: item.product.images[0]?.url || null,
      seller: item.product.seller,
      addedAt: item.createdAt,
    };
  },
// Remove item from wishlist
  async removeFromWishlist(userId: string, itemId: string) {
    await wishlistRepository.removeItem(userId, itemId);
  },
//Remove product from wishlist by product ID
  async removeProductFromWishlist(userId: string, productId: string) {
    await wishlistRepository.removeItemByProductId(userId, productId);
  },
// Clear all items from wishlist
   
  async clearWishlist(userId: string) {
    await wishlistRepository.clearWishlist(userId);
  },
// Move item from wishlist to cart
  async moveToCart(userId: string, itemId: string, quantity: number = 1) {
    // Get wishlist to verify item exists
    const wishlist = await wishlistRepository.getOrCreateWishlist(userId);
    const wishlistItem = wishlist.items.find((item) => item.id === itemId);

    if (!wishlistItem) {
      throw new NotFoundError('Wishlist item not found');
    }

    const productId = wishlistItem.productId;

    // Validate product and stock
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (!product.active) {
      throw new BadRequestError('Product is not available');
    }

    const inventory = await productRepository.getInventory(productId);
    if (!inventory) {
      throw new BadRequestError('Product inventory not found');
    }

    const availableStock = inventory.currentStock - inventory.reservedStock;
    if (availableStock < quantity) {
      throw new BadRequestError(
        `Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`
      );
    }

    // Add to cart
    await cartRepository.addItem(userId, {
      productId,
      quantity,
    });

    // Remove from wishlist
    await wishlistRepository.removeItem(userId, itemId);

    return {
      success: true,
      message: 'Item moved to cart successfully',
    };
  },
// Move all available items from wishlist to cart
  async moveAllToCart(userId: string) {
    const wishlist = await wishlistRepository.getOrCreateWishlist(userId);
    
    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ productName: string; reason: string }>,
    };

    for (const item of wishlist.items) {
      try {
        const product = item.product;
        
        // Check if product is available
        if (!product.active) {
          results.failed++;
          results.errors.push({
            productName: product.name,
            reason: 'Product is not available',
          });
          continue;
        }

        const inventory = await productRepository.getInventory(product.id);
        if (!inventory) {
          results.failed++;
          results.errors.push({
            productName: product.name,
            reason: 'Inventory not found',
          });
          continue;
        }

        const availableStock = inventory.currentStock - inventory.reservedStock;
        if (availableStock < 1) {
          results.failed++;
          results.errors.push({
            productName: product.name,
            reason: 'Out of stock',
          });
          continue;
        }

        // Add to cart with quantity 1
        await cartRepository.addItem(userId, {
          productId: product.id,
          quantity: 1,
        });

        // Remove from wishlist
        await wishlistRepository.removeItem(userId, item.id);
        
        results.successful++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          productName: item.product.name,
          reason: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  },
//  Check if product is in wishlist
  async isInWishlist(userId: string, productId: string) {
    return wishlistRepository.isProductInWishlist(userId, productId);
  },
// Get wishlist item count
  async getWishlistItemCount(userId: string) {
    return wishlistRepository.getItemCount(userId);
  },
};
