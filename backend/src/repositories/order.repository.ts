import { PrismaClient, OrderStatus, Prisma } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export interface CreateOrderData {
  customerId: string;
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  shippingAddress: any;
  notes?: string;
  items: Array<{
    productId: string;
    sellerId: string;
    quantity: number;
    price: number;
    variantInfo?: any;
  }>;
}

export const orderRepository = {
  /**
   * Create new order with items
   */
  async create(data: CreateOrderData) {
    const { items, ...orderData } = data;

    return prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: items,
        },
      },
      include: {
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
  },

  /**
   * Find order by ID
   */
  async findById(orderId: string, customerId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId },
      include: {
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

    return order;
  },

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string, customerId: string) {
    const order = await prisma.order.findFirst({
      where: { orderNumber, customerId },
      include: {
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

    return order;
  },

  /**
   * Find all orders for customer
   */
  async findByCustomerId(
    customerId: string,
    options?: {
      status?: OrderStatus;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: Prisma.OrderWhereInput = { customerId };

    if (options?.status) {
      where.status = options.status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
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
          payment: {
            select: {
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: options?.limit,
        skip: options?.offset,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  },

  /**
   * Update order status
   */
  async updateStatus(orderId: string, status: OrderStatus) {
    const updateData: Prisma.OrderUpdateInput = { status };

    // Set timestamp based on status
    if (status === OrderStatus.CONFIRMED) {
      updateData.confirmedAt = new Date();
    } else if (status === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    } else if (status === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    } else if (status === OrderStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
    }

    return prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
        payment: true,
      },
    });
  },

  /**
   * Cancel order
   */
  async cancel(orderId: string, customerId: string) {
    // Verify order belongs to customer
    await this.findById(orderId, customerId);

    return this.updateStatus(orderId, OrderStatus.CANCELLED);
  },

  /**
   * Generate unique order number
   */
  async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Get count of orders today
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');

    return `ORD${year}${month}${day}${sequence}`;
  },

  /**
   * Get order statistics for customer
   */
  async getCustomerStats(customerId: string) {
    const [total, pending, confirmed, processing, shipped, delivered, cancelled] = await Promise.all([
      prisma.order.count({ where: { customerId } }),
      prisma.order.count({ where: { customerId, status: OrderStatus.PENDING } }),
      prisma.order.count({ where: { customerId, status: OrderStatus.CONFIRMED } }),
      prisma.order.count({ where: { customerId, status: OrderStatus.PROCESSING } }),
      prisma.order.count({ where: { customerId, status: OrderStatus.SHIPPED } }),
      prisma.order.count({ where: { customerId, status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { customerId, status: OrderStatus.CANCELLED } }),
    ]);

    return {
      total,
      byStatus: {
        pending,
        confirmed,
        processing,
        shipped,
        delivered,
        cancelled,
      },
    };
  },
};
