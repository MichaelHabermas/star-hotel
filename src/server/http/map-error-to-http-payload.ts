import { ZodError } from 'zod'
import { InvalidIsoDateError } from '../../domain/reservation-pricing'
import { DbConstraintError } from '../db/db-errors'
import {
  GuestNotFoundError,
  ReservationConflictError,
  ReservationNotFoundError,
  RoomNotFoundError,
} from '../reservations/reservation-errors'

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
  if (err instanceof InvalidIsoDateError) {
    return {
      kind: 'response',
      status: 400,
      code: 'INVALID_DATE',
      message: err.message,
    }
  }
  if (err instanceof ReservationNotFoundError) {
    return {
      kind: 'response',
      status: 404,
      code: err.code,
      message: err.message,
    }
  }
  if (err instanceof RoomNotFoundError || err instanceof GuestNotFoundError) {
    return {
      kind: 'response',
      status: 404,
      code: err.code,
      message: err.message,
    }
  }
  if (err instanceof ReservationConflictError) {
    return {
      kind: 'response',
      status: 409,
      code: err.code,
      message: err.message,
    }
  }
  if (err instanceof DbConstraintError) {
    return {
      kind: 'response',
      status: 400,
      code: 'DB_CONSTRAINT',
      message: err.message,
      details: { kind: err.kind },
    }
  }
  return { kind: 'unhandled', cause: err }
}
