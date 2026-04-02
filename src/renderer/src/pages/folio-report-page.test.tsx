import type { StarHotelApp } from '@renderer/lib/star-hotel-app';
import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider';
import type { FolioReportResponse } from '@shared/schemas/report';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FolioReportPage } from './folio-report-page';

const folioOk: FolioReportResponse = {
  generatedAt: '2026-01-15T12:00:00.000Z',
  reservation: {
    id: 1,
    roomId: 2,
    guestId: 3,
    checkInDate: '2026-01-10',
    checkOutDate: '2026-01-12',
    totalAmount: 200,
    nights: 2,
  },
  guest: { id: 3, name: 'Test Guest', idNumber: null, contact: null },
  room: { id: 2, roomType: 'Standard', price: 100, status: 'occupied' },
};

function createApp(overrides?: {
  readonly getFolio?: (id: number) => Promise<FolioReportResponse>;
}): StarHotelApp {
  return {
    api: {
      auth: { login: vi.fn(), logout: vi.fn(), me: vi.fn() },
      guests: { list: vi.fn() },
      rooms: { list: vi.fn() },
      reservations: {
        list: vi.fn(),
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      reports: {
        getFolio: vi.fn(overrides?.getFolio ?? (() => Promise.resolve(folioOk))),
        getDaySheet: vi.fn(),
      },
    },
    formatEmbeddedApiUserMessage: (err: unknown) =>
      err instanceof Error ? err.message : String(err),
  } as unknown as StarHotelApp;
}

function renderFolio(app: StarHotelApp, path = '/reports/folio/1') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StarHotelAppProvider app={app}>
        <Routes>
          <Route path="/reports/folio/:reservationId" element={<FolioReportPage />} />
        </Routes>
      </StarHotelAppProvider>
    </MemoryRouter>,
  );
}

describe('FolioReportPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders folio title and guest name after load', async () => {
    const app = createApp();
    renderFolio(app);

    expect(await screen.findByText(/Guest folio \/ receipt/i)).toBeInTheDocument();
    expect(screen.getByText('Test Guest')).toBeInTheDocument();
    expect(app.api.reports.getFolio).toHaveBeenCalledWith(1);
  });

  it('shows error alert when folio load fails', async () => {
    const app = createApp({
      getFolio: () => Promise.reject(new Error('not found')),
    });
    renderFolio(app);

    expect(await screen.findByRole('alert')).toHaveTextContent(/not found/i);
  });

  it('shows invalid id message for non-numeric reservation param', async () => {
    const app = createApp();
    renderFolio(app, '/reports/folio/abc');

    expect(await screen.findByRole('alert')).toHaveTextContent(/Invalid reservation id/i);
    await waitFor(() => {
      expect(app.api.reports.getFolio).not.toHaveBeenCalled();
    });
  });
});
