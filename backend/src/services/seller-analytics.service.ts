import { OrderStatus } from '@prisma/client';
import prisma from '../config/database';
import { ValidationError } from '../utils/errors';

export const sellerAnalyticsService = {
  /**
   * Get dashboard overview statistics
   */
  async getDashboardOverview(sellerId: string, period: 'today' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    // Get order items for this seller in the period
    const orderItems = await prisma.orderItem.findMany({
      where: {
        sellerId,
        order: {
          createdAt: { gte: startDate },
          status: {
            notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
          },
        },
      },
      include: {
        order: {
          select: {
            status: true,
            createdAt: true,
          },
        },
      },
    });

    // Calculate metrics
    const totalOrders = new Set(orderItems.map(item => item.orderId)).size;
    const totalRevenue = orderItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const totalItemsSold = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    // Get delivered orders for confirmed revenue
    const deliveredItems = orderItems.filter(item => item.order.status === OrderStatus.DELIVERED);
    const confirmedRevenue = deliveredItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    // Get pending orders
    const pendingItems = orderItems.filter(item => {
      const pendingStatuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PROCESSING];
      return pendingStatuses.includes(item.order.status);
    });
    const pendingRevenue = pendingItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    // Get product count
    const productCount = await prisma.product.count({
      where: { sellerId, active: true },
    });

    // Get low stock count
    const lowStockCount = await prisma.inventory.count({
      where: {
        product: {
          sellerId,
          active: true,
        },
        currentStock: {
          lte: prisma.inventory.fields.lowStockThreshold,
        },
      },
    });

    return {
      period,
      dateRange: {
        start: startDate,
        end: now,
      },
      orders: {
        total: totalOrders,
        itemsSold: totalItemsSold,
      },
      revenue: {
        total: totalRevenue,
        confirmed: confirmedRevenue,
        pending: pendingRevenue,
      },
      products: {
        total: productCount,
        lowStock: lowStockCount,
      },
    };
  },

  /**
   * Get sales over time (daily/weekly/monthly)
   */
  async getSalesOverTime(
    sellerId: string,
    options: {
      startDate: Date;
      endDate: Date;
      groupBy: 'day' | 'week' | 'month';
    }
  ) {
    const { startDate, endDate, groupBy } = options;

    // Get all order items in the date range
    const orderItems = await prisma.orderItem.findMany({
      where: {
        sellerId,
        order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
          },
        },
      },
      include: {
        order: {
          select: {
            createdAt: true,
            status: true,
          },
        },
      },
    });

    // Group by date
    const salesByDate = new Map<string, { revenue: number; orders: Set<string>; itemsSold: number }>();

    orderItems.forEach(item => {
      const date = new Date(item.order.createdAt);
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!salesByDate.has(key)) {
        salesByDate.set(key, { revenue: 0, orders: new Set(), itemsSold: 0 });
      }

      const entry = salesByDate.get(key)!;
      entry.revenue += Number(item.price) * item.quantity;
      entry.orders.add(item.orderId);
      entry.itemsSold += item.quantity;
    });

    // Convert to array and sort
    const sales = Array.from(salesByDate.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders.size,
        itemsSold: data.itemsSold,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      groupBy,
      dateRange: { start: startDate, end: endDate },
      sales,
    };
  },

  /**
   * Get product performance metrics
   */
  async getProductPerformance(sellerId: string, options?: { limit?: number; sortBy?: 'revenue' | 'quantity' | 'orders' }) {
    const limit = options?.limit || 10;
    const sortBy = options?.sortBy || 'revenue';

    // Get order items grouped by product
    const orderItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        sellerId,
        order: {
          status: {
            notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
          },
        },
      },
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });

    // Get product details and calculate revenue
    const productIds = orderItems.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        unit: true,
        rating: true,
        reviewCount: true,
        images: {
          select: { url: true },
          take: 1,
        },
      },
    });

    const productsMap = new Map(products.map(p => [p.id, p]));

    // Calculate metrics for each product
    const productMetrics = orderItems.map(item => {
      const product = productsMap.get(item.productId);
      const quantitySold = item._sum.quantity || 0;
      const revenue = Number(product?.price || 0) * quantitySold;

      return {
        productId: item.productId,
        name: product?.name || 'Unknown',
        slug: product?.slug || '',
        price: Number(product?.price || 0),
        unit: product?.unit || '',
        image: product?.images[0]?.url || null,
        rating: Number(product?.rating || 0),
        reviewCount: product?.reviewCount || 0,
        quantitySold,
        orderCount: item._count.id,
        revenue,
      };
    });

    // Sort by selected metric
    productMetrics.sort((a, b) => {
      if (sortBy === 'revenue') return b.revenue - a.revenue;
      if (sortBy === 'quantity') return b.quantitySold - a.quantitySold;
      return b.orderCount - a.orderCount;
    });

    return productMetrics.slice(0, limit);
  },

  /**
   * Get revenue breakdown by category
   */
  async getRevenueByCategory(sellerId: string, startDate?: Date, endDate?: Date) {
    const where: any = {
      sellerId,
      order: {
        status: {
          notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
        },
      },
    };

    if (startDate || endDate) {
      where.order.createdAt = {};
      if (startDate) where.order.createdAt.gte = startDate;
      if (endDate) where.order.createdAt.lte = endDate;
    }

    const orderItems = await prisma.orderItem.findMany({
      where,
      include: {
        product: {
          select: {
            categoryId: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Group by category
    const categoryRevenue = new Map<string, { category: any; revenue: number; itemsSold: number; orders: Set<string> }>();

    orderItems.forEach(item => {
      const categoryId = item.product.categoryId;
      if (!categoryRevenue.has(categoryId)) {
        categoryRevenue.set(categoryId, {
          category: item.product.category,
          revenue: 0,
          itemsSold: 0,
          orders: new Set(),
        });
      }

      const entry = categoryRevenue.get(categoryId)!;
      entry.revenue += Number(item.price) * item.quantity;
      entry.itemsSold += item.quantity;
      entry.orders.add(item.orderId);
    });

    // Convert to array and sort by revenue
    return Array.from(categoryRevenue.values())
      .map(data => ({
        categoryId: data.category.id,
        categoryName: data.category.name,
        categorySlug: data.category.slug,
        revenue: data.revenue,
        itemsSold: data.itemsSold,
        orderCount: data.orders.size,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  },

  /**
   * Get customer insights
   */
  async getCustomerInsights(sellerId: string, options?: { limit?: number }) {
    const limit = options?.limit || 10;

    // Get top customers by revenue
    const orderItems = await prisma.orderItem.findMany({
      where: {
        sellerId,
        order: {
          status: {
            notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED],
          },
        },
      },
      include: {
        order: {
          select: {
            customerId: true,
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Group by customer
    const customerData = new Map<string, { 
      customer: any; 
      revenue: number; 
      orders: Set<string>; 
      itemsPurchased: number;
    }>();

    orderItems.forEach(item => {
      const customerId = item.order.customerId;
      if (!customerData.has(customerId)) {
        customerData.set(customerId, {
          customer: item.order.customer,
          revenue: 0,
          orders: new Set(),
          itemsPurchased: 0,
        });
      }

      const entry = customerData.get(customerId)!;
      entry.revenue += Number(item.price) * item.quantity;
      entry.orders.add(item.orderId);
      entry.itemsPurchased += item.quantity;
    });

    // Convert to array and sort by revenue
    const topCustomers = Array.from(customerData.values())
      .map(data => ({
        customerId: data.customer.id,
        customerName: `${data.customer.firstName} ${data.customer.lastName}`,
        email: data.customer.email,
        totalRevenue: data.revenue,
        totalOrders: data.orders.size,
        itemsPurchased: data.itemsPurchased,
        averageOrderValue: data.revenue / data.orders.size,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);

    // Calculate summary metrics
    const totalCustomers = customerData.size;
    const totalRevenue = Array.from(customerData.values()).reduce((sum, c) => sum + c.revenue, 0);
    const totalOrders = new Set(orderItems.map(item => item.orderId)).size;

    return {
      topCustomers,
      summary: {
        totalCustomers,
        totalRevenue,
        totalOrders,
        averageRevenuePerCustomer: totalRevenue / totalCustomers,
      },
    };
  },

  /**
   * Get recent activity feed
   */
  async getRecentActivity(sellerId: string, limit: number = 20) {
    const activities: Array<{
      type: string;
      title: string;
      description: string;
      timestamp: Date;
      metadata?: any;
    }> = [];

    // Get recent orders
    const recentOrders = await prisma.orderItem.findMany({
      where: { sellerId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            createdAt: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        order: {
          createdAt: 'desc',
        },
      },
      take: limit,
      distinct: ['orderId'],
    });

    recentOrders.forEach(item => {
      activities.push({
        type: 'order',
        title: 'New Order',
        description: `${item.order.customer.firstName} ${item.order.customer.lastName} ordered ${item.product.name}`,
        timestamp: item.order.createdAt,
        metadata: {
          orderId: item.order.id,
          orderNumber: item.order.orderNumber,
          status: item.order.status,
        },
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return activities.slice(0, limit);
  },
};
