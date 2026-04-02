import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { StarHotelApp } from '@renderer/lib/star-hotel-app'
import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider'
import type { GuestResponse } from '@shared/schemas/guest'
import type { RoomResponse } from '@shared/schemas/room'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ReservationFormPage } from './reservation-form-page'

const guest: GuestResponse = { id: 1, name: 'Guest One', idNumber: null, contact: null }
const room: RoomResponse = { id: 1, roomType: 'Standard', price: 100, status: 'vacant' }

function createListApp(overrides?: {
  readonly guestsList?: () => Promise<GuestResponse[]>
  readonly roomsList?: () => Promise<RoomResponse[]>
}): StarHotelApp {
  return {
    api: {
      guests: {
        list: vi.fn(overrides?.guestsList ?? (() => Promise.resolve([guest]))),
      },
      rooms: {
        list: vi.fn(overrides?.roomsList ?? (() => Promise.resolve([room]))),
      },
      reservations: {
        list: vi.fn().mockResolvedValue([]),
        get: vi.fn(),
        create: vi.fn().mockResolvedValue({
          id: 1,
          roomId: 1,
          guestId: 1,
          checkInDate: '2026-01-10',
          checkOutDate: '2026-01-12',
          totalAmount: 200,
        }),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
    formatEmbeddedApiUserMessage: (err: unknown) => (err instanceof Error ? err.message : String(err)),
  } as unknown as StarHotelApp
}

function renderCreatePage(app: StarHotelApp) {
  return render(
    <MemoryRouter initialEntries={['/reservations/new']}>
      <StarHotelAppProvider app={app}>
        <Routes>
          <Route path="/reservations/new" element={<ReservationFormPage mode="create" />} />
        </Routes>
      </StarHotelAppProvider>
    </MemoryRouter>,
  )
}

describe('ReservationFormPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('shows catalog error alert and Retry when guest list fails', async () => {
    const app = createListApp({
      guestsList: () => Promise.reject(new Error('network down')),
    })

    renderCreatePage(app)

    expect(await screen.findByRole('alert')).toHaveTextContent(/Could not load guests or rooms/i)
    expect(screen.getByRole('button', { name: /^Retry$/i })).toBeInTheDocument()
  })

  it('shows field validation message after submit with empty required fields', async () => {
    const app = createListApp()

    const { container } = renderCreatePage(app)

    await waitFor(() => {
      expect(screen.queryByText(/Loading guests and rooms/i)).not.toBeInTheDocument()
    })

    const form = container.querySelector('form')
    expect(form).not.toBeNull()

    const submitBtn = within(form as HTMLElement).getByRole('button', { name: /Create reservation/i })
    fireEvent.click(submitBtn)

    const alert = await within(form as HTMLElement).findByRole('alert')
    expect(alert.textContent).not.toMatch(/Could not load guests or rooms/i)
    expect(alert.textContent?.length).toBeGreaterThan(0)
  })
})
