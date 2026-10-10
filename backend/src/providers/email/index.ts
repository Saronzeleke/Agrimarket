/**
 * Email Provider Factory
 * 
 * Provides real SMTP delivery only. Missing SMTP configuration is an explicit
 * unavailable state; email delivery is never simulated.
 */

import { IEmailProvider } from './EmailProvider.interface';
import SMTPEmailProvider from './SMTPEmailProvider';
import logger from '../../config/logger';

function getEmailProvider(): IEmailProvider {
  if (!SMTPEmailProvider.isConfigured()) {
    logger.warn('SMTP is not configured. Email-dependent actions are unavailable.');
  } else {
    logger.info('Using SMTP Email Provider');
  }

  return SMTPEmailProvider;
}

// Export singleton instance
export default getEmailProvider();
