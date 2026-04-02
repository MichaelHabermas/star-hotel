import type { StarHotelApp } from '@renderer/lib/star-hotel-app';
import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider';
import type { GuestResponse } from '@shared/schemas/guest';
import type { ReservationResponse } from '@shared/schemas/reservation';
import type { RoomResponse } from '@shared/schemas/room';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReservationsListPage } from './reservations-list-page';

const guest: GuestResponse = { id: 3, name: 'Guest One', idNumber: null, contact: null };
const room: RoomResponse = { id: 2, roomType: 'Standard', price: 100, status: 'Vacant' };

const reservation: ReservationResponse = {
  id: 1,
  roomId: 2,
  guestId: 3,
  checkInDate: '2026-01-01',
  checkOutDate: '2026-01-03',
  totalAmount: 200,
};

function createListPageApp(overrides?: {
  readonly reservationsList?: () => Promise<ReservationResponse[]>;
  readonly guestsList?: () => Promise<GuestResponse[]>;
  readonly roomsList?: () => Promise<RoomResponse[]>;
}): StarHotelApp {
  return {
    api: {
      auth: {
        login: vi.fn(),
        logout: vi.fn(),
        me: vi.fn(),
      },
      guests: {
        list: vi.fn(overrides?.guestsList ?? (() => Promise.resolve([guest]))),
      },
      rooms: {
        list: vi.fn(overrides?.roomsList ?? (() => Promise.resolve([room]))),
      },
      reservations: {
        list: vi.fn(overrides?.reservationsList ?? (() => Promise.resolve([reservation]))),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn().mockResolvedValue(undefined),
      },
    },
    formatEmbeddedApiUserMessage: (err: unknown) =>
      err instanceof Error ? err.message : String(err),
  } as unknown as StarHotelApp;
}

function renderListPage(app: StarHotelApp) {
  return render(
    <MemoryRouter initialEntries={['/reservations']}>
      <StarHotelAppProvider app={app}>
        <Routes>
          <Route path="/reservations" element={<ReservationsListPage />} />
        </Routes>
      </StarHotelAppProvider>
    </MemoryRouter>,
  );
}

describe('ReservationsListPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows loading then table row with reservation data', async () => {
    const app = createListPageApp();
    renderListPage(app);

    expect(screen.getByText(/Loading reservations/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('table', { name: /Reservations/i })).toBeInTheDocument();
    });

    const table = screen.getByRole('table', { name: /Reservations/i });
    expect(within(table).getByText('Guest One')).toBeInTheDocument();
    expect(within(table).getByText(/#2 · Standard/i)).toBeInTheDocument();
  });

  it('shows empty message when there are no reservations', async () => {
    const app = createListPageApp({
      reservationsList: () => Promise.resolve([]),
    });
    renderListPage(app);

    await waitFor(() => {
      expect(screen.getByText(/No reservations yet/i)).toBeInTheDocument();
    });
  });

  it('shows error and Retry when list fails', async () => {
    const app = createListPageApp({
      reservationsList: () => Promise.reject(new Error('list failed')),
    });
    renderListPage(app);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/list failed/i);
    });
    expect(screen.getByRole('button', { name: /^Retry$/i })).toBeInTheDocument();
  });
});
