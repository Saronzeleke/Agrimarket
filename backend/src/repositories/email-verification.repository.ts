// Database operations for email verification tokens.

import prisma from '../config/database'
import { EmailVerification } from '@prisma/client'

export class EmailVerificationRepository {
  // Create verification token

  async create(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<EmailVerification> {
    return prisma.emailVerification.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    })
  }
// Find verification by token

  async findByToken(token: string): Promise<EmailVerification | null> {
    return prisma.emailVerification.findUnique({
      where: { token },
    })
  }
// Delete verification token

  async delete(id: string): Promise<void> {
    await prisma.emailVerification.delete({
      where: { id },
    })
  }
//Delete all tokens for user
 
  async deleteByUserId(userId: string): Promise<void> {
    await prisma.emailVerification.deleteMany({
      where: { userId },
    })
  }
//Delete expired tokens

  async deleteExpired(): Promise<void> {
    await prisma.emailVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    })
  }
}

export default new EmailVerificationRepository()
