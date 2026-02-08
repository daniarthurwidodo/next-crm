import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/services/passwordResetService';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ module: 'api', route: 'reset-password' });

/**
 * POST /api/auth/reset-password
 * Reset password using a valid token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    // Validate input
    if (!token || typeof token !== 'string') {
      logger.warn('Missing or invalid token in reset password request');
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      logger.warn('Missing or invalid password in reset password request');
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      logger.warn('Password too short in reset password request');
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    logger.info('Processing password reset');

    // Reset password
    const result = await resetPassword(token, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: result.status }
      );
    }

    return NextResponse.json(
      { message: result.message },
      { status: result.status }
    );
  } catch (error) {
    logger.error({ error }, 'Error processing reset password request');
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}
