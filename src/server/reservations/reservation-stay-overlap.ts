/**
 * Half-open stay overlap: [newIn, newOut) vs [existingIn, existingOut).
 * Matches the SQL predicate `existingIn < newOut AND existingOut > newIn` (ISO `YYYY-MM-DD` dates).
 */
export function stayRangesOverlapHalfOpen(
  newCheckIn: string,
  newCheckOut: string,
  existingCheckIn: string,
  existingCheckOut: string,
): boolean {
  return existingCheckIn < newCheckOut && existingCheckOut > newCheckIn;
}
