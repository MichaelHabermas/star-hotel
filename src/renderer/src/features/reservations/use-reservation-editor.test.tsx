import { asStarHotelApp, createMockStarHotelApp } from '@renderer/test-utils/mock-star-hotel-app';
import type { GuestResponse } from '@shared/schemas/guest';
import type { ReservationResponse } from '@shared/schemas/reservation';
import type { RoomResponse } from '@shared/schemas/room';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useReservationEditor } from './use-reservation-editor';

const guest: GuestResponse = { id: 1, name: 'A', idNumber: null, contact: null };
const room: RoomResponse = {
  id: 1,
  roomNumber: '101',
  roomType: 'Standard',
  price: 100,
  status: 'Open',
};

const defaultReservation: ReservationResponse = {
  id: 1,
  roomId: 1,
  guestId: 1,
  checkInDate: '2026-01-10',
  checkOutDate: '2026-01-12',
  totalAmount: 200,
};

function createMockApp(options?: {
  readonly createImpl?: () => Promise<ReservationResponse>;
  readonly getImpl?: () => Promise<ReservationResponse>;
}): {
  readonly app: ReturnType<typeof createMockStarHotelApp>;
  readonly create: ReturnType<typeof vi.fn>;
} {
  const app = createMockStarHotelApp();
  app.api.guests.list.mockResolvedValue([guest]);
  app.api.rooms.list.mockResolvedValue([room]);
  app.api.reservations.list.mockResolvedValue([]);
  const create = vi.fn<() => Promise<ReservationResponse>>(
    options?.createImpl ?? (() => Promise.resolve(defaultReservation)),
  );
  app.api.reservations.create.mockImplementation(create);
  app.api.reservations.get.mockImplementation(
    options?.getImpl ?? (() => Promise.resolve(defaultReservation)),
  );
  app.api.reservations.update.mockResolvedValue(defaultReservation);
  app.api.reservations.delete.mockResolvedValue(undefined);
  return { app, create };
}

function submit(ev: Pick<FormEvent, 'preventDefault'>): FormEvent {
  return ev as FormEvent;
}

describe('useReservationEditor', () => {
  it('sets fieldErr when create submission fails Zod validation', async () => {
    const { app } = createMockApp();
    const navigate = vi.fn();

    const { result } = renderHook(() =>
      useReservationEditor(asStarHotelApp(app), {
        mode: 'create',
        editId: 0,
        editIdValid: false,
        navigate,
      }),
    );

    await waitFor(() => {
      expect(result.current.catalog.loading).toBe(false);
    });

    await act(async () => {
      await result.current.onSubmit(submit({ preventDefault: vi.fn() }));
    });

    expect(result.current.fieldErr).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('creates a reservation and navigates on success', async () => {
    const { app, create } = createMockApp();
    const navigate = vi.fn();

    const { result } = renderHook(() =>
      useReservationEditor(asStarHotelApp(app), {
        mode: 'create',
        editId: 0,
        editIdValid: false,
        navigate,
      }),
    );

    await waitFor(() => {
      expect(result.current.catalog.loading).toBe(false);
    });

    await act(async () => {
      result.current.setGuestId('1');
      result.current.setRoomId('1');
      result.current.setCheckInDate('2026-01-10');
      result.current.setCheckOutDate('2026-01-12');
    });

    await act(async () => {
      await result.current.onSubmit(submit({ preventDefault: vi.fn() }));
    });

    expect(create).toHaveBeenCalledWith({
      guestId: 1,
      roomId: 1,
      checkInDate: '2026-01-10',
      checkOutDate: '2026-01-12',
    });
    expect(navigate).toHaveBeenCalledWith('/reservations');
    expect(result.current.submitErr).toBeNull();
  });

  it('sets submitErr when the API rejects on create', async () => {
    const { app } = createMockApp({
      createImpl: () => Promise.reject(new Error('overlap')),
    });
    const navigate = vi.fn();

    const { result } = renderHook(() =>
      useReservationEditor(asStarHotelApp(app), {
        mode: 'create',
        editId: 0,
        editIdValid: false,
        navigate,
      }),
    );

    await waitFor(() => {
      expect(result.current.catalog.loading).toBe(false);
    });

    await act(async () => {
      result.current.setGuestId('1');
      result.current.setRoomId('1');
      result.current.setCheckInDate('2026-01-10');
      result.current.setCheckOutDate('2026-01-12');
    });

    await act(async () => {
      await result.current.onSubmit(submit({ preventDefault: vi.fn() }));
    });

    expect(result.current.submitErr).toBe('overlap');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('sets loadErr when edit load fails', async () => {
    const { app } = createMockApp({
      getImpl: () => Promise.reject(new Error('not found')),
    });
    const navigate = vi.fn();

    const { result } = renderHook(() =>
      useReservationEditor(asStarHotelApp(app), {
        mode: 'edit',
        editId: 99,
        editIdValid: true,
        navigate,
      }),
    );

    await waitFor(() => {
      expect(result.current.loadState).toBe('err');
    });

    expect(result.current.loadErr).toBe('not found');
  });
});
