import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider';
import {
  asStarHotelApp,
  createMockStarHotelApp,
  type MockStarHotelApp,
} from '@renderer/test-utils/mock-star-hotel-app';
import type { GuestResponse } from '@shared/schemas/guest';
import type { ReservationResponse } from '@shared/schemas/reservation';
import type { RoomResponse } from '@shared/schemas/room';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ReservationsListPage } from './reservations-list-page';

const guest: GuestResponse = { id: 3, name: 'Guest One', idNumber: null, contact: null };
const room: RoomResponse = {
  id: 2,
  roomNumber: '201',
  roomType: 'Standard',
  price: 100,
  status: 'Open',
};

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
}): MockStarHotelApp {
  const app = createMockStarHotelApp();
  app.api.guests.list.mockImplementation(overrides?.guestsList ?? (() => Promise.resolve([guest])));
  app.api.rooms.list.mockImplementation(overrides?.roomsList ?? (() => Promise.resolve([room])));
  app.api.reservations.list.mockImplementation(
    overrides?.reservationsList ?? (() => Promise.resolve([reservation])),
  );
  app.api.reservations.delete.mockResolvedValue(undefined);
  return app;
}

function renderListPage(app: MockStarHotelApp) {
  return render(
    <MemoryRouter initialEntries={['/reservations']}>
      <StarHotelAppProvider app={asStarHotelApp(app)}>
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
