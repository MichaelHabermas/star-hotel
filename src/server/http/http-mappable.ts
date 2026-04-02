/**
 * Errors that carry their own HTTP mapping. {@link mapUnknownErrorToHttpPayload} maps these
 * without importing concrete domain classes — add `httpStatus`, `errorCode`, and optional
 * `details` on new app errors instead of extending the mapper.
 */
export type HttpMappableError = Error & {
  readonly httpStatus: number;
  readonly errorCode: string;
  readonly details?: unknown;
};

export function isHttpMappableError(err: unknown): err is HttpMappableError {
  if (!(err instanceof Error)) {
    return false;
  }
  const o = err as unknown as Record<string, unknown>;
  return (
    typeof o.httpStatus === 'number' &&
    typeof o.errorCode === 'string' &&
    Number.isFinite(o.httpStatus)
  );
}
