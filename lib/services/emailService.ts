import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { createLogger } from '../logger';
import {
  welcomeEmail,
  uploadNotificationEmail,
  subscriptionConfirmedEmail,
  paymentFailedEmail,
  subscriptionCancelledEmail,
  passwordResetEmail,
  type UploadDetails,
} from './emailTemplates';

const logger = createLogger({ module: 'service', service: 'email' });

/**
 * Email service configuration from environment variables
 */
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: process.env.EMAIL_FROM || 'Next CRM <noreply@nextcrm.com>',
};

/**
 * Detect if we're using Mailtrap sandbox (for development/testing)
 */
const isMailtrapSandbox = EMAIL_CONFIG.host.includes('mailtrap');
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Create and configure nodemailer transporter
 * Uses Mailtrap for development, configurable SMTP for production
 */
export function createTransporter(): Transporter {
  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_CONFIG.host,
      port: EMAIL_CONFIG.port,
      secure: EMAIL_CONFIG.secure,
      auth: EMAIL_CONFIG.auth,
    });

    const env = isMailtrapSandbox ? 'Mailtrap sandbox' : isProduction ? 'production SMTP' : 'custom SMTP';
    logger.info(
      {
        host: EMAIL_CONFIG.host,
        port: EMAIL_CONFIG.port,
        environment: env,
      },
      'Email transporter created'
    );

    return transporter;
  } catch (error) {
    logger.error({ error }, 'Failed to create email transporter');
    throw error;
  }
}

let transporterInstance: Transporter | null = null;

/**
 * Get or create transporter instance (singleton pattern)
 */
function getTransporter(): Transporter {
  if (!transporterInstance) {
    transporterInstance = createTransporter();
  }
  return transporterInstance;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  retries?: number;
}

/**
 * Send an email with retry logic
 * @param options Email options including recipient, subject, and content
 * @returns Promise resolving to success status
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  const { to, subject, html, text, retries = 2 } = options;
  const transporter = getTransporter();

  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      logger.debug(
        {
          to,
          subject,
          attempt: attempt + 1,
          maxRetries: retries + 1,
        },
        'Sending email'
      );

      const info = await transporter.sendMail({
        from: EMAIL_CONFIG.from,
        to,
        subject,
        html,
        text,
      });

      logger.info(
        {
          to,
          subject,
          messageId: info.messageId,
          response: info.response,
        },
        'Email sent successfully'
      );

      return true;
    } catch (error) {
      lastError = error as Error;
      logger.warn(
        {
          to,
          subject,
          attempt: attempt + 1,
          maxRetries: retries + 1,
          error: lastError.message,
        },
        'Email send attempt failed'
      );

      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s, etc.
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  logger.error(
    {
      to,
      subject,
      error: lastError?.message,
      retriesAttempted: retries,
    },
    'Failed to send email after all retries'
  );

  return false;
}

/**
 * Send welcome email to new user
 * @param to Recipient email address
 * @param userName User's name or username
 * @returns Promise resolving to success status
 */
export async function sendWelcomeEmail(to: string, userName: string): Promise<boolean> {
  try {
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
    const template = welcomeEmail(userName, dashboardUrl);
    
    logger.debug({ to, userName }, 'Preparing welcome email');
    
    const success = await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (success) {
      logger.info({ to, userName }, 'Welcome email sent');
    }

    return success;
  } catch (error) {
    logger.error({ error, to, userName }, 'Failed to send welcome email');
    return false;
  }
}

/**
 * Send upload notification email
 * @param to Recipient email address
 * @param details Upload details (filename, size, etc.)
 * @returns Promise resolving to success status
 */
export async function sendUploadNotification(
  to: string,
  details: UploadDetails
): Promise<boolean> {
  try {
    const template = uploadNotificationEmail(details);
    
    logger.debug({ to, fileName: details.fileName, shortcode: details.shortcode }, 'Preparing upload notification');
    
    const success = await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (success) {
      logger.info({ to, fileName: details.fileName, shortcode: details.shortcode }, 'Upload notification sent');
    }

    return success;
  } catch (error) {
    logger.error({ error, to, fileName: details.fileName }, 'Failed to send upload notification');
    return false;
  }
}

/**
 * Send subscription confirmed email
 * @param to Recipient email address
 * @param planName Name of the subscription plan
 * @param amount Amount in cents
 * @returns Promise resolving to success status
 */
export async function sendSubscriptionConfirmed(
  to: string,
  planName: string,
  amount: number
): Promise<boolean> {
  try {
    const template = subscriptionConfirmedEmail(planName, amount);
    
    logger.debug({ to, planName, amount }, 'Preparing subscription confirmation');
    
    const success = await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (success) {
      logger.info({ to, planName }, 'Subscription confirmation sent');
    }

    return success;
  } catch (error) {
    logger.error({ error, to, planName }, 'Failed to send subscription confirmation');
    return false;
  }
}

/**
 * Send payment failed email
 * @param to Recipient email address
 * @param planName Name of the subscription plan
 * @param retryDate Date when payment will be retried
 * @returns Promise resolving to success status
 */
export async function sendPaymentFailed(
  to: string,
  planName: string,
  retryDate: Date
): Promise<boolean> {
  try {
    const template = paymentFailedEmail(planName, retryDate);
    
    logger.debug({ to, planName, retryDate }, 'Preparing payment failed notification');
    
    const success = await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (success) {
      logger.info({ to, planName }, 'Payment failed notification sent');
    }

    return success;
  } catch (error) {
    logger.error({ error, to, planName }, 'Failed to send payment failed notification');
    return false;
  }
}

/**
 * Send subscription cancelled email
 * @param to Recipient email address
 * @param planName Name of the subscription plan
 * @param endDate Date when subscription access ends
 * @returns Promise resolving to success status
 */
export async function sendSubscriptionCancelled(
  to: string,
  planName: string,
  endDate: Date
): Promise<boolean> {
  try {
    const template = subscriptionCancelledEmail(planName, endDate);
    
    logger.debug({ to, planName, endDate }, 'Preparing subscription cancellation confirmation');
    
    const success = await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (success) {
      logger.info({ to, planName }, 'Subscription cancellation confirmation sent');
    }

    return success;
  } catch (error) {
    logger.error({ error, to, planName }, 'Failed to send subscription cancellation confirmation');
    return false;
  }
}

/**
 * Send password reset email
 * @param to Recipient email address
 * @param resetToken Password reset token
 * @param expiresIn Human-readable expiration time (e.g., "1 hour", "30 minutes")
 * @returns Promise resolving to success status
 */
export async function sendPasswordReset(
  to: string,
  resetToken: string,
  expiresIn: string = '1 hour'
): Promise<boolean> {
  try {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const template = passwordResetEmail(resetLink, expiresIn);
    
    logger.debug({ to }, 'Preparing password reset email');
    
    const success = await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    if (success) {
      logger.info({ to }, 'Password reset email sent');
    }

    return success;
  } catch (error) {
    logger.error({ error, to }, 'Failed to send password reset email');
    return false;
  }
}

/**
 * Verify email configuration is valid
 * @returns Promise resolving to true if configuration is valid
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    logger.info('Email configuration verified successfully');
    return true;
  } catch (error) {
    logger.error({ error }, 'Email configuration verification failed');
    return false;
  }
}
