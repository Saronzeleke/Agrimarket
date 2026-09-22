import { z } from 'zod';

// Validation schemas for address endpoints and  Ethiopian phone number pattern
const ethiopianPhonePattern = /^(?:\+251|0)?[97]\d{8}$/;

export const createAddressSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters').max(100),
  phone: z.string().regex(ethiopianPhonePattern, 'Invalid Ethiopian phone number format'),
  region: z.string().min(2, 'Region is required').max(50),
  zone: z.string().min(2, 'Zone is required').max(50),
  woreda: z.string().min(2, 'Woreda is required').max(50),
  kebele: z.string().min(1, 'Kebele is required').max(50),
  specificLocation: z.string().min(3, 'Specific location must be at least 3 characters').max(200),
  addressType: z.enum(['HOME', 'OFFICE']).optional().default('HOME'),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = z.object({
  fullName: z.string().min(3).max(100).optional(),
  phone: z.string().regex(ethiopianPhonePattern, 'Invalid Ethiopian phone number format').optional(),
  region: z.string().min(2).max(50).optional(),
  zone: z.string().min(2).max(50).optional(),
  woreda: z.string().min(2).max(50).optional(),
  kebele: z.string().min(1).max(50).optional(),
  specificLocation: z.string().min(3).max(200).optional(),
  addressType: z.enum(['HOME', 'OFFICE']).optional(),
  isDefault: z.boolean().optional(),
});

export const addressIdSchema = z.object({
  addressId: z.string().uuid('Invalid address ID'),
});

export type CreateAddress = z.infer<typeof createAddressSchema>;
export type UpdateAddress = z.infer<typeof updateAddressSchema>;
export type AddressId = z.infer<typeof addressIdSchema>;
