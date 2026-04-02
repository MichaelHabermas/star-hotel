import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider';
import {
  asStarHotelApp,
  createMockStarHotelApp,
  type MockStarHotelApp,
} from '@renderer/test-utils/mock-star-hotel-app';
import type { GuestResponse } from '@shared/schemas/guest';
import type { RoomResponse } from '@shared/schemas/room';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ReservationFormPage } from './reservation-form-page';

const guest: GuestResponse = { id: 1, name: 'Guest One', idNumber: null, contact: null };
const room: RoomResponse = { id: 1, roomType: 'Standard', price: 100, status: 'vacant' };

function createListApp(overrides?: {
  readonly guestsList?: () => Promise<GuestResponse[]>;
  readonly roomsList?: () => Promise<RoomResponse[]>;
}): MockStarHotelApp {
  const app = createMockStarHotelApp();
  app.api.guests.list.mockImplementation(overrides?.guestsList ?? (() => Promise.resolve([guest])));
  app.api.rooms.list.mockImplementation(overrides?.roomsList ?? (() => Promise.resolve([room])));
  app.api.reservations.list.mockResolvedValue([]);
  app.api.reservations.create.mockResolvedValue({
    id: 1,
    roomId: 1,
    guestId: 1,
    checkInDate: '2026-01-10',
    checkOutDate: '2026-01-12',
    totalAmount: 200,
  });
  return app;
}

function renderCreatePage(app: MockStarHotelApp) {
  return render(
    <MemoryRouter initialEntries={['/reservations/new']}>
      <StarHotelAppProvider app={asStarHotelApp(app)}>
        <Routes>
          <Route path="/reservations/new" element={<ReservationFormPage mode="create" />} />
        </Routes>
      </StarHotelAppProvider>
    </MemoryRouter>,
  );
}

describe('ReservationFormPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows catalog error alert and Retry when guest list fails', async () => {
    const app = createListApp({
      guestsList: () => Promise.reject(new Error('network down')),
    });

    renderCreatePage(app);

    expect(await screen.findByRole('alert')).toHaveTextContent(/Could not load guests or rooms/i);
    expect(screen.getByRole('button', { name: /^Retry$/i })).toBeInTheDocument();
  });

  it('shows field validation message after submit with empty required fields', async () => {
    const app = createListApp();

    const { container } = renderCreatePage(app);

    await waitFor(() => {
      expect(screen.queryByText(/Loading guests and rooms/i)).not.toBeInTheDocument();
    });

    const form = container.querySelector('form');
    expect(form).not.toBeNull();

    const submitBtn = within(form as HTMLElement).getByRole('button', {
      name: /Create reservation/i,
    });
    fireEvent.click(submitBtn);

    const alert = await within(form as HTMLElement).findByRole('alert');
    expect(alert.textContent).not.toMatch(/Could not load guests or rooms/i);
    expect(alert.textContent?.length).toBeGreaterThan(0);
  });
});
