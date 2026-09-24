// Email Service , Handles sending emails through the email provider.
import { NotificationType } from '@prisma/client';
import prisma from '../config/database';
import logger from '../config/logger';
import emailProvider from '../providers/email';

export const emailService = {
  // Send notification email
 
  async sendNotificationEmail(
    userId: string,
    notification: {
      type: NotificationType;
      title: string;
      message: string;
      metadata?: any;
    }
  ) {
    try {
      // Get user email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true, lastName: true },
      });

      if (!user) {
        logger.warn(`User ${userId} not found for email notification`);
        return;
      }

      // Format email based on notification type
      const emailData = this.formatNotificationEmail(notification, user);

      // Send email
      await emailProvider.send({
        to: user.email,
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      });

      logger.info(`Email sent to ${user.email} for notification type ${notification.type}`);
    } catch (error) {
      logger.error('Failed to send notification email:', error);
      throw error;
    }
  },
// Format notification email content
  formatNotificationEmail(
    notification: {
      type: NotificationType;
      title: string;
      message: string;
      metadata?: any;
    },
    user: { firstName: string; lastName: string }
  ) {
    const userName = `${user.firstName} ${user.lastName}`;

    const subject = notification.title;
    const text = `Hello ${userName},\n\n${notification.message}\n\nBest regards,\nAgriMarket Team`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>AgriMarket</h1>
          </div>
          <div class="content">
            <h2>${notification.title}</h2>
            <p>Hello ${userName},</p>
            <p>${notification.message}</p>
            ${this.getNotificationTypeSpecificContent(notification)}
          </div>
          <div class="footer">
            <p>&copy; 2024 AgriMarket. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, text, html };
  },
// Get notification type-specific content for emails
  
  getNotificationTypeSpecificContent(notification: {
    type: NotificationType;
    metadata?: any;
  }): string {
    switch (notification.type) {
      case NotificationType.ORDER_CREATED:
      case NotificationType.ORDER_CONFIRMED:
      case NotificationType.ORDER_SHIPPED:
      case NotificationType.ORDER_DELIVERED:
      case NotificationType.ORDER_CANCELLED:
        return '<p><a href="http://localhost:3000/orders" class="button">View Order</a></p>';
      
      case NotificationType.LOW_STOCK:
        return '<p><a href="http://localhost:3000/seller/inventory" class="button">Manage Inventory</a></p>';
      
      case NotificationType.NEW_REVIEW:
        return '<p><a href="http://localhost:3000/seller/reviews" class="button">View Review</a></p>';
      
      case NotificationType.ACCOUNT_VERIFICATION:
        return '<p><a href="http://localhost:3000/verify-email" class="button">Verify Email</a></p>';
      
      case NotificationType.PASSWORD_RESET:
        return '<p><a href="http://localhost:3000/reset-password" class="button">Reset Password</a></p>';
      
      default:
        return '';
    }
  },
 // Send welcome email
  async sendWelcomeEmail(email: string, firstName: string) {
    try {
      await emailProvider.send({
        to: email,
        subject: 'Welcome to AgriMarket!',
        text: `Hello ${firstName},\n\nWelcome to AgriMarket! We're excited to have you join our community.\n\nBest regards,\nAgriMarket Team`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome to AgriMarket!</h1>
              </div>
              <div class="content">
                <p>Hello ${firstName},</p>
                <p>Welcome to AgriMarket! We're excited to have you join our community of farmers, buyers, and agricultural enthusiasts.</p>
                <p>Start exploring fresh, quality agricultural products from local farmers and sellers.</p>
                <h3>Get Started:</h3>
                <ul>
                  <li>Browse our product catalog</li>
                  <li>Add items to your wishlist</li>
                  <li>Make your first purchase</li>
                  <li>Leave reviews to help others</li>
                </ul>
              </div>
              <div class="footer">
                <p>&copy; 2024 AgriMarket. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      logger.info(`Welcome email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send welcome email:', error);
    }
  },
// Send order confirmation email
  async sendOrderConfirmationEmail(
    email: string,
    firstName: string,
    orderDetails: {
      orderNumber: string;
      total: number;
      items: Array<{ name: string; quantity: number; price: number }>;
    }
  ) {
    try {
      const itemsList = orderDetails.items
        .map((item) => `${item.name} (${item.quantity}x) - ${item.price} ETB`)
        .join('\n');

      await emailProvider.send({
        to: email,
        subject: `Order Confirmation - #${orderDetails.orderNumber}`,
        text: `Hello ${firstName},\n\nYour order has been confirmed!\n\nOrder #${orderDetails.orderNumber}\n\nItems:\n${itemsList}\n\nTotal: ${orderDetails.total} ETB\n\nThank you for your purchase!\n\nBest regards,\nAgriMarket Team`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; background-color: #f9f9f9; }
              .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
              .order-items { background: white; padding: 15px; margin: 15px 0; border-radius: 4px; }
              .order-item { padding: 10px 0; border-bottom: 1px solid #eee; }
              .total { font-size: 18px; font-weight: bold; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Order Confirmed!</h1>
              </div>
              <div class="content">
                <p>Hello ${firstName},</p>
                <p>Thank you for your order! Your order <strong>#${orderDetails.orderNumber}</strong> has been confirmed and is being prepared.</p>
                <div class="order-items">
                  <h3>Order Items:</h3>
                  ${orderDetails.items.map((item) => `
                    <div class="order-item">
                      ${item.name} (${item.quantity}x) - ${item.price} ETB
                    </div>
                  `).join('')}
                  <div class="total">Total: ${orderDetails.total} ETB</div>
                </div>
                <p>We'll notify you when your order ships.</p>
              </div>
              <div class="footer">
                <p>&copy; 2024 AgriMarket. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      logger.info(`Order confirmation email sent to ${email}`);
    } catch (error) {
      logger.error('Failed to send order confirmation email:', error);
    }
  },
};
