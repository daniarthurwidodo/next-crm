import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Set up environment variables for tests
process.env.SMTP_HOST = 'sandbox.smtp.mailtrap.io';
process.env.SMTP_PORT = '2525';
process.env.SMTP_USER = 'test_user';
process.env.SMTP_PASS = 'test_pass';
process.env.EMAIL_FROM = 'test@example.com';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Mock nodemailer - create mocks before vi.mock call
const mockSendMail = vi.fn();
const mockVerify = vi.fn();

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({
      sendMail: mockSendMail,
      verify: mockVerify,
    })),
  },
}));

// Import after mocks are set up
import {
  sendEmail,
  sendWelcomeEmail,
  sendUploadNotification,
  sendSubscriptionConfirmed,
  sendPaymentFailed,
  sendSubscriptionCancelled,
  sendPasswordReset,
  verifyEmailConfig,
  type UploadDetails,
} from '../../lib/services/emailService';

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default to successful email sending
    mockSendMail.mockResolvedValue({
      messageId: 'test-message-id',
      response: '250 OK',
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      });

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
      });
    });

    it('should retry on failure and eventually succeed', async () => {
      mockSendMail
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce({
          messageId: 'test-message-id',
          response: '250 OK',
        });

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
        retries: 2,
      });

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(2);
    });

    it('should return false after all retries fail', async () => {
      mockSendMail.mockRejectedValue(new Error('Permanent failure'));

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test HTML</p>',
        text: 'Test Text',
        retries: 1,
      });

      expect(result).toBe(false);
      expect(mockSendMail).toHaveBeenCalledTimes(2); // Initial + 1 retry
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email with correct content', async () => {
      const result = await sendWelcomeEmail('user@example.com', 'TestUser');

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('user@example.com');
      expect(callArgs.subject).toContain('Welcome');
      expect(callArgs.html).toContain('TestUser');
      expect(callArgs.html).toContain('dashboard');
      expect(callArgs.text).toContain('TestUser');
    });

    it('should return false on email send failure', async () => {
      mockSendMail.mockRejectedValue(new Error('Send failed'));

      const result = await sendWelcomeEmail('user@example.com', 'TestUser');

      expect(result).toBe(false);
    });
  });

  describe('sendUploadNotification', () => {
    it('should send upload notification with correct details', async () => {
      const uploadDetails: UploadDetails = {
        fileName: 'test-file.pdf',
        fileSize: 1024000, // ~1 MB
        shortcode: 'ABC123',
        uploaderInfo: 'uploader@example.com',
        timestamp: new Date('2026-02-08T12:00:00Z'),
      };

      const result = await sendUploadNotification('user@example.com', uploadDetails);

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('user@example.com');
      expect(callArgs.subject).toContain('test-file.pdf');
      expect(callArgs.html).toContain('test-file.pdf');
      expect(callArgs.html).toContain('ABC123');
      expect(callArgs.html).toContain('uploader@example.com');
      expect(callArgs.text).toContain('test-file.pdf');
    });
  });

  describe('sendSubscriptionConfirmed', () => {
    it('should send subscription confirmation with plan details', async () => {
      const result = await sendSubscriptionConfirmed('user@example.com', 'Pro Plan', 2999);

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('user@example.com');
      expect(callArgs.subject).toContain('Pro Plan');
      expect(callArgs.html).toContain('Pro Plan');
      expect(callArgs.html).toContain('29.99'); // $29.99
      expect(callArgs.text).toContain('Pro Plan');
    });
  });

  describe('sendPaymentFailed', () => {
    it('should send payment failure notification', async () => {
      const retryDate = new Date('2026-02-11T12:00:00Z');
      const result = await sendPaymentFailed('user@example.com', 'Pro Plan', retryDate);

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('user@example.com');
      expect(callArgs.subject).toContain('Payment Failed');
      expect(callArgs.html).toContain('Pro Plan');
      expect(callArgs.html).toContain('2/11/2026');
      expect(callArgs.text).toContain('Pro Plan');
    });
  });

  describe('sendSubscriptionCancelled', () => {
    it('should send cancellation confirmation', async () => {
      const endDate = new Date('2026-03-08T12:00:00Z');
      const result = await sendSubscriptionCancelled('user@example.com', 'Pro Plan', endDate);

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('user@example.com');
      expect(callArgs.subject).toContain('Cancelled');
      expect(callArgs.html).toContain('Pro Plan');
      expect(callArgs.html).toContain('3/8/2026');
      expect(callArgs.text).toContain('Pro Plan');
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email with token link', async () => {
      const result = await sendPasswordReset('user@example.com', 'test-reset-token-123', '1 hour');

      expect(result).toBe(true);
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.to).toBe('user@example.com');
      expect(callArgs.subject).toContain('Password');
      expect(callArgs.html).toContain('test-reset-token-123');
      expect(callArgs.html).toContain('reset-password?token=');
      expect(callArgs.html).toContain('1 hour');
      expect(callArgs.text).toContain('test-reset-token-123');
    });
  });

  describe('verifyEmailConfig', () => {
    it('should verify email configuration successfully', async () => {
      mockVerify.mockResolvedValue(true);

      const result = await verifyEmailConfig();

      expect(result).toBe(true);
      expect(mockVerify).toHaveBeenCalledTimes(1);
    });

    it('should return false on verification failure', async () => {
      mockVerify.mockRejectedValue(new Error('Connection failed'));

      const result = await verifyEmailConfig();

      expect(result).toBe(false);
      expect(mockVerify).toHaveBeenCalledTimes(1);
    });
  });

  describe('Email template content', () => {
    it('should include both HTML and text versions', async () => {
      await sendWelcomeEmail('user@example.com', 'TestUser');
      
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toBeTruthy();
      expect(callArgs.text).toBeTruthy();
      expect(callArgs.html).not.toBe(callArgs.text);
      expect(callArgs.html.length).toBeGreaterThan(callArgs.text.length);
    });

    it('should contain proper HTML structure', async () => {
      await sendWelcomeEmail('user@example.com', 'TestUser');
      
      const callArgs = mockSendMail.mock.calls[0][0];
      expect(callArgs.html).toContain('<!DOCTYPE html>');
      expect(callArgs.html).toContain('<html>');
      expect(callArgs.html).toContain('</html>');
    });
  });
});
