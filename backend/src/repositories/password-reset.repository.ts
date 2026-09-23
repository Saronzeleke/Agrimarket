// Database operations for password reset tokens.

import prisma from '../config/database'
import { PasswordReset } from '@prisma/client'

export class PasswordResetRepository {
  // Create reset token
   
  async create(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<PasswordReset> {
    return prisma.passwordReset.create({
      data: {
        userId,
        token,
        expiresAt,
        used: false,
      },
    })
  }
// Find reset by token
 
  async findByToken(token: string): Promise<PasswordReset | null> {
    return prisma.passwordReset.findUnique({
      where: { token },
    })
  }
//Mark token as used
  
  async markAsUsed(id: string): Promise<PasswordReset> {
    return prisma.passwordReset.update({
      where: { id },
      data: { used: true },
    })
  }
//Delete reset token
  
  async delete(id: string): Promise<void> {
    await prisma.passwordReset.delete({
      where: { id },
    })
  }
// Delete all tokens for user
  
  async deleteByUserId(userId: string): Promise<void> {
    await prisma.passwordReset.deleteMany({
      where: { userId },
    })
  }
// Delete expired tokens
   
  async deleteExpired(): Promise<void> {
    await prisma.passwordReset.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
  }
}

export default new PasswordResetRepository()
