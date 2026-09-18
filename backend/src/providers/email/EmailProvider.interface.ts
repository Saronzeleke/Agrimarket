/**
 * Email Provider Interface
 * 
 * Abstract interface for email sending implementations.
 */

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface IEmailProvider {
  /**
   * Send an email
   */
  send(options: EmailOptions): Promise<void>

  /**
   * Send verification email
   */
  sendVerificationEmail(email: string, token: string): Promise<void>

  /**
   * Send password reset email
   */
  sendPasswordResetEmail(email: string, token: string): Promise<void>

  /**
   * Send welcome email
   */
  sendWelcomeEmail(email: string, firstName: string): Promise<void>
}
