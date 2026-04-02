import { describe, expect, it } from 'vitest';
import { RoomNotFoundError } from './room-errors';
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
});
