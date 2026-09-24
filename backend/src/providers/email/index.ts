/**
 * Email Provider Factory
 * 
 * Returns the appropriate email provider based on environment configuration.
 * - Production: Uses SMTP provider for real email sending
 * - Development: Uses Mock provider that logs to console
 */

import { IEmailProvider } from './EmailProvider.interface';
import SMTPEmailProvider from './SMTPEmailProvider';
import MockEmailProvider from './MockEmailProvider';
import config from '../../config/env';
import logger from '../../config/logger';

function getEmailProvider(): IEmailProvider {
  // In production or when SMTP is configured, use SMTP provider
  if (config.isProduction || (config.email.smtp.host && config.email.smtp.port)) {
    logger.info('Using SMTP Email Provider');
    return SMTPEmailProvider;
  }

  // In development without SMTP config, use mock provider
  logger.info('Using Mock Email Provider (Development)');
  return MockEmailProvider;
}

// Export singleton instance
export default getEmailProvider();
