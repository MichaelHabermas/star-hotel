import { ZodError } from 'zod'
import { isHttpMappableError } from './http-mappable'

/** Pure mapping from thrown values to HTTP fields; unhandled errors are surfaced for logging. */
export type MappedHttpError =
  | {
      kind: 'response'
      status: number
      code: string
      message: string
      details?: unknown
    }
  | { kind: 'unhandled'; cause: unknown }

export function mapUnknownErrorToHttpPayload(err: unknown): MappedHttpError {
  if (err instanceof ZodError) {
    return {
      kind: 'response',
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: err.flatten(),
    }
  }
  if (isHttpMappableError(err)) {
    const base = {
      kind: 'response' as const,
      status: err.httpStatus,
      code: err.errorCode,
      message: err.message,
    }
    return err.details === undefined ? base : { ...base, details: err.details }
  }
  return { kind: 'unhandled', cause: err }
}
