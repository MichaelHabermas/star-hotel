import { z as zod } from './schemas/zod-openapi';

export const HOTEL_MODULE_KEYS = [
  'close',
  'reports',
  'customers',
  'rooms',
  'users',
  'access',
  'alerts',
  'security',
] as const;

export type HotelModuleKey = (typeof HOTEL_MODULE_KEYS)[number];

export const hotelModuleKeySchema = zod.enum(HOTEL_MODULE_KEYS);

export const HOTEL_MODULE_LABELS: Record<HotelModuleKey, string> = {
  close: 'Close / Home (Esc)',
  reports: 'Reports (F2)',
  customers: 'Customers (F3)',
  rooms: 'Rooms (F4)',
  users: 'Users (F5)',
  access: 'Module access (F6)',
  alerts: 'Alerts / Blink (legacy F7 removed from shell)',
  security: 'Security (F8)',
};
