import type { StarHotelApp } from '@renderer/lib/star-hotel-app';
import type { GuestResponse } from '@shared/schemas/guest';
import type { RoomResponse } from '@shared/schemas/room';
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGuestRoomCatalog } from './use-guest-room-catalog';

function createMockApp(): {
  readonly app: StarHotelApp;
  readonly resolveAll: () => void;
} {
  const finishers: Array<() => void> = [];

  const guestsList = vi.fn(
    () =>
      new Promise<GuestResponse[]>((resolve) => {
        finishers.push(() => {
          resolve([]);
        });
      }),
  );

  const roomsList = vi.fn(
    () =>
      new Promise<RoomResponse[]>((resolve) => {
        finishers.push(() => {
          resolve([]);
        });
      }),
  );

  const app = {
    api: {
      guests: { list: guestsList },
      rooms: { list: roomsList },
    },
    formatEmbeddedApiUserMessage: () => 'test error',
  } as unknown as StarHotelApp;

  return {
    app,
    resolveAll: () => {
      for (const done of finishers) {
        done();
      }
      finishers.length = 0;
    },
  };
}

describe('useGuestRoomCatalog', () => {
  it('does not set state after unmount when list requests resolve late', async () => {
    const { app, resolveAll } = createMockApp();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { unmount } = renderHook(() => useGuestRoomCatalog(app));

    await waitFor(() => {
      expect(app.api.guests.list).toHaveBeenCalled();
      expect(app.api.rooms.list).toHaveBeenCalled();
    });

    unmount();

    await act(async () => {
      resolveAll();
      await Promise.resolve();
    });

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
