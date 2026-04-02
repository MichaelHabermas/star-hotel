/** Default TCP port for the embedded Express API (main process). Override with `STAR_HOTEL_PORT`. */
export const DEFAULT_API_PORT = 45123;

/**
 * First check-in used by dev reservation seed (`seed-dev-reservations.ts`).
 * Day sheet defaults to this in dev so the report matches seeded data without hunting for a date.
 */
export const DEV_SEED_RESERVATIONS_ANCHOR_DATE = '2025-06-01' as const;
