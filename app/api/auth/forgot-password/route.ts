import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/services/passwordResetService';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ module: 'api', route: 'forgot-password' });

/**
 * POST /api/auth/forgot-password
 * Request a password reset email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email || typeof email !== 'string') {
      logger.warn('Missing or invalid email in forgot password request');
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn({ email }, 'Invalid email format in forgot password request');
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    logger.info({ email }, 'Processing forgot password request');

    // Request password reset
    const result = await requestPasswordReset(email);

    return NextResponse.json(
      { message: result.message },
      { status: result.status }
    );
  } catch (error) {
    logger.error({ error }, 'Error processing forgot password request');
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
