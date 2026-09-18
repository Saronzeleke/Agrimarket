/**
 * User Factory
 * 
 * Factory functions for creating test users.
 */

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const userFactory = {
  /**
   * Create a test customer
   */
  async createCustomer(data?: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    active: boolean;
  }>) {
    const hashedPassword = await bcrypt.hash(data?.password || 'Password123!', 10);

    return prisma.user.create({
      data: {
        email: data?.email || `customer-${Date.now()}@test.com`,
        password: hashedPassword,
        firstName: data?.firstName || 'Test',
        lastName: data?.lastName || 'Customer',
        role: Role.CUSTOMER,
        emailVerified: data?.emailVerified ?? true,
        active: data?.active ?? true,
      },
    });
  },

  /**
   * Create a test seller
   */
  async createSeller(data?: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessName: string;
    verified: boolean;
  }>) {
    const hashedPassword = await bcrypt.hash(data?.password || 'Password123!', 10);

    const user = await prisma.user.create({
      data: {
        email: data?.email || `seller-${Date.now()}@test.com`,
        password: hashedPassword,
        firstName: data?.firstName || 'Test',
        lastName: data?.lastName || 'Seller',
        role: Role.SELLER,
        emailVerified: true,
        active: true,
      },
    });

    await prisma.sellerProfile.create({
      data: {
        userId: user.id,
        businessName: data?.businessName || `Test Business ${Date.now()}`,
        phone: '+251911234567',
        location: 'Addis Ababa',
        verified: data?.verified ?? true,
      },
    });

    return prisma.user.findUnique({
      where: { id: user.id },
      include: { sellerProfile: true },
    });
  },

  /**
   * Create a test admin
   */
  async createAdmin(data?: Partial<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }>) {
    const hashedPassword = await bcrypt.hash(data?.password || 'Password123!', 10);

    return prisma.user.create({
      data: {
        email: data?.email || `admin-${Date.now()}@test.com`,
        password: hashedPassword,
        firstName: data?.firstName || 'Test',
        lastName: data?.lastName || 'Admin',
        role: Role.ADMIN,
        emailVerified: true,
        active: true,
      },
    });
  },

  /**
   * Create multiple test customers
   */
  async createCustomers(count: number) {
    const customers = [];
    for (let i = 0; i < count; i++) {
      customers.push(await this.createCustomer({
        email: `customer-${Date.now()}-${i}@test.com`,
      }));
    }
    return customers;
  },
};
