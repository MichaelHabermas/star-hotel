import type { Response } from 'express'
import { ZodError } from 'zod'
import { InvalidIsoDateError } from '../../domain/reservation-pricing'
import { DbConstraintError } from '../db/db-errors'
import {
  GuestNotFoundError,
  ReservationConflictError,
  ReservationNotFoundError,
  RoomNotFoundError,
} from '../reservations/reservation-errors'
import { logApiError } from './logger'

export type ApiErrorBody = {
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export function sendJsonError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown,
): void {
  const body: ApiErrorBody = { error: { code, message } }
  if (details !== undefined) {
    body.error.details = details
  }
  res.status(status).json(body)
}

export function mapErrorToHttp(res: Response, err: unknown, logContext: string): void {
  if (err instanceof ZodError) {
    sendJsonError(res, 400, 'VALIDATION_ERROR', 'Request validation failed', err.flatten())
    return
  }
  if (err instanceof InvalidIsoDateError) {
    sendJsonError(res, 400, 'INVALID_DATE', err.message)
    return
  }
  if (err instanceof ReservationNotFoundError) {
    sendJsonError(res, 404, err.code, err.message)
    return
  }
  if (err instanceof RoomNotFoundError || err instanceof GuestNotFoundError) {
    sendJsonError(res, 404, err.code, err.message)
    return
  }
  if (err instanceof ReservationConflictError) {
    sendJsonError(res, 409, err.code, err.message)
    return
  }
  if (err instanceof DbConstraintError) {
    sendJsonError(res, 400, 'DB_CONSTRAINT', err.message, { kind: err.kind })
    return
  }
  logApiError(logContext, err)
  sendJsonError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred')
}
