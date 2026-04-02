/**
 * Structured logging stub for the embedded API (replace/extend in Epic E7).
 */
export function logApiInfo(message: string, meta?: Record<string, unknown>): void {
  if (meta !== undefined) {
    console.info(`[star-hotel-api] ${message}`, meta);
  } else {
    console.info(`[star-hotel-api] ${message}`);
  }
}

export function logApiError(message: string, err: unknown, meta?: Record<string, unknown>): void {
  const payload = meta !== undefined ? { ...meta, err } : { err };
  console.error(`[star-hotel-api] ${message}`, payload);
}
