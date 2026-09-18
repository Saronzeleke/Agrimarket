/**
 * User Repository
 * 
 * Database operations for User entity.
 */

import prisma from '../config/database'
import { Role, User } from '@prisma/client'
import { RegisterData } from '../types'

export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    })
  }

  /**
   * Create a new user
   */
  async create(data: RegisterData & { password: string }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: Role.CUSTOMER, // Default role
        emailVerified: false,
        active: true,
      },
    })
  }

  /**
   * Update user
   */
  async update(
    id: string,
    data: Partial<User>
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    })
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    })
  }

  /**
   * Update password
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })
  }

  /**
   * Suspend user account
   */
  async suspend(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { active: false },
    })
  }

  /**
   * Activate user account
   */
  async activate(userId: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { active: true },
    })
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    })
    return count > 0
  }

  /**
   * Get user with seller profile
   */
  async findWithSellerProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        sellerProfile: true,
      },
    })
  }
}

export default new UserRepository()
