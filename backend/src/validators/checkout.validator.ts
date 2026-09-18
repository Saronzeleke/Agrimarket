import { z } from 'zod';

/**
 * Validation schemas for checkout endpoints
 */

export const checkoutSummarySchema = z.object({
  addressId: z.string().uuid('Invalid address ID').optional(),
});

export const processCheckoutSchema = z.object({
  addressId: z.string().uuid('Invalid address ID'),
  notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
  paymentMethod: z.enum(['MOCK', 'CHAPA', 'TELEBIRR', 'CBE_BIRR'], {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
});

export type CheckoutSummary = z.infer<typeof checkoutSummarySchema>;
export type ProcessCheckout = z.infer<typeof processCheckoutSchema>;
