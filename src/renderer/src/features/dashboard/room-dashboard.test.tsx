import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider';
import { asStarHotelApp, createMockStarHotelApp } from '@renderer/test-utils/mock-star-hotel-app';
import type { ReservationResponse } from '@shared/schemas/reservation';
import type { RoomResponse } from '@shared/schemas/room';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { JSX } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoomDashboard } from './room-dashboard';

function LocationProbe(): JSX.Element {
  const location = useLocation();
  return (
    <p data-testid="location">
      {location.pathname}
      {location.search}
    </p>
  );
}

function renderDashboard(options?: {
  readonly rooms?: RoomResponse[];
  readonly reservations?: ReservationResponse[];
}) {
  const app = createMockStarHotelApp();
  app.api.rooms.list.mockResolvedValue(options?.rooms ?? []);
  app.api.reservations.list.mockResolvedValue(options?.reservations ?? []);

  render(
    <MemoryRouter initialEntries={['/']}>
      <StarHotelAppProvider app={asStarHotelApp(app)}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <RoomDashboard />
                <LocationProbe />
              </>
            }
          />
        </Routes>
      </StarHotelAppProvider>
    </MemoryRouter>,
  );
}

describe('RoomDashboard', () => {
  afterEach(() => {
    cleanup();
  });

  it('routes an open room tile directly into check-in', async () => {
    renderDashboard({
      rooms: [
        {
          id: 1,
          roomNumber: '501',
          roomType: 'Standard',
          price: 95,
          status: 'Open',
        },
      ],
    });

    const roomButton = await screen.findByRole('button', { name: /501 standard/i });
    fireEvent.click(roomButton);

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/reservations/new?roomId=1');
    });
  });

  it('routes a booked room tile into the existing booking card', async () => {
    renderDashboard({
      rooms: [
        {
          id: 45,
          roomNumber: '401',
          roomType: 'Suite',
          price: 200,
          status: 'Booked',
        },
      ],
      reservations: [
        {
          id: 77,
          roomId: 45,
          guestId: 8,
          checkInDate: '2099-08-01',
          checkOutDate: '2099-08-04',
          totalAmount: 600,
        },
      ],
    });

    const roomButton = await screen.findByRole('button', { name: /401 suite/i });
    fireEvent.click(roomButton);

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/reservations/77');
    });
  });

  it('keeps non-board room numbers visible in an additional rooms section', async () => {
    renderDashboard({
      rooms: [
        {
          id: 1,
          roomNumber: '501',
          roomType: 'Standard',
          price: 95,
          status: 'Open',
        },
        {
          id: 70,
          roomNumber: 'PH1',
          roomType: 'Penthouse',
          price: 450,
          status: 'Maintenance',
        },
      ],
    });

    expect(await screen.findByText(/additional rooms/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /ph1 maintenance no booking on file new booking/i }),
    ).toBeInTheDocument();
  });

  it('recomputes booking snapshot when the calendar day advances while mounted', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
    vi.setSystemTime(new Date(2020, 0, 1, 14, 0, 0));

    renderDashboard({
      rooms: [
        {
          id: 45,
          roomNumber: '401',
          roomType: 'Suite',
          price: 200,
          status: 'Booked',
        },
      ],
      reservations: [
        {
          id: 77,
          roomId: 45,
          guestId: 8,
          checkInDate: '2020-01-02',
          checkOutDate: '2020-01-05',
          totalAmount: 600,
        },
      ],
    });

    const roomButton = await screen.findByRole('button', { name: /401 suite/i });
    fireEvent.click(roomButton);

    expect(await screen.findByText(/Booked for 2020-01-02/i)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(26 * 60 * 60 * 1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/Occupied until 2020-01-05/i)).toBeInTheDocument();
    });
    } finally {
      vi.useRealTimers();
    }
  });

  it('moves across the board with arrow keys and opens the next room with Enter', async () => {
    renderDashboard({
      rooms: [
        {
          id: 1,
          roomNumber: '501',
          roomType: 'Standard',
          price: 95,
          status: 'Open',
        },
        {
          id: 2,
          roomNumber: '502',
          roomType: 'Deluxe',
          price: 120,
          status: 'Open',
        },
      ],
    });

    const room1 = await screen.findByRole('button', { name: /501 standard/i });
    room1.focus();
    fireEvent.keyDown(room1, { key: 'ArrowRight' });

    const room2 = screen.getByRole('button', { name: /502 deluxe/i });
    expect(room2).toHaveFocus();

    fireEvent.keyDown(room2, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/reservations/new?roomId=2');
    });
  });
});
