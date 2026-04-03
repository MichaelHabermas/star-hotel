import type { AuthUserResponse } from '@shared/schemas/auth';

/** Matches {@link RequireAdmin} in `require-auth.tsx`. */
export function isStarHotelAdmin(user: AuthUserResponse | null | undefined): boolean {
  return user != null && user.role.trim().toLowerCase() === 'admin';
}
