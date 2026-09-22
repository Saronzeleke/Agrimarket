// Admin Analytics Service, Provides platform-wide analytics and monitoring for administrators.
import { OrderStatus, PaymentStatus, Role } from '@prisma/client';
import prisma from '../config/database';
import { ValidationError, NotFoundError } from '../utils/errors';

export const adminAnalyticsService = {
  // Get platform overview dashboard
   
  async getPlatformOverview(period: 'today' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
    }

    // Get order statistics
    const [currentOrders, previousOrders] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        },
        include: {
          items: true,
        },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        },
        include: {
          items: true,
        },
      }),
    ]);

    // Calculate revenue (subtotal + delivery fee)
    const currentRevenue = currentOrders.reduce(
      (sum, order) => sum + Number(order.subtotal) + Number(order.deliveryFee),
      0
    );
    const previousRevenue = previousOrders.reduce(
      (sum, order) => sum + Number(order.subtotal) + Number(order.deliveryFee),
      0
    );

    // Get total orders (all time)
    const totalOrders = await prisma.order.count({
      where: { status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] } },
    });

    // Get order status breakdown for current period
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: startDate } },
      _count: true,
    });

    const statusBreakdown = ordersByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Get user statistics
    const [totalUsers, currentNewUsers, previousNewUsers, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      prisma.user.count({ where: { createdAt: { gte: previousStartDate, lt: startDate } } }),
      prisma.user.count({
        where: {
          orders: {
            some: {
              createdAt: { gte: startDate },
            },
          },
        },
      }),
    ]);

    // Get seller statistics
    const [totalSellers, activeSellers, currentNewSellers, previousNewSellers] = await Promise.all([
      prisma.sellerProfile.count(),
      prisma.sellerProfile.count({
        where: {
          products: {
            some: {
              active: true,
            },
          },
        },
      }),
      prisma.sellerProfile.count({ where: { createdAt: { gte: startDate } } }),
      prisma.sellerProfile.count({
        where: { createdAt: { gte: previousStartDate, lt: startDate } },
      }),
    ]);

    // Get product statistics
    const [totalProducts, activeProducts, currentNewProducts, previousNewProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { createdAt: { gte: startDate } } }),
      prisma.product.count({ where: { createdAt: { gte: previousStartDate, lt: startDate } } }),
    ]);

    // Calculate growth percentages
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    const orderGrowth = previousOrders.length > 0
      ? ((currentOrders.length - previousOrders.length) / previousOrders.length) * 100
      : 0;
    const userGrowth = previousNewUsers > 0
      ? ((currentNewUsers - previousNewUsers) / previousNewUsers) * 100
      : 0;
    const sellerGrowth = previousNewSellers > 0
      ? ((currentNewSellers - previousNewSellers) / previousNewSellers) * 100
      : 0;

    return {
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        growth: revenueGrowth,
        total: await prisma.order.aggregate({
          where: { status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] } },
          _sum: { subtotal: true, deliveryFee: true },
        }).then(result => 
          Number(result._sum.subtotal || 0) + Number(result._sum.deliveryFee || 0)
        ),
      },
      orders: {
        current: currentOrders.length,
        previous: previousOrders.length,
        growth: orderGrowth,
        total: totalOrders,
        byStatus: statusBreakdown,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        new: currentNewUsers,
        growth: userGrowth,
      },
      sellers: {
        total: totalSellers,
        active: activeSellers,
        new: currentNewSellers,
        growth: sellerGrowth,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        new: currentNewProducts,
        growth: previousNewProducts > 0
          ? ((currentNewProducts - previousNewProducts) / previousNewProducts) * 100
          : 0,
      },
    };
  },

  // Get sales analytics over time
  async getSalesAnalytics(params: {
    startDate: Date;
    endDate: Date;
    groupBy: 'day' | 'week' | 'month';
  }) {
    const { startDate, endDate, groupBy } = params;

    // Validate date range
    if (startDate >= endDate) {
      throw new ValidationError('Start date must be before end date');
    }

    // Get orders in the date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group orders by time interval
    const groupedData = new Map<string, { revenue: number; orders: number }>();

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      const existing = groupedData.get(key) || { revenue: 0, orders: 0 };
      existing.revenue += Number(order.subtotal) + Number(order.deliveryFee);
      existing.orders += 1;
      groupedData.set(key, existing);
    });

    // Convert to array and calculate averages
    const data = Array.from(groupedData.entries()).map(([date, stats]) => ({
      date,
      revenue: stats.revenue,
      orders: stats.orders,
      averageOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0,
    }));

    // Calculate summary
    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      data,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        periodStart: startDate.toISOString(),
        periodEnd: endDate.toISOString(),
      },
    };
  },

  // Get top performing sellers
   
  async getTopSellers(params: {
    period: 'week' | 'month' | 'quarter' | 'year';
    limit: number;
  }) {
    const { period, limit } = params;
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    // Get order items grouped by seller
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        },
      },
      include: {
        seller: {
          include: {
            user: {
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

    // Group by seller and calculate metrics
    const sellerMetrics = new Map<string, {
      seller: any;
      revenue: number;
      orders: Set<string>;
      itemsSold: number;
    }>();

    orderItems.forEach((item) => {
      const sellerId = item.sellerId;
      const existing = sellerMetrics.get(sellerId) || {
        seller: item.seller,
        revenue: 0,
        orders: new Set<string>(),
        itemsSold: 0,
      };

      existing.revenue += Number(item.price) * item.quantity;
      existing.orders.add(item.orderId);
      existing.itemsSold += item.quantity;

      sellerMetrics.set(sellerId, existing);
    });

    // Convert to array and sort by revenue
    const sellers = Array.from(sellerMetrics.values())
      .map((metric) => ({
        id: metric.seller.id,
        businessName: metric.seller.businessName,
        user: metric.seller.user,
        revenue: metric.revenue,
        orderCount: metric.orders.size,
        itemsSold: metric.itemsSold,
        averageOrderValue: metric.orders.size > 0 ? metric.revenue / metric.orders.size : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);

    return sellers;
  },

  // Get revenue by category
 
  async getRevenueByCategory(startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new ValidationError('Start date must be before end date');
    }

    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate, lte: endDate },
          status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
        },
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    // Group by category
    const categoryMetrics = new Map<string, {
      category: any;
      revenue: number;
      orders: Set<string>;
      itemsSold: number;
    }>();

    orderItems.forEach((item) => {
      const categoryId = item.product.categoryId;
      const existing = categoryMetrics.get(categoryId) || {
        category: item.product.category,
        revenue: 0,
        orders: new Set<string>(),
        itemsSold: 0,
      };

      existing.revenue += Number(item.price) * item.quantity;
      existing.orders.add(item.orderId);
      existing.itemsSold += item.quantity;

      categoryMetrics.set(categoryId, existing);
    });

    // Calculate total revenue for percentage
    const totalRevenue = Array.from(categoryMetrics.values()).reduce(
      (sum, metric) => sum + metric.revenue,
      0
    );

    // Convert to array
    const categories = Array.from(categoryMetrics.values())
      .map((metric) => ({
        categoryId: metric.category.id,
        categoryName: metric.category.name,
        revenue: metric.revenue,
        orderCount: metric.orders.size,
        itemsSold: metric.itemsSold,
        percentage: totalRevenue > 0 ? (metric.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return categories;
  },

  // Get user growth analytics
   
  async getUserGrowth(params: {
    startDate: Date;
    endDate: Date;
    groupBy: 'day' | 'week' | 'month';
  }) {
    const { startDate, endDate, groupBy } = params;

    if (startDate >= endDate) {
      throw new ValidationError('Start date must be before end date');
    }

    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group users by time interval
    const groupedData = new Map<string, { total: number; customers: number; sellers: number }>();

    for (const user of users) {
      const date = new Date(user.createdAt);
      let key: string;

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }

      const existing = groupedData.get(key) || { total: 0, customers: 0, sellers: 0 };
      existing.total += 1;

      if (user.role === Role.CUSTOMER) {
        existing.customers += 1;
      } else if (user.role === Role.SELLER) {
        existing.sellers += 1;
      }

      groupedData.set(key, existing);
    }

    // Convert to array
    const data = Array.from(groupedData.entries()).map(([date, stats]) => ({
      date,
      ...stats,
    }));

    return {
      data,
      summary: {
        totalUsers: users.length,
        totalCustomers: users.filter(u => u.role === Role.CUSTOMER).length,
        totalSellers: users.filter(u => u.role === Role.SELLER).length,
      },
    };
  },

  // Get platform activity feed
   
  async getPlatformActivity(limit: number = 50) {
    const activities: Array<{
      type: string;
      description: string;
      timestamp: Date;
      metadata?: any;
    }> = [];

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: Math.min(limit, 20),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    recentOrders.forEach((order) => {
      activities.push({
        type: 'order_created',
        description: `New order #${order.id.slice(0, 8)} by ${order.user.firstName} ${order.user.lastName}`,
        timestamp: order.createdAt,
        metadata: { orderId: order.id, total: Number(order.subtotal) + Number(order.deliveryFee) },
      });
    });

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: Math.min(limit, 20),
      orderBy: { createdAt: 'desc' },
    });

    recentUsers.forEach((user) => {
      activities.push({
        type: 'user_registered',
        description: `New ${user.role.toLowerCase()} registered: ${user.firstName} ${user.lastName}`,
        timestamp: user.createdAt,
        metadata: { userId: user.id, role: user.role },
      });
    });

    // Get recent products
    const recentProducts = await prisma.product.findMany({
      take: Math.min(limit, 20),
      orderBy: { createdAt: 'desc' },
      include: {
        seller: {
          select: { businessName: true },
        },
      },
    });

    recentProducts.forEach((product) => {
      activities.push({
        type: 'product_added',
        description: `New product: ${product.name} by ${product.seller.businessName}`,
        timestamp: product.createdAt,
        metadata: { productId: product.id, price: Number(product.price) },
      });
    });

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  },

  // Get user demographics by region
  
  async getUserDemographics() {
    const addresses = await prisma.address.groupBy({
      by: ['region'],
      _count: {
        userId: true,
      },
    });

    return addresses.map((item) => ({
      region: item.region,
      userCount: item._count.userId,
    })).sort((a, b) => b.userCount - a.userCount);
  },

  // Get payment method analytics
 
  async getPaymentMethodAnalytics(startDate: Date, endDate: Date) {
    if (startDate >= endDate) {
      throw new ValidationError('Start date must be before end date');
    }

    const orders = await prisma.order.groupBy({
      by: ['paymentMethod'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] },
      },
      _count: true,
      _sum: {
        subtotal: true,
        deliveryFee: true,
      },
    });

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order._sum.subtotal || 0) + Number(order._sum.deliveryFee || 0),
      0
    );

    return orders.map((order) => {
      const revenue = Number(order._sum.subtotal || 0) + Number(order._sum.deliveryFee || 0);
      return {
        paymentMethod: order.paymentMethod,
        orderCount: order._count,
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  },
};
