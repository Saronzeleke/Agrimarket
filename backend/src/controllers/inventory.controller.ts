import { Request, Response } from 'express';
import { inventoryService } from '../services/inventory.service';
import {
  updateInventorySchema,
  addStockSchema,
  adjustStockSchema,
  inventoryHistorySchema,
  bulkAddStockSchema,
  inventoryIdSchema,
  productIdSchema,
} from '../validators/inventory.validator';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export const inventoryController = {
  /**
   * Get inventory for product
   * GET /api/v1/seller/inventory/product/:productId
   */
  async getInventory(req: Request, res: Response) {
    const validation = productIdSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid product ID', validation.error.issues);
    }

    const userId = req.user!.id;
    const { productId } = validation.data;

    const inventory = await inventoryService.getInventory(productId, userId);

    successResponse(res, { inventory }, 'Inventory retrieved successfully');
  },

  /**
   * Update inventory
   * PATCH /api/v1/seller/inventory/:inventoryId
   */
  async updateInventory(req: Request, res: Response) {
    const idValidation = inventoryIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      throw new BadRequestError('Invalid inventory ID', idValidation.error.issues);
    }

    const dataValidation = updateInventorySchema.safeParse(req.body);
    if (!dataValidation.success) {
      throw new BadRequestError('Invalid inventory data', dataValidation.error.issues);
    }

    const userId = req.user!.id;
    const { inventoryId } = idValidation.data;

    const inventory = await inventoryService.updateInventory(
      inventoryId,
      userId,
      dataValidation.data
    );

    successResponse(res, { inventory }, 'Inventory updated successfully');
  },

  /**
   * Add stock
   * POST /api/v1/seller/inventory/:inventoryId/add
   */
  async addStock(req: Request, res: Response) {
    const idValidation = inventoryIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      throw new BadRequestError('Invalid inventory ID', idValidation.error.issues);
    }

    const dataValidation = addStockSchema.safeParse(req.body);
    if (!dataValidation.success) {
      throw new BadRequestError('Invalid stock data', dataValidation.error.issues);
    }

    const userId = req.user!.id;
    const { inventoryId } = idValidation.data;
    const { quantity, notes } = dataValidation.data;

    const result = await inventoryService.addStock(inventoryId, userId, quantity, notes);

    successResponse(res, result, 'Stock added successfully');
  },

  /**
   * Adjust stock
   * POST /api/v1/seller/inventory/:inventoryId/adjust
   */
  async adjustStock(req: Request, res: Response) {
    const idValidation = inventoryIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      throw new BadRequestError('Invalid inventory ID', idValidation.error.issues);
    }

    const dataValidation = adjustStockSchema.safeParse(req.body);
    if (!dataValidation.success) {
      throw new BadRequestError('Invalid adjustment data', dataValidation.error.issues);
    }

    const userId = req.user!.id;
    const { inventoryId } = idValidation.data;
    const { quantity, reason } = dataValidation.data;

    const result = await inventoryService.adjustStock(inventoryId, userId, quantity, reason);

    successResponse(res, result, 'Stock adjusted successfully');
  },

  /**
   * Get inventory history
   * GET /api/v1/seller/inventory/:inventoryId/history?page=1&limit=50
   */
  async getHistory(req: Request, res: Response) {
    const idValidation = inventoryIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      throw new BadRequestError('Invalid inventory ID', idValidation.error.issues);
    }

    const queryValidation = inventoryHistorySchema.safeParse(req.query);
    if (!queryValidation.success) {
      throw new BadRequestError('Invalid query parameters', queryValidation.error.issues);
    }

    const userId = req.user!.id;
    const { inventoryId } = idValidation.data;

    const result = await inventoryService.getHistory(inventoryId, userId, queryValidation.data);

    successResponse(res, result, 'Inventory history retrieved successfully');
  },

  /**
   * Get low stock products
   * GET /api/v1/seller/inventory/low-stock
   */
  async getLowStockProducts(req: Request, res: Response) {
    const userId = req.user!.id;
    const products = await inventoryService.getLowStockProducts(userId);

    successResponse(res, { products }, 'Low stock products retrieved successfully');
  },

  /**
   * Get out of stock products
   * GET /api/v1/seller/inventory/out-of-stock
   */
  async getOutOfStockProducts(req: Request, res: Response) {
    const userId = req.user!.id;
    const products = await inventoryService.getOutOfStockProducts(userId);

    successResponse(res, { products }, 'Out of stock products retrieved successfully');
  },

  /**
   * Get inventory statistics
   * GET /api/v1/seller/inventory/stats
   */
  async getStats(req: Request, res: Response) {
    const userId = req.user!.id;
    const stats = await inventoryService.getInventoryStats(userId);

    successResponse(res, { stats }, 'Inventory statistics retrieved successfully');
  },

  /**
   * Bulk add stock
   * POST /api/v1/seller/inventory/bulk-add
   */
  async bulkAddStock(req: Request, res: Response) {
    const validation = bulkAddStockSchema.safeParse(req.body);

    if (!validation.success) {
      throw new BadRequestError('Invalid bulk update data', validation.error.issues);
    }

    const userId = req.user!.id;
    const { updates } = validation.data;

    const result = await inventoryService.bulkAddStock(userId, updates);

    successResponse(res, result, 'Bulk stock update completed successfully');
  },
};
