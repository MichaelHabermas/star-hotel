import { ZodError } from 'zod'
import { describe, expect, it } from 'vitest'
import { InvalidIsoDateError } from '../../domain/reservation-pricing'
import { DbConstraintError } from '../db/db-errors'
import { GuestNotFoundError } from '../guests/guest-errors'
import { RoomNotFoundError } from '../rooms/room-errors'
import {
  ReservationConflictError,
  ReservationNotFoundError,
} from '../reservations/reservation-errors'
import { mapUnknownErrorToHttpPayload } from './map-error-to-http-payload'

/** Local test double: new HTTP-mappable errors need no changes to map-error-to-http-payload.ts. */
class EphemeralTeapotError extends Error {
  readonly httpStatus = 418 as const
  readonly errorCode = 'TEAPOT' as const
  constructor() {
    super('short and stout')
    this.name = 'EphemeralTeapotError'
  }
}

describe('mapUnknownErrorToHttpPayload', () => {
  it('maps ZodError to 400 validation', () => {
    const err = new ZodError([
      { code: 'custom', message: 'bad', path: ['x'] },
    ])
    const r = mapUnknownErrorToHttpPayload(err)
    expect(r).toMatchObject({
      kind: 'response',
      status: 400,
      code: 'VALIDATION_ERROR',
    })
    if (r.kind === 'response') {
      expect(r.details).toBeDefined()
    }
  })

  it('maps InvalidIsoDateError', () => {
    const r = mapUnknownErrorToHttpPayload(new InvalidIsoDateError('nope'))
    expect(r).toEqual({
      kind: 'response',
      status: 400,
      code: 'INVALID_DATE',
      message: 'nope',
    })
  })

  it('maps reservation domain errors', () => {
    expect(mapUnknownErrorToHttpPayload(new ReservationNotFoundError(3))).toMatchObject({
      kind: 'response',
      status: 404,
      code: 'NOT_FOUND',
    })
    expect(mapUnknownErrorToHttpPayload(new RoomNotFoundError(9))).toMatchObject({
      kind: 'response',
      status: 404,
      code: 'ROOM_NOT_FOUND',
    })
    expect(mapUnknownErrorToHttpPayload(new GuestNotFoundError(2))).toMatchObject({
      kind: 'response',
      status: 404,
      code: 'GUEST_NOT_FOUND',
    })
    expect(mapUnknownErrorToHttpPayload(new ReservationConflictError())).toMatchObject({
      kind: 'response',
      status: 409,
      code: 'RESERVATION_OVERLAP',
    })
  })

  it('maps DbConstraintError', () => {
    const r = mapUnknownErrorToHttpPayload(
      new DbConstraintError('fk failed', 'FOREIGN_KEY', 'SQLITE_CONSTRAINT_FOREIGNKEY'),
    )
    expect(r).toEqual({
      kind: 'response',
      status: 400,
      code: 'DB_CONSTRAINT',
      message: 'fk failed',
      details: { kind: 'FOREIGN_KEY' },
    })
  })

  it('returns unhandled for unknown errors', () => {
    const r = mapUnknownErrorToHttpPayload(new Error('boom'))
    expect(r).toEqual({ kind: 'unhandled', cause: expect.any(Error) })
  })

  it('maps arbitrary HttpMappable errors without mapper imports', () => {
    expect(mapUnknownErrorToHttpPayload(new EphemeralTeapotError())).toEqual({
      kind: 'response',
      status: 418,
      code: 'TEAPOT',
      message: 'short and stout',
    })
  })
})
