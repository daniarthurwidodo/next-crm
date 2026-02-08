import pino from 'pino';

/**
 * Configure pino for Next.js application
 * - JSON format in production for structured logging
 * - Pretty-printed format in development for readability
 * - Redacts sensitive fields (passwords, tokens, secrets)
 * - Default log level: info (or from LOG_LEVEL env var)
 */

const isDevelopment = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || 'info';

const logger = pino({
  level: logLevel,
  // Redact sensitive fields from logs
  redact: {
    paths: [
      'password',
      '*.password',
      'req.headers.authorization',
      'req.headers.cookie',
      'token',
      '*.token',
      'secret',
      '*.secret',
      'apiKey',
      '*.apiKey',
      'access_token',
      'refresh_token',
    ],
    censor: '[REDACTED]',
  },
  // Pretty print in development, JSON in production
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  // Base fields for all logs
  base: {
    env: process.env.NODE_ENV || 'development',
  },
});

/**
 * Create a child logger with specific context
 * @param context - Context object to attach to all logs from this logger
 * @returns Child logger instance
 * 
 * @example
 * const authLogger = createLogger({ module: 'auth', service: 'login' });
 * authLogger.info('User logged in', { userId: '123' });
 */
export function createLogger(context: Record<string, unknown>) {
  return logger.child(context);
}

export default logger;
