import { cartRepository, AddToCartData, UpdateCartItemData } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const cartService = {
  /**
   * Get user's cart with calculated totals
   */
  async getCart(userId: string) {
    const cart = await cartRepository.getOrCreateCart(userId);

    // Calculate totals
    let subtotal = 0;
    let totalItems = 0;
    const unavailableItems: string[] = [];

    const items = cart.items.map((item) => {
      const product = item.product;
      const currentStock = product.inventory?.currentStock || 0;
      const isAvailable = product.active && currentStock >= item.quantity;

      if (!isAvailable) {
        unavailableItems.push(item.id);
      }

      const itemTotal = Number(product.price) * item.quantity;
      if (isAvailable) {
        subtotal += itemTotal;
      }
      totalItems += item.quantity;

      return {
        id: item.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        unit: product.unit,
        quantity: item.quantity,
        variantId: item.variantId,
        total: itemTotal,
        available: isAvailable,
        stock: currentStock,
        image: product.images[0]?.url || null,
        seller: product.seller,
        category: product.category,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    return {
      id: cart.id,
      items,
      summary: {
        subtotal,
        totalItems,
        itemCount: items.length,
        unavailableItemsCount: unavailableItems.length,
      },
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  },

  /**
   * Add item to cart with stock validation
   */
  async addToCart(userId: string, data: AddToCartData) {
    // Validate product exists and is active
    const product = await productRepository.findById(data.productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (!product.active) {
      throw new BadRequestError('Product is not available');
    }

    // Check stock availability
    const inventory = await productRepository.getInventory(data.productId);
    if (!inventory) {
      throw new BadRequestError('Product inventory not found');
    }

    const availableStock = inventory.currentStock - inventory.reservedStock;
    if (availableStock < data.quantity) {
      throw new BadRequestError(
        `Insufficient stock. Available: ${availableStock}, Requested: ${data.quantity}`
      );
    }

    // Check if already in cart
    const isInCart = await cartRepository.isProductInCart(userId, data.productId, data.variantId);
    if (isInCart) {
      // Get current quantity
      const cart = await cartRepository.getOrCreateCart(userId);
      const existingItem = cart.items.find(
        (item) => item.productId === data.productId && (item.variantId === data.variantId || (!item.variantId && !data.variantId))
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + data.quantity;
        if (availableStock < newQuantity) {
          throw new BadRequestError(
            `Insufficient stock. Available: ${availableStock}, Total requested: ${newQuantity}`
          );
        }
      }
    }

    // Add to cart
    const item = await cartRepository.addItem(userId, data);

    return {
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.price),
      unit: item.product.unit,
      quantity: item.quantity,
      variantId: item.variantId,
      total: Number(item.product.price) * item.quantity,
      stock: item.product.inventory?.currentStock || 0,
      image: item.product.images[0]?.url || null,
      seller: item.product.seller,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  /**
   * Update cart item quantity with stock validation
   */
  async updateCartItem(userId: string, itemId: string, data: UpdateCartItemData) {
    // Validate quantity
    if (data.quantity < 1) {
      throw new BadRequestError('Quantity must be at least 1');
    }

    if (data.quantity > 1000) {
      throw new BadRequestError('Quantity cannot exceed 1000');
    }

    // Get cart to verify item exists
    const cart = await cartRepository.getOrCreateCart(userId);
    const existingItem = cart.items.find((item) => item.id === itemId);

    if (!existingItem) {
      throw new NotFoundError('Cart item not found');
    }

    // Check stock availability
    const inventory = await productRepository.getInventory(existingItem.productId);
    if (!inventory) {
      throw new BadRequestError('Product inventory not found');
    }

    const availableStock = inventory.currentStock - inventory.reservedStock;
    if (availableStock < data.quantity) {
      throw new BadRequestError(
        `Insufficient stock. Available: ${availableStock}, Requested: ${data.quantity}`
      );
    }

    // Update item
    const item = await cartRepository.updateItem(userId, itemId, data);

    return {
      id: item.id,
      productId: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      price: Number(item.product.price),
      unit: item.product.unit,
      quantity: item.quantity,
      variantId: item.variantId,
      total: Number(item.product.price) * item.quantity,
      stock: item.product.inventory?.currentStock || 0,
      image: item.product.images[0]?.url || null,
      seller: item.product.seller,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: string, itemId: string) {
    await cartRepository.removeItem(userId, itemId);
  },

  /**
   * Clear all items from cart
   */
  async clearCart(userId: string) {
    await cartRepository.clearCart(userId);
  },

  /**
   * Get cart item count
   */
  async getCartItemCount(userId: string) {
    return cartRepository.getItemCount(userId);
  },

  /**
   * Validate cart before checkout
   * Returns list of issues if any
   */
  async validateCart(userId: string) {
    const cart = await cartRepository.getOrCreateCart(userId);
    const issues: Array<{ itemId: string; productName: string; issue: string }> = [];

    for (const item of cart.items) {
      const product = item.product;

      // Check if product is active
      if (!product.active) {
        issues.push({
          itemId: item.id,
          productName: product.name,
          issue: 'Product is no longer available',
        });
        continue;
      }

      // Check stock
      const inventory = await productRepository.getInventory(product.id);
      if (!inventory) {
        issues.push({
          itemId: item.id,
          productName: product.name,
          issue: 'Product inventory not found',
        });
        continue;
      }

      const availableStock = inventory.currentStock - inventory.reservedStock;
      if (availableStock < item.quantity) {
        issues.push({
          itemId: item.id,
          productName: product.name,
          issue: `Insufficient stock. Available: ${availableStock}, In cart: ${item.quantity}`,
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  },
};
