import { describe, expect, it } from 'vitest';
import { RoomInUseError, RoomNotFoundError } from './room-errors';
import type { RoomRow } from './room-repository';
import { RoomRepository } from './room-repository';
import { RoomService } from './room-service';

describe('RoomService', () => {
  it('list maps rows to API shape', () => {
    const rows: RoomRow[] = [
      { RoomID: 2, RoomNumber: '201', RoomType: 'Std', Price: 100, Status: 'Open' },
    ];
    const repo = {
      list: () => rows,
      getById: () => undefined,
    } as unknown as RoomRepository;
    const svc = new RoomService(repo);
    expect(svc.list({})).toEqual([
      { id: 2, roomNumber: '201', roomType: 'Std', price: 100, status: 'Open' },
    ]);
  });

  it('get throws when missing', () => {
    const repo = {
      list: () => [],
      getById: () => undefined,
    } as unknown as RoomRepository;
    const svc = new RoomService(repo);
    expect(() => svc.get(1)).toThrow(RoomNotFoundError);
  });

  it('create returns inserted room', () => {
    const repo = {
      list: () => [],
      getById: (id: number) =>
        id === 7
          ? ({
              RoomID: 7,
              RoomNumber: '701',
              RoomType: 'Suite',
              Price: 200,
              Status: 'Open',
            } satisfies RoomRow)
          : undefined,
      insert: () => 7,
    } as unknown as RoomRepository;
    const svc = new RoomService(repo);
    expect(
      svc.create({ roomNumber: '701', roomType: 'Suite', price: 200, status: 'Open' }),
    ).toEqual({
      id: 7,
      roomNumber: '701',
      roomType: 'Suite',
      price: 200,
      status: 'Open',
    });
  });

  it('delete throws RoomInUseError when reservations still reference the room', () => {
    const repo = {
      list: () => [],
      getById: () =>
        ({
          RoomID: 1,
          RoomNumber: '101',
          RoomType: 'A',
          Price: 50,
          Status: 'Open',
        }) satisfies RoomRow,
      countReservationsForRoom: () => 1,
      delete: () => true,
    } as unknown as RoomRepository;
    const svc = new RoomService(repo);
    expect(() => svc.delete(1)).toThrow(RoomInUseError);
  });
});
