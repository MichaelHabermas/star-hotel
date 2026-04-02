import {
  asStarHotelApp,
  createMockStarHotelApp,
  type MockStarHotelApp,
} from '@renderer/test-utils/mock-star-hotel-app';
import type { ReservationResponse } from '@shared/schemas/reservation';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useReservationsList } from './use-reservations-list';

const sampleRow: ReservationResponse = {
  id: 1,
  roomId: 2,
  guestId: 3,
  checkInDate: '2026-01-01',
  checkOutDate: '2026-01-03',
  totalAmount: 200,
};

function mockApp(reservations: Partial<MockStarHotelApp['api']['reservations']>): MockStarHotelApp {
  const app = createMockStarHotelApp();
  Object.assign(app.api.reservations, {
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...reservations,
  });
  return app;
}

describe('useReservationsList', () => {
  it('transitions to ok with rows from api.reservations.list', async () => {
    const app = mockApp({
      list: vi.fn().mockResolvedValue([sampleRow]),
    });
    const { result } = renderHook(() => useReservationsList(asStarHotelApp(app)));

    await waitFor(() => {
      expect(result.current.list).toEqual({ kind: 'ok', rows: [sampleRow] });
    });
    expect(app.api.reservations.list).toHaveBeenCalledWith({});
  });

  it('sets err when list fails', async () => {
    const app = mockApp({
      list: vi.fn().mockRejectedValue(new Error('network failed')),
    });
    const { result } = renderHook(() => useReservationsList(asStarHotelApp(app)));

    await waitFor(() => {
      expect(result.current.list).toEqual({ kind: 'err', message: 'network failed' });
    });
  });
});
