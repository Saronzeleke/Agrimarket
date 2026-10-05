import { checkoutService } from '../../src/services/checkout.service';
import { processCheckoutSchema } from '../../src/validators/checkout.validator';

describe('checkout payment availability', () => {
  it('does not advertise payment methods without a real provider', () => {
    expect(checkoutService.getPaymentMethods()).toEqual([]);
  });

  it('rejects checkout before creating an order when no provider is available', async () => {
    await expect(
      checkoutService.processCheckout('user-id', {
        addressId: 'address-id',
        paymentMethod: 'CHAPA',
      })
    ).rejects.toThrow('Checkout is unavailable because no payment provider is configured');
  });

  it('rejects the mock payment method at request validation', () => {
    const result = processCheckoutSchema.safeParse({
      addressId: 'e140f4d9-05e2-4f49-9c80-3d26788d7f9b',
      paymentMethod: 'MOCK',
    });

    expect(result.success).toBe(false);
  });
});