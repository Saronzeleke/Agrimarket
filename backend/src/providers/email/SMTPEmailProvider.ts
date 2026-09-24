/**
 * SMTP Email Provider
 * 
 * Production email provider using SMTP (Nodemailer).
 * Supports any SMTP service: Gmail, AWS SES, SendGrid SMTP, custom SMTP servers, etc.
 */

import nodemailer, { Transporter } from 'nodemailer'
import { IEmailProvider, EmailOptions } from './EmailProvider.interface'
import logger from '../../config/logger'
import config from '../../config/env'

export class SMTPEmailProvider implements IEmailProvider {
  private transporter: Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  private initializeTransporter(): void {
    const { smtp } = config.email

    // Only initialize if SMTP credentials are provided
    if (!smtp.host || !smtp.port) {
      logger.warn('SMTP credentials not configured. Email sending will fail.')
      return
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure || false, // true for 465, false for other ports
        auth: smtp.user && smtp.pass ? {
          user: smtp.user,
          pass: smtp.pass,
        } : undefined,
        // Connection timeout
        connectionTimeout: 10000,
        // Socket timeout
        socketTimeout: 10000,
      })

      // Verify connection on initialization
      this.transporter.verify((error) => {
        if (error) {
          logger.error('SMTP connection failed', { error: error.message })
        } else {
          logger.info('✅ SMTP Email provider ready')
        }
      })
    } catch (error: any) {
      logger.error('Failed to initialize SMTP transporter', {
        error: error.message,
      })
    }
  }

  async send(options: EmailOptions): Promise<void> {
    if (!this.transporter) {
      throw new Error('SMTP transporter not initialized. Check email configuration.')
    }

    try {
      const result = await this.transporter.sendMail({
        from: `${config.email.fromName} <${config.email.from}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      })

      logger.info('📧 Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: result.messageId,
      })
    } catch (error: any) {
      logger.error('Failed to send email', {
        to: options.to,
        subject: options.subject,
        error: error.message,
      })
      throw error
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${config.frontendUrl}/verify-email?token=${token}`

    await this.send({
      to: email,
      subject: 'Verify Your AgriMarket Email',
      text: `
Welcome to AgriMarket!

Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
The AgriMarket Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #16a34a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to AgriMarket!</h1>
    </div>
    <div class="content">
      <h2>Verify Your Email Address</h2>
      <p>Thank you for registering with AgriMarket. Please verify your email address by clicking the button below:</p>
      <a href="${verificationUrl}" class="button">Verify Email</a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        This link will expire in 24 hours. If you didn't create an account, please ignore this email.
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2026 AgriMarket. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    })
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`

    await this.send({
      to: email,
      subject: 'Reset Your AgriMarket Password',
      text: `
Password Reset Request

We received a request to reset your password. Click the link below to reset it:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Best regards,
The AgriMarket Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>We received a request to reset your password. Click the button below to reset it:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <div class="warning">
        <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2026 AgriMarket. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    })
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    await this.send({
      to: email,
      subject: 'Welcome to AgriMarket!',
      text: `
Hi ${firstName},

Welcome to AgriMarket! Your email has been verified and your account is now active.

You can now:
- Browse quality agricultural products
- Add items to your cart
- Place orders
- Track your deliveries

Start shopping: ${config.frontendUrl}/products

Best regards,
The AgriMarket Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background: #16a34a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .features { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
    .features li { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Welcome to AgriMarket!</h1>
    </div>
    <div class="content">
      <h2>Hi ${firstName},</h2>
      <p>Your email has been verified and your account is now active!</p>
      <div class="features">
        <h3>You can now:</h3>
        <ul>
          <li>✓ Browse quality agricultural products</li>
          <li>✓ Add items to your cart</li>
          <li>✓ Place orders</li>
          <li>✓ Track your deliveries</li>
        </ul>
      </div>
      <a href="${config.frontendUrl}/products" class="button">Start Shopping</a>
      <p style="margin-top: 30px;">If you have any questions, feel free to contact our support team.</p>
    </div>
    <div class="footer">
      <p>&copy; 2026 AgriMarket. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    })
  }
}

export default new SMTPEmailProvider()
