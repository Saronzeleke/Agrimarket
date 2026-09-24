import { OrderStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const sellerOrderService = {
  // Get seller's orders (orders containing their products)
  async getSellerOrders(
    sellerId: string,
    options?: {
      status?: OrderStatus;
      page?: number;
      limit?: number;
      search?: string;
    }
  ) {
    const page = options?.page || 1;
    const limit = Math.min(options?.limit || 20, 100);
    const offset = (page - 1) * limit;

    // Build where clause
    const where: Prisma.OrderItemWhereInput = {
      sellerId,
    };

    if (options?.status) {
      where.order = { status: options.status };
    }

    if (options?.search) {
      where.order = {
        ...(where.order && 'status' in where.order ? { status: where.order.status } : {}),
        OR: [
          { orderNumber: { contains: options.search, mode: 'insensitive' } },
          { customer: { firstName: { contains: options.search, mode: 'insensitive' } } },
          { customer: { lastName: { contains: options.search, mode: 'insensitive' } } },
          { customer: { email: { contains: options.search, mode: 'insensitive' } } },
        ],
      };
    }

    const [orderItems, total] = await Promise.all([
      prisma.orderItem.findMany({
        where,
        include: {
          order: {
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
              payment: {
                select: {
                  status: true,
                  paidAt: true,
                },
              },
            },
          },
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
        orderBy: {
          order: {
            createdAt: 'desc',
          },
        },
        take: limit,
        skip: offset,
      }),
      prisma.orderItem.count({ where }),
    ]);

    // Group items by order
    const ordersMap = new Map();

    for (const item of orderItems) {
      if (!ordersMap.has(item.orderId)) {
        ordersMap.set(item.orderId, {
          id: item.order.id,
          orderNumber: item.order.orderNumber,
          status: item.order.status,
          customer: item.order.customer,
          shippingAddress: item.order.shippingAddress,
          total: Number(item.order.total),
          paymentStatus: item.order.payment?.status || null,
          paidAt: item.order.payment?.paidAt || null,
          items: [],
          createdAt: item.order.createdAt,
          confirmedAt: item.order.confirmedAt,
          shippedAt: item.order.shippedAt,
          deliveredAt: item.order.deliveredAt,
        });
      }

      const order = ordersMap.get(item.orderId);
      order.items.push({
        id: item.id,
        productId: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        unit: item.product.unit,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.price) * item.quantity,
        image: item.product.images[0]?.url || null,
      });
    }

    const orders = Array.from(ordersMap.values());

    return {
      orders,
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
// Get specific order details for seller
  async getSellerOrder(orderId: string, sellerId: string) {
    // Get order items for this seller
    const orderItems = await prisma.orderItem.findMany({
      where: {
        orderId,
        sellerId,
      },
      include: {
        order: {
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
            payment: true,
          },
        },
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
    });

    if (orderItems.length === 0) {
      throw new NotFoundError('Order not found or does not contain your products');
    }

    const order = orderItems[0].order;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customer: order.customer,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      items: orderItems.map((item) => ({
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
      sellerTotal: orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0),
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
// Update order status (seller can only move to PROCESSING or SHIPPED)
  async updateOrderStatus(orderId: string, sellerId: string, newStatus: OrderStatus) {
    // Verify seller has items in this order
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId, sellerId },
      include: {
        order: true,
      },
    });

    if (orderItems.length === 0) {
      throw new NotFoundError('Order not found or does not contain your products');
    }

    const order = orderItems[0].order;

    // Sellers can only update to PROCESSING or SHIPPED
    const sellerStatuses: OrderStatus[] = [OrderStatus.PROCESSING, OrderStatus.SHIPPED];
    if (!sellerStatuses.includes(newStatus)) {
      throw new BadRequestError(
        'Sellers can only update order status to PROCESSING or SHIPPED'
      );
    }

    // Validate status transitions
    const currentStatus = order.status;

    if (newStatus === OrderStatus.PROCESSING) {
      if (currentStatus !== OrderStatus.CONFIRMED) {
        throw new BadRequestError(
          'Can only move to PROCESSING from CONFIRMED status'
        );
      }
    }

    if (newStatus === OrderStatus.SHIPPED) {
      const shippableFrom: OrderStatus[] = [OrderStatus.CONFIRMED, OrderStatus.PROCESSING];
      if (!shippableFrom.includes(currentStatus)) {
        throw new BadRequestError(
          'Can only move to SHIPPED from CONFIRMED or PROCESSING status'
        );
      }
    }

    // Update order status
    const updateData: Prisma.OrderUpdateInput = { status: newStatus };

    if (newStatus === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        payment: true,
      },
    });

    return {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
      shippedAt: updatedOrder.shippedAt,
      message: `Order status updated to ${newStatus}`,
    };
  },
// Get seller order statistics
  async getSellerOrderStats(sellerId: string) {
    const [
      totalOrders,
      pendingCount,
      confirmedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      totalRevenue,
      thisMonthRevenue,
    ] = await Promise.all([
      // Total orders with seller's items
      prisma.orderItem.groupBy({
        by: ['orderId'],
        where: { sellerId },
        _count: true,
      }).then((result) => result.length),

      // Count by status
      prisma.orderItem.groupBy({
        by: ['orderId'],
        where: {
          sellerId,
          order: { status: OrderStatus.PENDING },
        },
      }).then((r) => r.length),

      prisma.orderItem.groupBy({
        by: ['orderId'],
        where: {
          sellerId,
          order: { status: OrderStatus.CONFIRMED },
        },
      }).then((r) => r.length),

      prisma.orderItem.groupBy({
        by: ['orderId'],
        where: {
          sellerId,
          order: { status: OrderStatus.PROCESSING },
        },
      }).then((r) => r.length),

      prisma.orderItem.groupBy({
        by: ['orderId'],
        where: {
          sellerId,
          order: { status: OrderStatus.SHIPPED },
        },
      }).then((r) => r.length),

      prisma.orderItem.groupBy({
        by: ['orderId'],
        where: {
          sellerId,
          order: { status: OrderStatus.DELIVERED },
        },
      }).then((r) => r.length),

      prisma.orderItem.groupBy({
        by: ['orderId'],
        where: {
          sellerId,
          order: { status: OrderStatus.CANCELLED },
        },
      }).then((r) => r.length),

      // Total revenue (delivered orders only)
      prisma.orderItem.aggregate({
        where: {
          sellerId,
          order: { status: OrderStatus.DELIVERED },
        },
        _sum: {
          price: true,
        },
      }).then((result) => Number(result._sum.price || 0)),

      // This month revenue
      prisma.orderItem.aggregate({
        where: {
          sellerId,
          order: {
            status: OrderStatus.DELIVERED,
            deliveredAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
        _sum: {
          price: true,
        },
      }).then((result) => Number(result._sum.price || 0)),
    ]);

    return {
      totalOrders,
      byStatus: {
        pending: pendingCount,
        confirmed: confirmedCount,
        processing: processingCount,
        shipped: shippedCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
      },
    };
  },
// Get seller's top selling products
  async getTopSellingProducts(sellerId: string, limit: number = 10) {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        sellerId,
        order: {
          status: {
            in: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
          },
        },
      },
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    // Get product details
    const productIds = topProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
    });

    const productsMap = new Map(products.map((p) => [p.id, p]));

    return topProducts.map((item) => {
      const product = productsMap.get(item.productId);
      return {
        productId: item.productId,
        name: product?.name || 'Unknown Product',
        slug: product?.slug || '',
        price: Number(product?.price || 0),
        image: product?.images[0]?.url || null,
        totalQuantitySold: item._sum.quantity || 0,
        orderCount: item._count.id,
      };
    });
  },
};
