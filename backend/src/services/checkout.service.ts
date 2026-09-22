import { cartService } from './cart.service';
import { addressRepository } from '../repositories/address.repository';
import { orderRepository } from '../repositories/order.repository';
import { productRepository } from '../repositories/product.repository';
import { BadRequestError, NotFoundError } from '../utils/errors';

interface CheckoutData {
  addressId: string;
  notes?: string;
  paymentMethod: 'MOCK' | 'CHAPA' | 'TELEBIRR' | 'CBE_BIRR';
}

export const checkoutService = {
  /**
   * Calculate delivery fee based on region
   * In production, this would be more sophisticated
   */
  calculateDeliveryFee(region: string): number {
    const regionLower = region.toLowerCase();

    // Ethiopian delivery fee structure
    const feeStructure: Record<string, number> = {
      'addis ababa': 50,
      addis: 50,
      'dire dawa': 100,
      dire: 100,
      mekelle: 150,
      bahirdar: 120,
      'bahir dar': 120,
      hawassa: 120,
      jimma: 130,
      adama: 80,
      'dessie': 140,
      gondar: 150,
    };

    // Check for exact match or partial match
    for (const [key, fee] of Object.entries(feeStructure)) {
      if (regionLower.includes(key) || key.includes(regionLower)) {
        return fee;
      }
    }

    // Default fee for other regions
    return 150;
  },

  // Get checkout summary, Shows cart items, address, and calculated totals
  
  async getCheckoutSummary(userId: string, addressId?: string) {
    // Get cart
    const cart = await cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Check for unavailable items
    if (cart.summary.unavailableItemsCount > 0) {
      throw new BadRequestError(
        `Cart has ${cart.summary.unavailableItemsCount} unavailable items. Please remove them before checkout.`
      );
    }

    // Get address
    let shippingAddress = null;
    let deliveryFee = 0;

    if (addressId) {
      shippingAddress = await addressRepository.findById(addressId, userId);
      deliveryFee = this.calculateDeliveryFee(shippingAddress.region);
    } else {
      // Try to get default address
      const defaultAddress = await addressRepository.findDefault(userId);
      if (defaultAddress) {
        shippingAddress = defaultAddress;
        deliveryFee = this.calculateDeliveryFee(defaultAddress.region);
      }
    }

    // Calculate totals
    const subtotal = cart.summary.subtotal;
    const discount = 0; // TODO: Apply discounts/coupons in future
    const total = subtotal + deliveryFee - discount;

    return {
      cart: {
        items: cart.items,
        itemCount: cart.summary.itemCount,
        totalItems: cart.summary.totalItems,
      },
      shippingAddress,
      pricing: {
        subtotal,
        deliveryFee,
        discount,
        total,
      },
      canCheckout: !!shippingAddress,
    };
  },
 //  Process checkout and create order

  async processCheckout(userId: string, data: CheckoutData) {
    // Validate cart
    const cart = await cartService.getCart(userId);

    if (cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    // Validate cart items (stock, availability)
    const validation = await cartService.validateCart(userId);
    if (!validation.valid) {
      throw new BadRequestError('Cart validation failed', validation.issues);
    }

    // Get shipping address
    const shippingAddress = await addressRepository.findById(data.addressId, userId);

    // Calculate pricing
    const subtotal = cart.summary.subtotal;
    const deliveryFee = this.calculateDeliveryFee(shippingAddress.region);
    const discount = 0;
    const total = subtotal + deliveryFee - discount;

    // Generate order number
    const orderNumber = await orderRepository.generateOrderNumber();

    // Prepare order items
    const orderItems = cart.items.map((item) => ({
      productId: item.productId,
      sellerId: item.seller.id,
      quantity: item.quantity,
      price: item.price,
      variantInfo: item.variantId ? { variantId: item.variantId } : null,
    }));

    // Create order
    const order = await orderRepository.create({
      customerId: userId,
      orderNumber,
      subtotal,
      deliveryFee,
      discount,
      total,
      shippingAddress: {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        region: shippingAddress.region,
        zone: shippingAddress.zone,
        woreda: shippingAddress.woreda,
        kebele: shippingAddress.kebele,
        specificLocation: shippingAddress.specificLocation,
        addressType: shippingAddress.addressType,
      },
      notes: data.notes,
      items: orderItems,
    });

    // Reserve stock for order items
    for (const item of cart.items) {
      const inventory = await productRepository.getInventory(item.productId);
      if (inventory) {
        await prisma.inventory.update({
          where: { id: inventory.id },
          data: {
            reservedStock: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        provider: data.paymentMethod,
        status: 'PENDING',
      },
    });

    // Clear cart after successful order
    await cartService.clearCart(userId);

    // Return order with payment info
    return {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        discount: Number(order.discount),
        total: Number(order.total),
        shippingAddress: order.shippingAddress,
        notes: order.notes,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          unit: item.product.unit,
          quantity: item.quantity,
          price: Number(item.price),
          total: Number(item.price) * item.quantity,
          image: item.product.images[0]?.url || null,
        })),
        createdAt: order.createdAt,
      },
      payment: {
        id: payment.id,
        amount: Number(payment.amount),
        status: payment.status,
        provider: payment.provider,
      },
    };
  },
 // Get available payment methods
  getPaymentMethods() {
    return [
      {
        id: 'MOCK',
        name: 'Mock Payment (Development)',
        description: 'For testing purposes only',
        enabled: true,
        icon: 'credit-card',
      },
      {
        id: 'CHAPA',
        name: 'Chapa',
        description: 'Pay with Chapa - Mobile money, cards, and more',
        enabled: false, // Enable when integrated
        icon: 'chapa',
      },
      {
        id: 'TELEBIRR',
        name: 'telebirr',
        description: 'Pay with telebirr wallet',
        enabled: false, // Enable when integrated
        icon: 'telebirr',
      },
      {
        id: 'CBE_BIRR',
        name: 'CBE Birr',
        description: 'Pay with CBE Birr mobile banking',
        enabled: false, // Enable when integrated
        icon: 'cbe',
      },
    ];
  },
};

// Import prisma for inventory update
import prisma from '../config/database';
