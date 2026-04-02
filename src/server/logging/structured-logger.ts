import winston from 'winston';

function resolveLogLevel(): string {
  if (process.env['VITEST'] === 'true' || process.env['NODE_ENV'] === 'test') {
    return 'silent';
  }
  const raw = process.env['STAR_HOTEL_LOG_LEVEL'];
  if (raw === 'silent') {
    return 'silent';
  }
  return raw ?? 'info';
}

/**
 * JSON logs to stderr for errors, stdout for the rest (T7: no request bodies).
 * Used by Express access logs and main-process bootstrap lines.
 */
export function createStructuredLogger(service: string): winston.Logger {
  return winston.createLogger({
    level: resolveLogLevel(),
    defaultMeta: { service },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    ),
    transports: [new winston.transports.Console({ stderrLevels: ['error'] })],
  });
}

/** Express embedded API + HTTP access (see {@link createHttpAccessLogMiddleware}). */
export const embeddedApiLogger = createStructuredLogger('embedded-api');

/** Main process (bootstrap, lifecycle). */
export const mainProcessLogger = createStructuredLogger('main');
