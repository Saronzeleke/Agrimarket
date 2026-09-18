import { InventoryHistoryType } from '@prisma/client';
import { inventoryRepository, UpdateInventoryData } from '../repositories/inventory.repository';
import prisma from '../config/database';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';

export const inventoryService = {
  /**
   * Get inventory for product
   */
  async getInventory(productId: string, userId: string) {
    const inventory = await inventoryRepository.findByProductId(productId);

    if (!inventory) {
      throw new NotFoundError('Inventory not found for this product');
    }

    // Check if user owns this product (for sellers)
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { sellerId: true },
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Get seller ID from user
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (sellerProfile && product.sellerId !== sellerProfile.id) {
      throw new ForbiddenError('You can only view inventory for your own products');
    }

    const availableStock = inventory.currentStock - inventory.reservedStock;

    return {
      id: inventory.id,
      productId: inventory.productId,
      product: {
        id: inventory.product.id,
        name: inventory.product.name,
        slug: inventory.product.slug,
        price: Number(inventory.product.price),
        unit: inventory.product.unit,
      },
      currentStock: inventory.currentStock,
      reservedStock: inventory.reservedStock,
      availableStock,
      lowStockThreshold: inventory.lowStockThreshold,
      isLowStock: inventory.currentStock <= inventory.lowStockThreshold,
      isOutOfStock: inventory.currentStock === 0,
      updatedAt: inventory.updatedAt,
    };
  },

  /**
   * Update inventory (seller only)
   */
  async updateInventory(
    inventoryId: string,
    userId: string,
    data: UpdateInventoryData
  ) {
    const inventory = await inventoryRepository.findById(inventoryId);

    // Verify ownership
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!sellerProfile || inventory.product.sellerId !== sellerProfile.id) {
      throw new ForbiddenError('You can only update inventory for your own products');
    }

    // Validate data
    if (data.currentStock !== undefined && data.currentStock < 0) {
      throw new BadRequestError('Current stock cannot be negative');
    }

    if (data.reservedStock !== undefined && data.reservedStock < 0) {
      throw new BadRequestError('Reserved stock cannot be negative');
    }

    if (data.lowStockThreshold !== undefined && data.lowStockThreshold < 0) {
      throw new BadRequestError('Low stock threshold cannot be negative');
    }

    const updatedInventory = await inventoryRepository.update(inventoryId, data);

    return {
      id: updatedInventory.id,
      currentStock: updatedInventory.currentStock,
      reservedStock: updatedInventory.reservedStock,
      lowStockThreshold: updatedInventory.lowStockThreshold,
      updatedAt: updatedInventory.updatedAt,
    };
  },

  /**
   * Add stock (seller only)
   */
  async addStock(
    inventoryId: string,
    userId: string,
    quantity: number,
    notes?: string
  ) {
    if (quantity <= 0) {
      throw new BadRequestError('Quantity must be positive');
    }

    const inventory = await inventoryRepository.findById(inventoryId);

    // Verify ownership
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!sellerProfile || inventory.product.sellerId !== sellerProfile.id) {
      throw new ForbiddenError('You can only update inventory for your own products');
    }

    const updatedInventory = await inventoryRepository.adjustStock(inventoryId, quantity, {
      type: InventoryHistoryType.ADDITION,
      quantity: quantity,
      notes: notes || 'Stock added by seller',
    });

    return {
      id: updatedInventory.id,
      currentStock: updatedInventory.currentStock,
      addedQuantity: quantity,
      message: `Successfully added ${quantity} units to inventory`,
    };
  },

  /**
   * Adjust stock with reason (seller only)
   */
  async adjustStock(
    inventoryId: string,
    userId: string,
    quantity: number,
    reason: string
  ) {
    if (quantity === 0) {
      throw new BadRequestError('Quantity cannot be zero');
    }

    const inventory = await inventoryRepository.findById(inventoryId);

    // Verify ownership
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!sellerProfile || inventory.product.sellerId !== sellerProfile.id) {
      throw new ForbiddenError('You can only adjust inventory for your own products');
    }

    // Check if adjustment would result in negative stock
    if (inventory.currentStock + quantity < 0) {
      throw new BadRequestError(
        `Cannot adjust stock by ${quantity}. Current stock: ${inventory.currentStock}`
      );
    }

    const updatedInventory = await inventoryRepository.adjustStock(inventoryId, quantity, {
      type: InventoryHistoryType.ADJUSTMENT,
      quantity: quantity,
      notes: reason,
    });

    return {
      id: updatedInventory.id,
      currentStock: updatedInventory.currentStock,
      adjustment: quantity,
      message: `Stock adjusted by ${quantity} units`,
    };
  },

  /**
   * Get inventory history
   */
  async getHistory(
    inventoryId: string,
    userId: string,
    options?: { page?: number; limit?: number }
  ) {
    const inventory = await inventoryRepository.findById(inventoryId);

    // Verify ownership
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!sellerProfile || inventory.product.sellerId !== sellerProfile.id) {
      throw new ForbiddenError('You can only view inventory history for your own products');
    }

    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 50, 100);
    const offset = (page - 1) * limit;

    const { history, total } = await inventoryRepository.getHistory(inventoryId, {
      limit,
      offset,
    });

    return {
      history: history.map((entry) => ({
        id: entry.id,
        type: entry.type,
        quantity: entry.quantity,
        orderId: entry.orderId,
        notes: entry.notes,
        createdAt: entry.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  },

  /**
   * Get low stock products (seller)
   */
  async getLowStockProducts(userId: string) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!sellerProfile) {
      throw new BadRequestError('User is not a seller');
    }

    const inventories = await inventoryRepository.getLowStockBySeller(sellerProfile.id);

    return inventories.map((inv) => ({
      id: inv.id,
      productId: inv.productId,
      product: {
        id: inv.product.id,
        name: inv.product.name,
        slug: inv.product.slug,
        price: Number(inv.product.price),
        unit: inv.product.unit,
      },
      currentStock: inv.currentStock,
      reservedStock: inv.reservedStock,
      availableStock: inv.currentStock - inv.reservedStock,
      lowStockThreshold: inv.lowStockThreshold,
      updatedAt: inv.updatedAt,
    }));
  },

  /**
   * Get out of stock products (seller)
   */
  async getOutOfStockProducts(userId: string) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!sellerProfile) {
      throw new BadRequestError('User is not a seller');
    }

    const inventories = await inventoryRepository.getOutOfStockBySeller(sellerProfile.id);

    return inventories.map((inv) => ({
      id: inv.id,
      productId: inv.productId,
      product: {
        id: inv.product.id,
        name: inv.product.name,
        slug: inv.product.slug,
        price: Number(inv.product.price),
        unit: inv.product.unit,
      },
      currentStock: inv.currentStock,
      reservedStock: inv.reservedStock,
      lowStockThreshold: inv.lowStockThreshold,
      updatedAt: inv.updatedAt,
    }));
  },

  /**
   * Get inventory statistics (seller)
   */
  async getInventoryStats(userId: string) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!sellerProfile) {
      throw new BadRequestError('User is not a seller');
    }

    const stats = await inventoryRepository.getSellerStats(sellerProfile.id);

    // Calculate stock value
    const inventories = await prisma.inventory.findMany({
      where: {
        product: {
          sellerId: sellerProfile.id,
          active: true,
        },
      },
      include: {
        product: {
          select: {
            price: true,
          },
        },
      },
    });

    const stockValue = inventories.reduce(
      (sum, inv) => sum + inv.currentStock * Number(inv.product.price),
      0
    );

    return {
      ...stats,
      stockValue,
    };
  },

  /**
   * Bulk update stock (seller only)
   */
  async bulkAddStock(
    userId: string,
    updates: Array<{ productId: string; quantity: number }>
  ) {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!sellerProfile) {
      throw new BadRequestError('User is not a seller');
    }

    // Verify all products belong to seller
    const productIds = updates.map((u) => u.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        sellerId: sellerProfile.id,
      },
      select: {
        id: true,
      },
    });

    if (products.length !== productIds.length) {
      throw new ForbiddenError('Some products do not belong to you');
    }

    // Get inventory IDs
    const inventories = await prisma.inventory.findMany({
      where: {
        productId: { in: productIds },
      },
      select: {
        id: true,
        productId: true,
      },
    });

    const inventoryMap = new Map(inventories.map((inv) => [inv.productId, inv.id]));

    // Prepare bulk updates
    const bulkUpdates = updates.map((update) => ({
      inventoryId: inventoryMap.get(update.productId)!,
      quantity: update.quantity,
    }));

    await inventoryRepository.bulkUpdateStock(bulkUpdates);

    return {
      updatedCount: bulkUpdates.length,
      message: `Successfully updated stock for ${bulkUpdates.length} products`,
    };
  },
};
