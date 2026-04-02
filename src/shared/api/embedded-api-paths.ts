/**
 * Canonical path strings for the embedded loopback API.
 * Used by HTTP clients and OpenAPI parity tests so routes cannot drift silently.
 */
export const EMBEDDED_API_PATHS = {
  health: '/health',
  openapiJson: '/api/openapi.json',
  docs: '/api/docs',
  authLogin: '/api/auth/login',
  authLogout: '/api/auth/logout',
  authMe: '/api/auth/me',
  guests: '/api/guests',
  guestById: (id: number): string => `/api/guests/${id}`,
  rooms: '/api/rooms',
  roomById: (id: number): string => `/api/rooms/${id}`,
  reservations: '/api/reservations',
  reservationById: (id: number): string => `/api/reservations/${id}`,
  reportsFolio: '/api/reports/folio',
  reportsDaySheet: '/api/reports/day-sheet',
} as const;

/** OpenAPI 3 `paths` keys (with `{id}` templates) — must match `starHotelOpenApiDocument.paths`. */
export const EMBEDDED_OPENAPI_DOCUMENTED_PATHS = [
  EMBEDDED_API_PATHS.health,
  EMBEDDED_API_PATHS.authLogin,
  EMBEDDED_API_PATHS.authLogout,
  EMBEDDED_API_PATHS.authMe,
  EMBEDDED_API_PATHS.guests,
  '/api/guests/{id}',
  EMBEDDED_API_PATHS.rooms,
  '/api/rooms/{id}',
  EMBEDDED_API_PATHS.reservations,
  '/api/reservations/{id}',
  EMBEDDED_API_PATHS.reportsFolio,
  EMBEDDED_API_PATHS.reportsDaySheet,
] as const;
