import { Request, Response } from 'express';
import { addressService } from '../services/address.service';
import {
  createAddressSchema,
  updateAddressSchema,
  addressIdSchema,
} from '../validators/address.validator';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

export const addressController = {
  /**
   * Create new address
   * POST /api/v1/addresses
   */
  async createAddress(req: Request, res: Response) {
    const validation = createAddressSchema.safeParse(req.body);

    if (!validation.success) {
      throw new BadRequestError('Invalid address data', validation.error.issues);
    }

    const userId = req.user!.id;
    const address = await addressService.createAddress(userId, validation.data);

    successResponse(res, { address }, 'Address created successfully', 201);
  },

  /**
   * Get all user addresses
   * GET /api/v1/addresses
   */
  async getAddresses(req: Request, res: Response) {
    const userId = req.user!.id;
    const addresses = await addressService.getAddresses(userId);

    successResponse(res, { addresses }, 'Addresses retrieved successfully');
  },

  /**
   * Get address by ID
   * GET /api/v1/addresses/:addressId
   */
  async getAddress(req: Request, res: Response) {
    const validation = addressIdSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid address ID', validation.error.issues);
    }

    const userId = req.user!.id;
    const { addressId } = validation.data;

    const address = await addressService.getAddress(addressId, userId);

    successResponse(res, { address }, 'Address retrieved successfully');
  },

  /**
   * Get default address
   * GET /api/v1/addresses/default
   */
  async getDefaultAddress(req: Request, res: Response) {
    const userId = req.user!.id;
    const address = await addressService.getDefaultAddress(userId);

    successResponse(res, { address }, 'Default address retrieved successfully');
  },

  /**
   * Update address
   * PATCH /api/v1/addresses/:addressId
   */
  async updateAddress(req: Request, res: Response) {
    const idValidation = addressIdSchema.safeParse(req.params);
    if (!idValidation.success) {
      throw new BadRequestError('Invalid address ID', idValidation.error.issues);
    }

    const dataValidation = updateAddressSchema.safeParse(req.body);
    if (!dataValidation.success) {
      throw new BadRequestError('Invalid address data', dataValidation.error.issues);
    }

    const userId = req.user!.id;
    const { addressId } = idValidation.data;

    const address = await addressService.updateAddress(addressId, userId, dataValidation.data);

    successResponse(res, { address }, 'Address updated successfully');
  },

  /**
   * Set address as default
   * POST /api/v1/addresses/:addressId/set-default
   */
  async setDefaultAddress(req: Request, res: Response) {
    const validation = addressIdSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid address ID', validation.error.issues);
    }

    const userId = req.user!.id;
    const { addressId } = validation.data;

    const address = await addressService.setDefaultAddress(addressId, userId);

    successResponse(res, { address }, 'Default address updated successfully');
  },

  /**
   * Delete address
   * DELETE /api/v1/addresses/:addressId
   */
  async deleteAddress(req: Request, res: Response) {
    const validation = addressIdSchema.safeParse(req.params);

    if (!validation.success) {
      throw new BadRequestError('Invalid address ID', validation.error.issues);
    }

    const userId = req.user!.id;
    const { addressId } = validation.data;

    await addressService.deleteAddress(addressId, userId);

    successResponse(res, null, 'Address deleted successfully');
  },
};
