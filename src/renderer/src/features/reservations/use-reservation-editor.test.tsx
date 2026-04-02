import type { FormEvent } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { StarHotelApp } from '@renderer/lib/star-hotel-app'
import type { GuestResponse } from '@shared/schemas/guest'
import type { ReservationResponse } from '@shared/schemas/reservation'
import type { RoomResponse } from '@shared/schemas/room'
import { describe, expect, it, vi } from 'vitest'
import { useReservationEditor } from './use-reservation-editor'

const guest: GuestResponse = { id: 1, name: 'A', idNumber: null, contact: null }
const room: RoomResponse = { id: 1, roomType: 'Standard', price: 100, status: 'vacant' }

function createMockApp(options?: {
  readonly createImpl?: () => Promise<ReservationResponse>
  readonly getImpl?: () => Promise<ReservationResponse>
}): {
  readonly app: StarHotelApp
  readonly create: ReturnType<typeof vi.fn>
} {
  const create = vi.fn<() => Promise<ReservationResponse>>(
    options?.createImpl ??
      (() =>
        Promise.resolve({
          id: 1,
          roomId: 1,
          guestId: 1,
          checkInDate: '2026-01-10',
          checkOutDate: '2026-01-12',
          totalAmount: 200,
        })),
  )

  const app = {
    api: {
      guests: { list: vi.fn().mockResolvedValue([guest]) },
      rooms: { list: vi.fn().mockResolvedValue([room]) },
      reservations: {
        list: vi.fn().mockResolvedValue([]),
        get:
          options?.getImpl ??
          vi.fn().mockResolvedValue({
            id: 1,
            roomId: 1,
            guestId: 1,
            checkInDate: '2026-01-10',
            checkOutDate: '2026-01-12',
            totalAmount: 200,
          }),
        create,
        update: vi.fn().mockResolvedValue({
          id: 1,
          roomId: 1,
          guestId: 1,
          checkInDate: '2026-01-10',
          checkOutDate: '2026-01-12',
          totalAmount: 200,
        }),
        delete: vi.fn().mockResolvedValue(undefined),
      },
    },
    formatEmbeddedApiUserMessage: (err: unknown) => (err instanceof Error ? err.message : String(err)),
  } as unknown as StarHotelApp

  return { app, create }
}

function submit(ev: Pick<FormEvent, 'preventDefault'>): FormEvent {
  return ev as FormEvent
}

describe('useReservationEditor', () => {
  it('sets fieldErr when create submission fails Zod validation', async () => {
    const { app } = createMockApp()
    const navigate = vi.fn()

    const { result } = renderHook(() =>
      useReservationEditor(app, {
        mode: 'create',
        editId: 0,
        editIdValid: false,
        navigate,
      }),
    )

    await waitFor(() => {
      expect(result.current.catalog.loading).toBe(false)
    })

    await act(async () => {
      await result.current.onSubmit(submit({ preventDefault: vi.fn() }))
    })

    expect(result.current.fieldErr).toBeTruthy()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('creates a reservation and navigates on success', async () => {
    const { app, create } = createMockApp()
    const navigate = vi.fn()

    const { result } = renderHook(() =>
      useReservationEditor(app, {
        mode: 'create',
        editId: 0,
        editIdValid: false,
        navigate,
      }),
    )

    await waitFor(() => {
      expect(result.current.catalog.loading).toBe(false)
    })

    await act(async () => {
      result.current.setGuestId('1')
      result.current.setRoomId('1')
      result.current.setCheckInDate('2026-01-10')
      result.current.setCheckOutDate('2026-01-12')
    })

    await act(async () => {
      await result.current.onSubmit(submit({ preventDefault: vi.fn() }))
    })

    expect(create).toHaveBeenCalledWith({
      guestId: 1,
      roomId: 1,
      checkInDate: '2026-01-10',
      checkOutDate: '2026-01-12',
    })
    expect(navigate).toHaveBeenCalledWith('/reservations')
    expect(result.current.submitErr).toBeNull()
  })

  it('sets submitErr when the API rejects on create', async () => {
    const { app } = createMockApp({
      createImpl: () => Promise.reject(new Error('overlap')),
    })
    const navigate = vi.fn()

    const { result } = renderHook(() =>
      useReservationEditor(app, {
        mode: 'create',
        editId: 0,
        editIdValid: false,
        navigate,
      }),
    )

    await waitFor(() => {
      expect(result.current.catalog.loading).toBe(false)
    })

    await act(async () => {
      result.current.setGuestId('1')
      result.current.setRoomId('1')
      result.current.setCheckInDate('2026-01-10')
      result.current.setCheckOutDate('2026-01-12')
    })

    await act(async () => {
      await result.current.onSubmit(submit({ preventDefault: vi.fn() }))
    })

    expect(result.current.submitErr).toBe('overlap')
    expect(navigate).not.toHaveBeenCalled()
  })

  it('sets loadErr when edit load fails', async () => {
    const { app } = createMockApp({
      getImpl: () => Promise.reject(new Error('not found')),
    })
    const navigate = vi.fn()

    const { result } = renderHook(() =>
      useReservationEditor(app, {
        mode: 'edit',
        editId: 99,
        editIdValid: true,
        navigate,
      }),
    )

    await waitFor(() => {
      expect(result.current.loadState).toBe('err')
    })

    expect(result.current.loadErr).toBe('not found')
  })
})
