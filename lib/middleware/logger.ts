import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '../logger';

const requestLogger = createLogger({ module: 'http' });

/**
 * Request logging middleware for Next.js API routes
 * Logs incoming requests and responses with timing
 * 
 * @example
 * export async function POST(request: NextRequest) {
 *   return withLogging(request, async (req) => {
 *     // Your route handler logic
 *     return NextResponse.json({ data: 'response' });
 *   });
 * }
 */
export async function withLogging(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const { method, url } = request;
  const pathname = new URL(url).pathname;

  // Log incoming request
  requestLogger.info({
    requestId,
    method,
    path: pathname,
    msg: `${method} ${pathname}`,
  });

  try {
    const response = await handler(request);
    const duration = Date.now() - startTime;

    // Log successful response
    requestLogger.info({
      requestId,
      method,
      path: pathname,
      status: response.status,
      duration,
      msg: `${method} ${pathname} ${response.status} - ${duration}ms`,
    });

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    // Log error response
    requestLogger.error({
      requestId,
      method,
      path: pathname,
      duration,
      error: error instanceof Error ? error.message : 'Unknown error',
      msg: `${method} ${pathname} ERROR - ${duration}ms`,
    });

    throw error;
  }
}
