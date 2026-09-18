import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export interface CreateAddressData {
  fullName: string;
  phone: string;
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
  specificLocation: string;
  addressType?: string;
  isDefault?: boolean;
}

export interface UpdateAddressData {
  fullName?: string;
  phone?: string;
  region?: string;
  zone?: string;
  woreda?: string;
  kebele?: string;
  specificLocation?: string;
  addressType?: string;
  isDefault?: boolean;
}

export const addressRepository = {
  /**
   * Create new address
   */
  async create(userId: string, data: CreateAddressData) {
    // If this is set as default, unset others
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return prisma.address.create({
      data: {
        userId,
        ...data,
      },
    });
  },

  /**
   * Find all addresses for user
   */
  async findByUserId(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  },

  /**
   * Find address by ID
   */
  async findById(id: string, userId: string) {
    const address = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundError('Address not found');
    }

    return address;
  },

  /**
   * Get default address
   */
  async findDefault(userId: string) {
    return prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
  },

  /**
   * Update address
   */
  async update(id: string, userId: string, data: UpdateAddressData) {
    // Verify address belongs to user
    await this.findById(id, userId);

    // If setting as default, unset others
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return prisma.address.update({
      where: { id },
      data,
    });
  },

  /**
   * Set address as default
   */
  async setDefault(id: string, userId: string) {
    // Verify address belongs to user
    await this.findById(id, userId);

    // Unset all defaults
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this one as default
    return prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
  },

  /**
   * Delete address
   */
  async delete(id: string, userId: string) {
    // Verify address belongs to user
    await this.findById(id, userId);

    await prisma.address.delete({
      where: { id },
    });
  },

  /**
   * Count user addresses
   */
  async count(userId: string) {
    return prisma.address.count({
      where: { userId },
    });
  },
};
