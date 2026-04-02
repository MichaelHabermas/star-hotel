import { StarHotelAppProvider } from '@renderer/lib/star-hotel-app-provider';
import {
  asStarHotelApp,
  createMockStarHotelApp,
  type MockStarHotelApp,
} from '@renderer/test-utils/mock-star-hotel-app';
import { DEV_SEED_RESERVATIONS_ANCHOR_DATE } from '@shared/constants';
import type { DaySheetReportResponse } from '@shared/schemas/report';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { DaySheetReportPage } from './day-sheet-report-page';

const sheetOk: DaySheetReportResponse = {
  date: DEV_SEED_RESERVATIONS_ANCHOR_DATE,
  totalRooms: 10,
  occupancyCount: 2,
  occupancyRate: 0.2,
  lines: [
    {
      reservationId: 1,
      roomId: 1,
      roomType: 'Standard',
      guestName: 'One',
      checkInDate: '2026-01-10',
      checkOutDate: '2026-01-15',
    },
  ],
};

function createApp(overrides?: {
  readonly getDaySheet?: (date: string) => Promise<DaySheetReportResponse>;
}): MockStarHotelApp {
  const app = createMockStarHotelApp();
  app.api.reports.getDaySheet.mockImplementation(
    overrides?.getDaySheet ?? (() => Promise.resolve(sheetOk)),
  );
  return app;
}

function renderDaySheet(app: MockStarHotelApp) {
  return render(
    <MemoryRouter initialEntries={['/reports/day-sheet']}>
      <StarHotelAppProvider app={asStarHotelApp(app)}>
        <Routes>
          <Route path="/reports/day-sheet" element={<DaySheetReportPage />} />
        </Routes>
      </StarHotelAppProvider>
    </MemoryRouter>,
  );
}

describe('DaySheetReportPage', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders day sheet title and calls API with dev default date in test env', async () => {
    const app = createApp();
    renderDaySheet(app);

    expect(await screen.findByText(/^Day sheet$/)).toBeInTheDocument();
    expect(screen.getByText('One')).toBeInTheDocument();
    await waitFor(() => {
      expect(app.api.reports.getDaySheet).toHaveBeenCalledWith(DEV_SEED_RESERVATIONS_ANCHOR_DATE);
    });
  });

  it('shows error alert when day sheet load fails', async () => {
    const app = createApp({
      getDaySheet: () => Promise.reject(new Error('server error')),
    });
    renderDaySheet(app);

    expect(await screen.findByRole('alert')).toHaveTextContent(/server error/i);
  });
});
