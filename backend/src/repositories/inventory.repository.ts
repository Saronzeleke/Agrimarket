import { PrismaClient, InventoryHistoryType } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export interface UpdateInventoryData {
  currentStock?: number;
  reservedStock?: number;
  lowStockThreshold?: number;
}

export interface InventoryHistoryData {
  type: InventoryHistoryType;
  quantity: number;
  orderId?: string;
  notes?: string;
}

export const inventoryRepository = {
  //Create inventory for product
  
  async create(productId: string, data: { currentStock?: number; lowStockThreshold?: number }) {
    return prisma.inventory.create({
      data: {
        productId,
        currentStock: data.currentStock || 0,
        lowStockThreshold: data.lowStockThreshold || 10,
      },
    });
  },
//Get inventory by product ID
 
  async findByProductId(productId: string) {
    return prisma.inventory.findUnique({
      where: { productId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            unit: true,
          },
        },
      },
    });
  },
// Get inventory by ID

  async findById(inventoryId: string) {
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            unit: true,
            sellerId: true,
          },
        },
      },
    });

    if (!inventory) {
      throw new NotFoundError('Inventory not found');
    }

    return inventory;
  },
// Update inventory
 
  async update(inventoryId: string, data: UpdateInventoryData) {
    return prisma.inventory.update({
      where: { id: inventoryId },
      data,
    });
  },
// Adjust stock (add/subtract)
 
  async adjustStock(inventoryId: string, quantity: number, historyData: InventoryHistoryData) {
    return prisma.$transaction(async (tx) => {
      // Update inventory
      const inventory = await tx.inventory.update({
        where: { id: inventoryId },
        data: {
          currentStock: {
            increment: quantity,
          },
        },
      });

      // Create history entry
      await tx.inventoryHistory.create({
        data: {
          inventoryId,
          type: historyData.type,
          quantity: historyData.quantity,
          orderId: historyData.orderId,
          notes: historyData.notes,
        },
      });

      return inventory;
    });
  },
// Get inventory history
 
  async getHistory(inventoryId: string, options?: { limit?: number; offset?: number }) {
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    const [history, total] = await Promise.all([
      prisma.inventoryHistory.findMany({
        where: { inventoryId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.inventoryHistory.count({ where: { inventoryId } }),
    ]);

    return { history, total };
  },
// Get low stock products for seller
 
  async getLowStockBySeller(sellerId: string) {
    return prisma.inventory.findMany({
      where: {
        product: {
          sellerId,
          active: true,
        },
        OR: [
          {
            currentStock: {
              lte: prisma.inventory.fields.lowStockThreshold,
            },
          },
        ],
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            unit: true,
          },
        },
      },
      orderBy: {
        currentStock: 'asc',
      },
    });
  },
//Get out of stock products for seller
  
  async getOutOfStockBySeller(sellerId: string) {
    return prisma.inventory.findMany({
      where: {
        product: {
          sellerId,
          active: true,
        },
        currentStock: 0,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            unit: true,
          },
        },
      },
    });
  },
// Bulk update stock

  async bulkUpdateStock(updates: Array<{ inventoryId: string; quantity: number }>) {
    return prisma.$transaction(
      updates.map((update) =>
        prisma.inventory.update({
          where: { id: update.inventoryId },
          data: {
            currentStock: {
              increment: update.quantity,
            },
          },
        })
      )
    );
  },
//Get inventory statistics for seller
  
  async getSellerStats(sellerId: string) {
    const inventories = await prisma.inventory.findMany({
      where: {
        product: {
          sellerId,
          active: true,
        },
      },
    });

    const totalProducts = inventories.length;
    const totalStock = inventories.reduce((sum, inv) => sum + inv.currentStock, 0);
    const totalReserved = inventories.reduce((sum, inv) => sum + inv.reservedStock, 0);
    const lowStockCount = inventories.filter(
      (inv) => inv.currentStock <= inv.lowStockThreshold && inv.currentStock > 0
    ).length;
    const outOfStockCount = inventories.filter((inv) => inv.currentStock === 0).length;

    return {
      totalProducts,
      totalStock,
      totalReserved,
      availableStock: totalStock - totalReserved,
      lowStockCount,
      outOfStockCount,
      stockValue: 0, // Will be calculated in service with product prices
    };
  },
// Reserve stock for order
   
  async reserveStock(productId: string, quantity: number) {
    return prisma.inventory.update({
      where: { productId },
      data: {
        reservedStock: {
          increment: quantity,
        },
      },
    });
  },
// Release reserved stock
 
  async releaseStock(productId: string, quantity: number) {
    const inventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    if (!inventory) {
      throw new NotFoundError('Inventory not found');
    }

    return prisma.inventory.update({
      where: { productId },
      data: {
        reservedStock: {
          decrement: Math.min(quantity, inventory.reservedStock),
        },
      },
    });
  },
//Deduct stock on order fulfillment
  
  async deductStock(productId: string, quantity: number, orderId: string) {
    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { productId },
      });

      if (!inventory) {
        throw new NotFoundError('Inventory not found');
      }

      // Deduct from both current and reserved
      await tx.inventory.update({
        where: { productId },
        data: {
          currentStock: {
            decrement: quantity,
          },
          reservedStock: {
            decrement: Math.min(quantity, inventory.reservedStock),
          },
        },
      });

      // Create history entry
      await tx.inventoryHistory.create({
        data: {
          inventoryId: inventory.id,
          type: InventoryHistoryType.SALE,
          quantity: -quantity,
          orderId,
          notes: 'Stock deducted on order fulfillment',
        },
      });
    });
  },
};
