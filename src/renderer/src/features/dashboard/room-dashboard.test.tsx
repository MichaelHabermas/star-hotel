import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider';
import { asStarHotelApp, createMockStarHotelApp } from '@renderer/test-utils/mock-star-hotel-app';
import type { ReservationResponse } from '@shared/schemas/reservation';
import type { RoomResponse } from '@shared/schemas/room';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { JSX } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
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
          roomNumber: '101',
          roomType: 'Standard',
          price: 95,
          status: 'Open',
        },
      ],
    });

    const roomButton = await screen.findByRole('button', { name: /101 open/i });
    fireEvent.click(roomButton);

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/reservations/new?roomId=1');
    });
  });

  it('routes a booked room tile into the existing booking card', async () => {
    renderDashboard({
      rooms: [
        {
          id: 4,
          roomNumber: '104',
          roomType: 'Suite',
          price: 200,
          status: 'Booked',
        },
      ],
      reservations: [
        {
          id: 77,
          roomId: 4,
          guestId: 8,
          checkInDate: '2099-08-01',
          checkOutDate: '2099-08-04',
          totalAmount: 600,
        },
      ],
    });

    const roomButton = await screen.findByRole('button', { name: /104 booked/i });
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
          roomNumber: '101',
          roomType: 'Standard',
          price: 95,
          status: 'Open',
        },
        {
          id: 9,
          roomNumber: '501',
          roomType: 'Penthouse',
          price: 450,
          status: 'Maintenance',
        },
      ],
    });

    expect(await screen.findByText(/additional rooms/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /501 maintenance no booking on file/i }),
    ).toBeInTheDocument();
  });

  it('moves across the board with arrow keys and opens the next room with Enter', async () => {
    renderDashboard({
      rooms: [
        {
          id: 1,
          roomNumber: '101',
          roomType: 'Standard',
          price: 95,
          status: 'Open',
        },
        {
          id: 2,
          roomNumber: '102',
          roomType: 'Deluxe',
          price: 120,
          status: 'Open',
        },
      ],
    });

    const room101 = await screen.findByRole('button', { name: /101 open/i });
    room101.focus();
    fireEvent.keyDown(room101, { key: 'ArrowRight' });

    const room102 = screen.getByRole('button', { name: /102 open/i });
    expect(room102).toHaveFocus();

    fireEvent.keyDown(room102, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent('/reservations/new?roomId=2');
    });
  });
});
