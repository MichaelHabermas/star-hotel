import { z as zod } from './schemas/zod-openapi';

/** Legacy dashboard legend (five states). */
export const ROOM_STATUS_VALUES = [
  'Open',
  'Booked',
  'Occupied',
  'Housekeeping',
  'Maintenance',
] as const;

export type RoomStatus = (typeof ROOM_STATUS_VALUES)[number];

export const roomStatusSchema = zod.enum(ROOM_STATUS_VALUES);

export const ROOM_STATUS_DASHBOARD_CLASSES: Record<RoomStatus, string> = {
  Open: 'bg-emerald-600 text-white border-emerald-800',
  Booked: 'bg-amber-500 text-amber-950 border-amber-700',
  Occupied: 'bg-red-600 text-white border-red-800',
  Housekeeping: 'bg-violet-600 text-white border-violet-900',
  Maintenance: 'bg-sky-600 text-white border-sky-900',
};

const LEGACY_MAP: Readonly<Record<string, RoomStatus>> = {
  open: 'Open',
  available: 'Open',
  vacant: 'Open',
  booked: 'Booked',
  occupied: 'Occupied',
  housekeeping: 'Housekeeping',
  hk: 'Housekeeping',
  maintenance: 'Maintenance',
};

export function coerceRoomStatus(raw: string): RoomStatus | null {
  const t = raw.trim();
  const d = roomStatusSchema.safeParse(t);
  if (d.success) {
    return d.data;
  }
  return LEGACY_MAP[t.toLowerCase()] ?? null;
}

export function normalizeRoomStatusOrOpen(raw: string): RoomStatus {
  return coerceRoomStatus(raw) ?? 'Open';
}
