import type { ApiErrorBody } from '@shared/schemas/api-error';
import type { Response } from 'express';
import { logApiError } from './logger';
import { mapUnknownErrorToHttpPayload } from './map-error-to-http-payload';

export type { ApiErrorBody } from '@shared/schemas/api-error';

export function sendJsonError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
): void {
  const body: ApiErrorBody = { error: { code, message } };
  if (details !== undefined) {
    body.error.details = details;
  }
  res.status(status).json(body);
}

export function mapErrorToHttp(res: Response, err: unknown, logContext: string): void {
  const mapped = mapUnknownErrorToHttpPayload(err);
  if (mapped.kind === 'unhandled') {
    logApiError(logContext, mapped.cause);
    sendJsonError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
    return;
  }
  sendJsonError(res, mapped.status, mapped.code, mapped.message, mapped.details);
}
