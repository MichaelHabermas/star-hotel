import { describe, expect, it } from 'vitest';
import { GuestInUseError, GuestNotFoundError } from './guest-errors';
import type { GuestRow } from './guest-repository';
import { GuestRepository } from './guest-repository';
import { GuestService } from './guest-service';

describe('GuestService', () => {
  it('list maps rows to API shape', () => {
    const rows: GuestRow[] = [{ GuestID: 1, Name: 'A', ID_Number: null, Contact: null }];
    const repo = {
      list: () => rows,
      getById: () => undefined,
    } as unknown as GuestRepository;
    const svc = new GuestService(repo);
    expect(svc.list()).toEqual([{ id: 1, name: 'A', idNumber: null, contact: null }]);
  });

  it('get throws when missing', () => {
    const repo = {
      list: () => [],
      getById: () => undefined,
    } as unknown as GuestRepository;
    const svc = new GuestService(repo);
    expect(() => svc.get(99)).toThrow(GuestNotFoundError);
  });

  it('create returns inserted guest', () => {
    const repo = {
      list: () => [],
      getById: (id: number) =>
        id === 3
          ? ({
              GuestID: 3,
              Name: 'Pat',
              ID_Number: 'P1',
              Contact: null,
            } satisfies GuestRow)
          : undefined,
      insert: () => 3,
    } as unknown as GuestRepository;
    const svc = new GuestService(repo);
    expect(svc.create({ name: 'Pat', idNumber: 'P1' })).toEqual({
      id: 3,
      name: 'Pat',
      idNumber: 'P1',
      contact: null,
    });
  });

  it('delete throws GuestInUseError when reservations still reference the guest', () => {
    const repo = {
      list: () => [],
      getById: () => ({ GuestID: 2, Name: 'X', ID_Number: null, Contact: null }) satisfies GuestRow,
      countReservationsForGuest: () => 1,
      delete: () => true,
    } as unknown as GuestRepository;
    const svc = new GuestService(repo);
    expect(() => svc.delete(2)).toThrow(GuestInUseError);
  });
});
