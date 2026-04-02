import { describe, expect, it } from 'vitest';
import { RoomInUseError, RoomNotFoundError } from './room-errors';
import type { RoomRow } from './room-repository';
import { RoomRepository } from './room-repository';
import { RoomService } from './room-service';

describe('RoomService', () => {
  it('list maps rows to API shape', () => {
    const rows: RoomRow[] = [{ RoomID: 2, RoomType: 'Std', Price: 100, Status: 'Vacant' }];
    const repo = {
      list: () => rows,
      getById: () => undefined,
    } as unknown as RoomRepository;
    const svc = new RoomService(repo);
    expect(svc.list({})).toEqual([{ id: 2, roomType: 'Std', price: 100, status: 'Vacant' }]);
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
          ? ({ RoomID: 7, RoomType: 'Suite', Price: 200, Status: 'Available' } satisfies RoomRow)
          : undefined,
      insert: () => 7,
    } as unknown as RoomRepository;
    const svc = new RoomService(repo);
    expect(svc.create({ roomType: 'Suite', price: 200, status: 'Available' })).toEqual({
      id: 7,
      roomType: 'Suite',
      price: 200,
      status: 'Available',
    });
  });

  it('delete throws RoomInUseError when reservations still reference the room', () => {
    const repo = {
      list: () => [],
      getById: () =>
        ({ RoomID: 1, RoomType: 'A', Price: 50, Status: 'Available' }) satisfies RoomRow,
      countReservationsForRoom: () => 1,
      delete: () => true,
    } as unknown as RoomRepository;
    const svc = new RoomService(repo);
    expect(() => svc.delete(1)).toThrow(RoomInUseError);
  });
});
