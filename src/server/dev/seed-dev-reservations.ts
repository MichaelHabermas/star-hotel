import { DEV_SEED_RESERVATIONS_ANCHOR_DATE } from '@shared/constants';
import type DatabaseType from 'better-sqlite3';
import { ReservationRepository } from '../reservations/reservation-repository';
import { ReservationService } from '../reservations/reservation-service';

type SqliteDatabase = InstanceType<typeof DatabaseType>;

/** Target count for unpackaged dev seed (plan: 30–50, fixed for deterministic tests). */
export const DEV_FAKE_RESERVATION_COUNT = 40;

const SEED_GUEST_ROW_COUNT = 45;

const ANCHOR_CHECK_IN = DEV_SEED_RESERVATIONS_ANCHOR_DATE;
const SEED_ROOM_ROWS: readonly { type: string; price: number; status: string }[] = [
  { type: 'Standard', price: 99, status: 'Available' },
  { type: 'Standard', price: 109, status: 'Available' },
  { type: 'Deluxe', price: 149, status: 'Available' },
  { type: 'Deluxe', price: 159, status: 'Available' },
  { type: 'Suite', price: 229, status: 'Available' },
  { type: 'Standard', price: 95, status: 'Available' },
  { type: 'Deluxe', price: 169, status: 'Occupied' },
  { type: 'Standard', price: 104, status: 'Available' },
  { type: 'Suite', price: 259, status: 'Available' },
  { type: 'Deluxe', price: 139, status: 'Available' },
  { type: 'Standard', price: 89, status: 'Available' },
  { type: 'Deluxe', price: 179, status: 'Available' },
  { type: 'Suite', price: 289, status: 'Available' },
  { type: 'Standard', price: 119, status: 'Available' },
  { type: 'Deluxe', price: 154, status: 'Available' },
  { type: 'Standard', price: 92, status: 'Available' },
  { type: 'Suite', price: 239, status: 'Available' },
  { type: 'Deluxe', price: 164, status: 'Available' },
];

const FIRST_NAMES = [
  'Alex',
  'Jordan',
  'Taylor',
  'Casey',
  'Riley',
  'Morgan',
  'Quinn',
  'Avery',
  'Parker',
  'Reese',
  'Skyler',
  'Drew',
  'Cameron',
  'Jamie',
  'Blake',
  'Rowan',
  'Sage',
  'Emery',
  'Finley',
  'Hayden',
] as const;

const LAST_NAMES = [
  'Nguyen',
  'Patel',
  'Garcia',
  'Kim',
  'Silva',
  'Okafor',
  'Yamamoto',
  'Andersen',
  'Kowalski',
  'Fernandez',
  'Nakamura',
  'Haddad',
  'Olsen',
  'Costa',
  'Murphy',
  'Reyes',
  'Schmidt',
  'Park',
  'Ibrahim',
  'Lopez',
] as const;

function addDaysIso(iso: string, days: number): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) {
    throw new Error(`seed: expected YYYY-MM-DD, got ${iso}`);
  }
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const t = Date.UTC(y, mo - 1, d) + days * 86_400_000;
  const dt = new Date(t);
  const ys = dt.getUTCFullYear();
  const ms = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const ds = String(dt.getUTCDate()).padStart(2, '0');
  return `${ys}-${ms}-${ds}`;
}

function reservationCount(db: SqliteDatabase): number {
  const row = db.prepare('SELECT COUNT(*) AS c FROM tbl_reservation').get() as { c: number };
  return Number(row.c);
}

function ensureSeedRooms(db: SqliteDatabase): void {
  const row = db.prepare('SELECT COUNT(*) AS c FROM tbl_room').get() as { c: number };
  if (Number(row.c) > 0) {
    return;
  }
  const ins = db.prepare(
    'INSERT INTO tbl_room (RoomType, Price, Status) VALUES (@type, @price, @status)',
  );
  const run = db.transaction(() => {
    for (const r of SEED_ROOM_ROWS) {
      ins.run({ type: r.type, price: r.price, status: r.status });
    }
  });
  run();
}

function ensureSeedGuests(db: SqliteDatabase): void {
  const row = db.prepare('SELECT COUNT(*) AS c FROM tbl_guest').get() as { c: number };
  if (Number(row.c) > 0) {
    return;
  }
  const ins = db.prepare(
    'INSERT INTO tbl_guest (Name, ID_Number, Contact) VALUES (@name, @id, @contact)',
  );
  const run = db.transaction(() => {
    for (let i = 0; i < SEED_GUEST_ROW_COUNT; i += 1) {
      const fn = FIRST_NAMES[i % FIRST_NAMES.length];
      const ln = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
      const name = `${fn} ${ln} ${i + 1}`;
      ins.run({
        name,
        id: `DEV-ID-${String(i + 1).padStart(3, '0')}`,
        contact: `dev.guest.${i + 1}@example.local`,
      });
    }
  });
  run();
}

/**
 * Idempotent dev seed: only runs when `tbl_reservation` is empty.
 * Ensures baseline rooms/guests when those tables are empty, then inserts {@link DEV_FAKE_RESERVATION_COUNT} reservations via {@link ReservationService}.
 */
export function seedDevReservationsIfNeeded(db: SqliteDatabase): void {
  if (reservationCount(db) > 0) {
    return;
  }
  ensureSeedRooms(db);
  ensureSeedGuests(db);

  const roomIds = (
    db.prepare('SELECT RoomID FROM tbl_room ORDER BY RoomID ASC').all() as { RoomID: number }[]
  ).map((r) => r.RoomID);
  const guestIds = (
    db.prepare('SELECT GuestID FROM tbl_guest ORDER BY GuestID ASC').all() as { GuestID: number }[]
  ).map((g) => g.GuestID);

  if (roomIds.length === 0 || guestIds.length === 0) {
    throw new Error('[star-hotel] dev seed: need at least one room and one guest');
  }

  const svc = new ReservationService(new ReservationRepository(db));
  const roomCount = roomIds.length;
  const guestCount = guestIds.length;

  for (let i = 0; i < DEV_FAKE_RESERVATION_COUNT; i += 1) {
    const roomId = roomIds[i % roomCount]!;
    const guestId = guestIds[i % guestCount]!;
    const slot = Math.floor(i / roomCount);
    const checkInDate = addDaysIso(ANCHOR_CHECK_IN, slot * 7);
    const nights = 1 + (i % 4);
    const checkOutDate = addDaysIso(checkInDate, nights);
    svc.create({ roomId, guestId, checkInDate, checkOutDate });
  }
}
