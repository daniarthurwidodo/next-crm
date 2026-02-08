import { createLogger } from '../logger';
import supabaseService from '../supabase/service';
import { SupabaseClient } from '@supabase/supabase-js';
import { sendPasswordReset } from './emailService';
import jwt from 'jsonwebtoken';
import { hashPassword } from '../utils/auth';

const logger = createLogger({ module: 'service', service: 'password-reset' });
const supabase = supabaseService as SupabaseClient;

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const RESET_TOKEN_EXPIRY = '1h'; // 1 hour

interface ResetTokenPayload {
  email: string;
  type: 'password-reset';
  exp?: number;
}

/**
 * Request a password reset for a user
 * Generates a token and sends reset email
 * @param email User's email address
 * @returns Success status and message
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string; status: number }> {
  try {
    logger.debug({ email }, 'Processing password reset request');

    // Check if user exists
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      logger.info({ email }, 'Password reset requested for non-existent user');
      // Return success anyway to prevent user enumeration
      return {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
        status: 200,
      };
    }

    // Generate password reset token
    const token = jwt.sign(
      {
        email: user.email,
        type: 'password-reset',
      } as ResetTokenPayload,
      JWT_SECRET,
      { expiresIn: RESET_TOKEN_EXPIRY }
    );

    logger.debug({ email }, 'Generated password reset token');

    // Send password reset email (non-blocking)
    const emailSent = await sendPasswordReset(email, token, '1 hour');

    if (!emailSent) {
      logger.error({ email }, 'Failed to send password reset email');
      return {
        success: false,
        message: 'Failed to send password reset email. Please try again later.',
        status: 500,
      };
    }

    logger.info({ email }, 'Password reset email sent successfully');

    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
      status: 200,
    };
  } catch (error) {
    logger.error({ error, email }, 'Error requesting password reset');
    return {
      success: false,
      message: 'An error occurred while processing your request.',
      status: 500,
    };
  }
}

/**
 * Reset user's password using a valid token
 * @param token Password reset token
 * @param newPassword New password to set
 * @returns Success status and message
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string; status: number }> {
  try {
    logger.debug('Processing password reset');

    // Verify and decode token
    let decoded: ResetTokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as ResetTokenPayload;
    } catch (error) {
      logger.warn({ error }, 'Invalid or expired password reset token');
      return {
        success: false,
        message: 'Invalid or expired password reset token.',
        status: 400,
      };
    }

    if (decoded.type !== 'password-reset') {
      logger.warn({ tokenType: decoded.type }, 'Invalid token type for password reset');
      return {
        success: false,
        message: 'Invalid token type.',
        status: 400,
      };
    }

    const email = decoded.email;
    logger.debug({ email }, 'Valid token, resetting password');

    // Get user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      logger.warn({ email }, 'User not found for password reset');
      return {
        success: false,
        message: 'User not found.',
        status: 404,
      };
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user's password in Supabase
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
      user_metadata: {
        ...user.user_metadata,
        password_hash: hashedPassword,
      },
    });

    if (error) {
      logger.error({ error, email }, 'Failed to update password in Supabase');
      return {
        success: false,
        message: 'Failed to reset password. Please try again.',
        status: 500,
      };
    }

    logger.info({ email, userId: user.id }, 'Password reset successfully');

    return {
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
      status: 200,
    };
  } catch (error) {
    logger.error({ error }, 'Error resetting password');
    return {
      success: false,
      message: 'An error occurred while resetting your password.',
      status: 500,
    };
  }
}
