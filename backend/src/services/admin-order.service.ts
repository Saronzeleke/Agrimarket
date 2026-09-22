import { OrderStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const adminOrderService = {
  // Get all orders with filters (admin view)
   
  async getAllOrders(options?: {
    status?: OrderStatus;
    customerId?: string;
    sellerId?: string;
    page?: number;
    limit?: number;
    search?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 100);
    const offset = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderWhereInput = {};

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.customerId) {
      where.customerId = options.customerId;
    }

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    if (options?.search) {
      where.OR = [
        { orderNumber: { contains: options.search, mode: 'insensitive' } },
        { customer: { firstName: { contains: options.search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: options.search, mode: 'insensitive' } } },
        { customer: { email: { contains: options.search, mode: 'insensitive' } } },
      ];
    }

    // If filtering by seller, need to check order items
    let orders;
    let total;

    if (options?.sellerId) {
      const orderItems = await prisma.orderItem.findMany({
        where: { sellerId: options.sellerId },
        select: { orderId: true },
        distinct: ['orderId'],
      });

      const orderIds = orderItems.map((item) => item.orderId);
      where.id = { in: orderIds };
    }

    [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          items: {
            select: {
              id: true,
              productId: true,
              sellerId: true,
              quantity: true,
              price: true,
            },
          },
          payment: {
            select: {
              status: true,
              provider: true,
              paidAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customer: order.customer,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      itemCount: order.items.length,
      paymentStatus: order.payment?.status || null,
      paymentProvider: order.payment?.provider || null,
      paidAt: order.payment?.paidAt || null,
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

  // Get order details (admin view)
  async getOrderDetails(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                unit: true,
                images: {
                  select: {
                    url: true,
                  },
                  take: 1,
                },
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customer: order.customer,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discount: Number(order.discount),
      total: Number(order.total),
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        unit: item.product.unit,
        sellerId: item.sellerId,
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
            metadata: order.payment.metadata,
            createdAt: order.payment.createdAt,
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
  // Update order status (admin can update to any status)
  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Validate status transitions
    const currentStatus = order.status;

    // Prevent moving from terminal states
    if (currentStatus === OrderStatus.DELIVERED || currentStatus === OrderStatus.REFUNDED) {
      throw new BadRequestError(
        `Cannot change status from ${currentStatus}`
      );
    }

    // Update order status
    const updateData: Prisma.OrderUpdateInput = { status: newStatus };

    if (newStatus === OrderStatus.CONFIRMED && !order.confirmedAt) {
      updateData.confirmedAt = new Date();
    } else if (newStatus === OrderStatus.SHIPPED && !order.shippedAt) {
      updateData.shippedAt = new Date();
    } else if (newStatus === OrderStatus.DELIVERED && !order.deliveredAt) {
      updateData.deliveredAt = new Date();
    } else if (newStatus === OrderStatus.CANCELLED && !order.cancelledAt) {
      updateData.cancelledAt = new Date();

      // Release reserved stock
      const items = await prisma.orderItem.findMany({
        where: { orderId },
      });

      for (const item of items) {
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
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      confirmedAt: updatedOrder.confirmedAt,
      shippedAt: updatedOrder.shippedAt,
      deliveredAt: updatedOrder.deliveredAt,
      cancelledAt: updatedOrder.cancelledAt,
      message: `Order status updated to ${newStatus}`,
    };
  },
  // Get platform-wide order statistics

  async getPlatformStats(options?: { startDate?: Date; endDate?: Date }) {
    const where: Prisma.OrderWhereInput = {};

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};
      if (options.startDate) {
        where.createdAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      refundedOrders,
      totalRevenue,
      averageOrderValue,
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.count({ where: { ...where, status: OrderStatus.PENDING } }),
      prisma.order.count({ where: { ...where, status: OrderStatus.CONFIRMED } }),
      prisma.order.count({ where: { ...where, status: OrderStatus.PROCESSING } }),
      prisma.order.count({ where: { ...where, status: OrderStatus.SHIPPED } }),
      prisma.order.count({ where: { ...where, status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { ...where, status: OrderStatus.CANCELLED } }),
      prisma.order.count({ where: { ...where, status: OrderStatus.REFUNDED } }),
      prisma.order.aggregate({
        where: { ...where, status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING] } },
        _sum: { total: true },
      }).then((result) => Number(result._sum.total || 0)),
      prisma.order.aggregate({
        where: { ...where, status: { in: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.PROCESSING] } },
        _avg: { total: true },
      }).then((result) => Number(result._avg.total || 0)),
    ]);

    return {
      totalOrders,
      byStatus: {
        pending: pendingOrders,
        confirmed: confirmedOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        refunded: refundedOrders,
      },
      revenue: {
        total: totalRevenue,
        average: averageOrderValue,
      },
    };
  },

  // Get recent orders
  
  async getRecentOrders(limit: number = 10) {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        payment: {
          select: {
            status: true,
          },
        },
      },
    });

    return orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      total: Number(order.total),
      paymentStatus: order.payment?.status || null,
      createdAt: order.createdAt,
    }));
  },

 // Bulk update order statuses
  
  async bulkUpdateStatus(orderIds: string[], newStatus: OrderStatus) {
    const updateData: Prisma.OrderUpdateInput = { status: newStatus };

    if (newStatus === OrderStatus.CONFIRMED) {
      updateData.confirmedAt = new Date();
    } else if (newStatus === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    } else if (newStatus === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    const result = await prisma.order.updateMany({
      where: {
        id: { in: orderIds },
        status: {
          not: { in: [OrderStatus.DELIVERED, OrderStatus.REFUNDED] },
        },
      },
      data: updateData,
    });

    return {
      updatedCount: result.count,
      message: `Updated ${result.count} orders to ${newStatus}`,
    };
  },
};
