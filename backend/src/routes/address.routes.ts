import { Router } from 'express';
import { addressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/helpers';

const router = Router();

/**
 * All address routes require authentication
 */

// Get default address (must be before /:addressId)
router.get('/default', authenticate, asyncHandler(addressController.getDefaultAddress));

// Get all addresses
router.get('/', authenticate, asyncHandler(addressController.getAddresses));

// Create address
router.post('/', authenticate, asyncHandler(addressController.createAddress));

// Get address by ID
router.get('/:addressId', authenticate, asyncHandler(addressController.getAddress));

// Update address
router.patch('/:addressId', authenticate, asyncHandler(addressController.updateAddress));

// Set as default
router.post('/:addressId/set-default', authenticate, asyncHandler(addressController.setDefaultAddress));

// Delete address
router.delete('/:addressId', authenticate, asyncHandler(addressController.deleteAddress));

export default router;
