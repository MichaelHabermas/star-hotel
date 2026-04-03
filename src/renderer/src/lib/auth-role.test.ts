import { describe, expect, it } from 'vitest';
import { isStarHotelAdmin } from './auth-role';

describe('isStarHotelAdmin', () => {
  it('returns true for Admin role (case-insensitive)', () => {
    expect(isStarHotelAdmin({ id: 1, username: 'a', role: 'Admin' })).toBe(true);
    expect(isStarHotelAdmin({ id: 1, username: 'a', role: ' admin ' })).toBe(true);
  });

  it('returns false for non-admin or missing user', () => {
    expect(isStarHotelAdmin({ id: 1, username: 'a', role: 'FrontDesk' })).toBe(false);
    expect(isStarHotelAdmin(null)).toBe(false);
    expect(isStarHotelAdmin(undefined)).toBe(false);
  });
});
