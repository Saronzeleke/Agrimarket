import { SMTPEmailProvider } from '../../src/providers/email/SMTPEmailProvider';

describe('email provider configuration', () => {
  it('does not simulate successful delivery without SMTP configuration', async () => {
    const provider = new SMTPEmailProvider({
      host: undefined,
      port: undefined,
      secure: undefined,
      user: undefined,
      pass: undefined,
    });

    expect(provider.isConfigured()).toBe(false);
    await expect(provider.verifyConnection()).rejects.toThrow(
      'SMTP transporter not initialized. Check email configuration.'
    );
    await expect(
      provider.sendVerificationEmail('user@example.com', 'verification-token')
    ).rejects.toThrow('SMTP transporter not initialized. Check email configuration.');
  });
});