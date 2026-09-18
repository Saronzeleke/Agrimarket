import { orderRepository } from '../repositories/order.repository';
import { OrderStatus } from '@prisma/client';
import { BadRequestError } from '../utils/errors';

export const orderService = {
  /**
   * Get order by ID
   */
  async getOrder(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId, userId);

    return {
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
        variantInfo: item.variantInfo,
      })),
      payment: order.payment
        ? {
            id: order.payment.id,
            amount: Number(order.payment.amount),
            status: order.payment.status,
            provider: order.payment.provider,
            transactionId: order.payment.transactionId,
            paidAt: order.payment.paidAt,
          }
        : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      confirmedAt: order.confirmedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
    };
  },

  /**
   * Get order by order number
   */
  async getOrderByNumber(orderNumber: string, userId: string) {
    const order = await orderRepository.findByOrderNumber(orderNumber, userId);

    return this.formatOrder(order);
  },

  /**
   * Get all orders for customer
   */
  async getCustomerOrders(
    userId: string,
    options?: {
      status?: OrderStatus;
      page?: number;
      limit?: number;
    }
  ) {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const offset = (page - 1) * limit;

    const { orders, total } = await orderRepository.findByCustomerId(userId, {
      status: options?.status,
      limit,
      offset,
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      total: Number(order.total),
      itemCount: order.items.length,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        quantity: item.quantity,
        price: Number(item.price),
        image: item.product.images[0]?.url || null,
      })),
      paymentStatus: order.payment?.status || null,
      createdAt: order.createdAt,
      confirmedAt: order.confirmedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
    }));

    return {
      orders: formattedOrders,
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
   * Cancel order
   */
  async cancelOrder(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId, userId);

    // Only allow cancellation of pending/confirmed orders
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new BadRequestError(
        `Cannot cancel order with status: ${order.status}. Only PENDING or CONFIRMED orders can be cancelled.`
      );
    }

    // Cancel order
    const cancelledOrder = await orderRepository.cancel(orderId, userId);

    // Release reserved stock
    for (const item of cancelledOrder.items) {
      const inventory = await prisma.inventory.findUnique({
        where: { productId: item.productId },
      });

      if (inventory) {
        await prisma.inventory.update({
          where: { id: inventory.id },
          data: {
            reservedStock: {
              decrement: Math.min(item.quantity, inventory.reservedStock),
            },
          },
        });
      }
    }

    return this.formatOrder(cancelledOrder);
  },

  /**
   * Get order statistics
   */
  async getOrderStats(userId: string) {
    return orderRepository.getCustomerStats(userId);
  },

  /**
   * Format order for response
   */
  private formatOrder(order: any) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        unit: item.product.unit,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.price) * item.quantity,
        image: item.product.images[0]?.url || null,
        variantInfo: item.variantInfo,
      })),
      payment: order.payment
        ? {
            id: order.payment.id,
            amount: Number(order.payment.amount),
            status: order.payment.status,
            provider: order.payment.provider,
            transactionId: order.payment.transactionId,
            paidAt: order.payment.paidAt,
          }
        : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      confirmedAt: order.confirmedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
    };
  },
};

// Import prisma for inventory updates
import prisma from '../config/database';
